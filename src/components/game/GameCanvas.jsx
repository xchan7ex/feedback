import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
import '../../styles/GameCanvas.css'
import MissionInfoModal from './MissionInfoModal'
import MissionQuizModal from './MissionQuizModal'
import LetterHunt from './LetterHunt'
import TreasureHunt from './TreasureHunt'
import { NoticeBoardSystem } from './noticeboard/NoticeBoardSystem'
import doorsData from '../../data/doors.json'

// Patch Three.js to use BVH-accelerated raycasting (massive speedup for complex meshes)
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

function GameCanvas({ selectedBuilding, teleportTarget, onFloorChange, missions, setMissions }) {
  const containerRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [modelError, setModelError] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [currentMission, setCurrentMission] = useState(null)
  const [missionCubes, setMissionCubes] = useState([])
  const [interactionTarget, setInteractionTarget] = useState(null)
  const [sceneInstance, setSceneInstance] = useState(null)

  // Refs for scene and mission cubes (accessible outside useEffect)
  const sceneRef = useRef(null)
  const cubesRef = useRef([])

  // ─── Input State ───
  const [isLocked, setIsLocked] = useState(false)
  const noticeBoardSystemRef = useRef(null)


  // ─── Mouse State (Pointer Lock) ───
  const inputState = useRef({
    isLocked: false
  })

  // ─── Player Reference ───
  const playerRef = useRef(null)

  // ─── Player State (Ref for persistence) ───
  const playerState = useRef({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    sprint: false,
    speed: 0.12,
    sprintMultiplier: 2,
    currentY: 0,
    targetY: 0
  })

  const teleportCameraRotationY = useRef(null)
  const cameraSettingsRef = useRef(null)

  // ─── Handle Teleportation ───
  useEffect(() => {
    if (teleportTarget && playerRef.current) {
      if (teleportTarget.walk) {
        // Set auto-walk target instead of instant teleportation
        playerState.current.autoWalkTarget = teleportTarget.coordinates
        playerState.current.crossFloorTarget = teleportTarget.crossFloor || null;
        console.log(`Auto-walking to ${teleportTarget.name} at (${teleportTarget.coordinates.x}, ${teleportTarget.coordinates.y}, ${teleportTarget.coordinates.z})`)
      } else {
        // Instant teleportation (existing logic)
        const { x, y, z } = teleportTarget.coordinates
        playerRef.current.position.set(x, y, z)

        playerState.current.currentY = y
        playerState.current.targetY = y

        if (teleportTarget.rotationY !== undefined) {
          teleportCameraRotationY.current = teleportTarget.rotationY
          playerRef.current.rotation.y = teleportTarget.rotationY
        }

        playerState.current.moveForward = false
        playerState.current.moveBackward = false
        playerState.current.moveLeft = false
        playerState.current.moveRight = false
        playerState.current.sprint = false

        // Clear any existing walk target just to be sure
        playerState.current.autoWalkTarget = null

        console.log(`Teleported to ${teleportTarget.name} at (${x}, ${y}, ${z})`)
      }
    }
  }, [teleportTarget])

  useEffect(() => {
    if (!containerRef.current) return

    // ─── Create mission collectible (Exclamation Mark) ───
    // ─── Create mission collectible (Exclamation Mark) ───
    const createMissionCubes = (scene) => {
      const cubeRefs = []

      // Reuse geometry and material for better performance
      const lineGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15)
      const dotGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15)
      const material = new THREE.MeshStandardMaterial({
        color: 0x00BFFF,
        emissive: 0x00BFFF,
        emissiveIntensity: 1.5, // Increased intensity since we removed the light
        metalness: 0.8,
        roughness: 0.2
      })

      missions.forEach((mission) => {
        const markGroup = new THREE.Group()
        markGroup.position.set(
          mission.coordinates.x,
          mission.coordinates.y,
          mission.coordinates.z
        )

        const line = new THREE.Mesh(lineGeometry, material)
        line.position.y = 0.5
        // Disable shadow casting for performance
        line.castShadow = false
        markGroup.add(line)

        const dot = new THREE.Mesh(dotGeometry, material)
        dot.position.y = 0
        dot.castShadow = false
        markGroup.add(dot)

        // Removed PointLight to fix lag - emissive material is enough

        markGroup.userData = { missionId: mission.id }
        scene.add(markGroup)
        cubeRefs.push({ mesh: markGroup, mission })
      })
      return cubeRefs
    }

    // ─── Core Variables ───
    let animationId
    let collidableMeshes = []
    let mixer = null
    let animations = {}
    let currentAction = null
    const clock = new THREE.Clock()

    // ─── Door Labels ───
    const doorLabels = []
    const LABEL_VISIBLE_DISTANCE = 15

    // ─── Create Text Texture for Door Label ───
    function createTextTexture(text) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = 512
      canvas.height = 128

      // Background (dark navy - matches game UI)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'
      ctx.beginPath()
      ctx.roundRect(0, 0, canvas.width, canvas.height, 16)
      ctx.fill()

      // Border (blue accent - matches game theme)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.roundRect(2, 2, canvas.width - 4, canvas.height - 4, 14)
      ctx.stroke()

      // Text Formatting
      ctx.fillStyle = '#e2e8f0'
      const fontSize = 42 // Slightly smaller to fit more lines
      ctx.font = `bold ${fontSize}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Word wrapping logic
      const words = text.split(' ')
      const lines = []
      let currentLine = words[0]
      const maxWidth = canvas.width - 60 // Margin

      for (let i = 1; i < words.length; i++) {
        const word = words[i]
        const width = ctx.measureText(currentLine + " " + word).width
        if (width < maxWidth) {
          currentLine += " " + word
        } else {
          lines.push(currentLine)
          currentLine = word
        }
      }
      lines.push(currentLine)

      // Render lines
      const lineHeight = fontSize * 1.1
      const totalHeight = lines.length * lineHeight
      const startY = (canvas.height - totalHeight) / 2 + lineHeight / 2

      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight))
      })

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      return texture
    }

    // ─── Create Door Label Mesh ───
    function createDoorLabel(doorData) {
      const texture = createTextTexture(doorData.name)

      const geometry = new THREE.PlaneGeometry(0.6, 0.2)
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      })

      const label = new THREE.Mesh(geometry, material)

      label.position.set(
        doorData.position.x,
        doorData.position.y,
        doorData.position.z
      )

      const yRotation = (doorData.rotation.y || 0) * Math.PI / 180
      label.rotation.y = yRotation

      label.userData = { id: doorData.id, name: doorData.name }

      return label
    }

    // ─── Load Door Labels from JSON ───
    function loadDoorLabels(buildingId) {
      try {
        const buildingDoors = doorsData[buildingId] || []

        // Clear existing door labels from scene and array
        doorLabels.forEach(label => {
          label.geometry.dispose()
          if (label.material.map) label.material.map.dispose()
          label.material.dispose()
          scene.remove(label)
        })
        doorLabels.length = 0

        buildingDoors.forEach(doorData => {
          const label = createDoorLabel(doorData)
          scene.add(label)
          doorLabels.push(label)
        })

        console.log(`Loaded ${doorLabels.length} door labels for ${buildingId}`)
      } catch (error) {
        console.error('Error loading door labels:', error)
      }
    }

    // ─── Update Label Visibility Based on Distance ───
    function updateLabelVisibility(playerPos) {
      doorLabels.forEach(label => {
        const distance = playerPos.distanceTo(label.position)
        label.visible = distance <= LABEL_VISIBLE_DISTANCE
      })
    }

    // ─── Spatial Grid for Collision Optimization ───
    // Instead of raycasting against ALL meshes, we only check nearby ones
    const GRID_CELL_SIZE = 10
    const spatialGrid = new Map()

    function getCellKey(x, z) {
      const cx = Math.floor(x / GRID_CELL_SIZE)
      const cz = Math.floor(z / GRID_CELL_SIZE)
      return `${cx},${cz}`
    }

    function addMeshToGrid(mesh) {
      // Get mesh world bounding box
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
      const box = new THREE.Box3().setFromObject(mesh)

      const minCX = Math.floor(box.min.x / GRID_CELL_SIZE)
      const maxCX = Math.floor(box.max.x / GRID_CELL_SIZE)
      const minCZ = Math.floor(box.min.z / GRID_CELL_SIZE)
      const maxCZ = Math.floor(box.max.z / GRID_CELL_SIZE)

      for (let cx = minCX; cx <= maxCX; cx++) {
        for (let cz = minCZ; cz <= maxCZ; cz++) {
          const key = `${cx},${cz}`
          if (!spatialGrid.has(key)) spatialGrid.set(key, [])
          spatialGrid.get(key).push(mesh)
        }
      }
    }

    function getNearbyMeshes(position) {
      const cx = Math.floor(position.x / GRID_CELL_SIZE)
      const cz = Math.floor(position.z / GRID_CELL_SIZE)
      const nearby = []
      // Check 3x3 grid around player
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const key = `${cx + dx},${cz + dz}`
          const cell = spatialGrid.get(key)
          if (cell) {
            for (const mesh of cell) {
              if (!nearby.includes(mesh)) nearby.push(mesh)
            }
          }
        }
      }
      return nearby
    }

    // ─── Scene Setup ───
    const scene = new THREE.Scene()
    sceneRef.current = scene
    setSceneInstance(scene)
    scene.background = new THREE.Color(0x87CEEB)
    scene.fog = new THREE.Fog(0x87CEEB, 100, 500)

    // ─── Camera (Third Person) ───
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    // ─── Renderer (Shadows Disabled) ───
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = false // Shadows disabled
    containerRef.current.appendChild(renderer.domElement)

    // ─── Lighting (No shadows) ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(50, 100, 50)
    directionalLight.castShadow = false
    scene.add(directionalLight)

    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x7cba6d, 0.5)
    scene.add(hemiLight)

    // ─── Ground Plane (backup floor) ───
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x7cba6d,
      roughness: 0.9
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.1
    scene.add(ground)

    // ─── Building Initial Spawn Points ───
    const buildingSpawns = {
      'gp-square': { x: -15, y: 0, z: -4 },
      'spencer': { x: -10, y: 0, z: -10 }, // Edit Spencer spawn here
      'ramakrishna': { x: 5, y: 0, z: 5 }  // Edit Ramakrishna spawn here
    }
    const spawnPos = buildingSpawns[selectedBuilding] || { x: 0, y: 0, z: 0 }

    // ─── Create Player Group ───
    const player = new THREE.Group()
    playerRef.current = player
    player.position.set(spawnPos.x, spawnPos.y, spawnPos.z)
    scene.add(player)

    // ─── Initialize Notice Board System ───
    const noticeBoardSystem = new NoticeBoardSystem(renderer, scene, camera, playerRef)
    noticeBoardSystemRef.current = noticeBoardSystem

    // ─── Player State ───
    playerState.current = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      sprint: false,
      speed: 0.06,
      sprintMultiplier: 2.5,
      currentY: 0,
      targetY: 0,
      isOnStairs: false,
      autoWalkTarget: null,
      crossFloorTarget: null
    }

    // ─── Camera Settings ───
    if (!cameraSettingsRef.current) {
      cameraSettingsRef.current = {
        distance: 1.9,
        height: 1.3,
        smoothness: 0.5,
        rotationY: teleportCameraRotationY.current !== null ? teleportCameraRotationY.current : 0,
        rotationX: 0.1,
        minRotationX: -0.4,
        maxRotationX: 0.4,
      }
    }
    const cameraSettings = cameraSettingsRef.current

    // ─── Raycaster for Collision ───
    const raycaster = new THREE.Raycaster()

    // ─── Simple Wall Collision Check (OPTIMIZED: uses spatial grid) ───
    function checkWallCollision(position, direction, distance) {
      const origin = new THREE.Vector3(
        position.x,
        position.y + 1.0,
        position.z
      )

      raycaster.set(origin, direction.normalize())
      raycaster.far = distance

      // Only check NEARBY meshes instead of ALL meshes
      const nearby = getNearbyMeshes(position)
      const intersects = raycaster.intersectObjects(nearby, false)

      for (const hit of intersects) {
        if (hit.face) {
          const normal = hit.face.normal.clone()
          normal.transformDirection(hit.object.matrixWorld)
          if (Math.abs(normal.y) < 0.5) {
            return true
          }
        }
      }
      return false
    }

    // ─── Ground Height Detection (OPTIMIZED: uses spatial grid) ───
    function getGroundHeight(position) {
      const origin = new THREE.Vector3(
        position.x,
        position.y + 5,
        position.z
      )
      const direction = new THREE.Vector3(0, -1, 0)

      raycaster.set(origin, direction)
      raycaster.far = 10

      // Only check NEARBY meshes instead of ALL meshes
      const nearby = getNearbyMeshes(position)
      const intersects = raycaster.intersectObjects(nearby, false)

      if (intersects.length > 0) {
        for (const hit of intersects) {
          if (hit.point.y <= position.y + 1.5) {
            return hit.point.y
          }
        }
      }
      return 0
    }

    // ─── Animation Helper: Switch Animation ───
    function playAnimation(name, fadeTime = 0.2) {
      const newAction = animations[name]
      if (!newAction || newAction === currentAction) return

      if (currentAction) {
        currentAction.fadeOut(fadeTime)
      }

      newAction.reset()
      newAction.fadeIn(fadeTime)
      newAction.play()
      currentAction = newAction
    }

    // ─── Load Character Model ───
    const characterLoader = new GLTFLoader()
    const characterPath = '/models/player.glb'

    characterLoader.load(
      characterPath,
      (gltf) => {
        const character = gltf.scene

        // Scale character if needed
        character.scale.set(0.8, 0.85, 0.8)
        character.position.set(0, 0, 0)

        // Disable shadows on character
        character.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        player.add(character)

        // ─── Setup Animation Mixer ───
        if (gltf.animations && gltf.animations.length > 0) {

          // ─── FIX ROOT MOTION: Remove position tracks from animations ───
          gltf.animations.forEach((clip) => {
            clip.tracks = clip.tracks.filter(track => {
              // Remove position tracks for root/hip bones (keeps character in place)
              const isRootPosition =
                (track.name.toLowerCase().includes('hips') ||
                  track.name.toLowerCase().includes('root') ||
                  track.name.toLowerCase().includes('armature')) &&
                track.name.toLowerCase().includes('position')
              return !isRootPosition
            })
          })

          mixer = new THREE.AnimationMixer(character)

          console.log('Available animations:')
          gltf.animations.forEach((clip, index) => {
            console.log(`  ${index}: ${clip.name}`)

            const clipName = clip.name.toLowerCase()
            const action = mixer.clipAction(clip)


            // Map animation names
            if (clipName.includes('idle')) {
              animations['idle'] = action
            } else if (clipName.includes('run')) {
              animations['run'] = action
            } else if (clipName.includes('walk')) {
              animations['walk'] = action
            } else if (clipName.includes('ascend')) {
              animations['ascend'] = action
            }
          })

          // Start with idle
          if (animations['idle']) {
            animations['idle'].play()
            currentAction = animations['idle']
          }

          console.log('Mapped animations:', Object.keys(animations))
        }

        console.log('Character loaded successfully')
      },
      (progress) => {
        console.log('Loading character:', (progress.loaded / progress.total * 100).toFixed(0) + '%')
      },
      (error) => {
        console.error('Error loading character:', error)
        createPlaceholderCharacter()
      }
    )

    // ─── Placeholder Character (fallback) ───
    function createPlaceholderCharacter() {
      const bodyGeometry = new THREE.CapsuleGeometry(0.2, 0.5, 3, 7)
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.5
      })
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
      body.position.y = 0.55
      player.add(body)

      const headGeometry = new THREE.SphereGeometry(0.15, 16, 16)
      const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd699,
        roughness: 0.6
      })
      const head = new THREE.Mesh(headGeometry, headMaterial)
      head.position.y = 1.1
      player.add(head)

      const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8)
      const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 })
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
      leftEye.position.set(-0.05, 1.15, 0.12)
      player.add(leftEye)
      const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
      rightEye.position.set(0.05, 1.15, 0.12)
      player.add(rightEye)

      const indicatorGeometry = new THREE.ConeGeometry(0.08, 0.15, 8)
      const indicatorMaterial = new THREE.MeshStandardMaterial({ color: 0x22c55e })
      const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial)
      indicator.rotation.x = Math.PI / 2
      indicator.position.set(0, 0.55, 0.3)
      player.add(indicator)
    }

    // ─── Load Building Model ───
    const loader = new GLTFLoader()
    const modelPath = `/models/${selectedBuilding}.glb`

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false
            child.receiveShadow = false
            // Build BVH for each mesh geometry (dramatically speeds up raycasting)
            if (child.geometry) {
              child.geometry.computeBoundsTree()
            }
            collidableMeshes.push(child)
            // Add each mesh to the spatial grid for fast lookup
            addMeshToGrid(child)
          }
        })

        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())

        model.position.x = -center.x
        model.position.z = -center.z
        model.position.y = -box.min.y

        scene.add(model)

        // Reset player state to the spawn location
        player.position.set(spawnPos.x, spawnPos.y, spawnPos.z)
        playerState.current.currentY = spawnPos.y
        playerState.current.targetY = spawnPos.y

        // ─── Load Door Labels ───
        loadDoorLabels(selectedBuilding)

        setIsLoading(false)
        setModelError(false)
        console.log('Building loaded with', collidableMeshes.length, 'meshes')
        console.log('Spatial grid cells:', spatialGrid.size)

        // Create mission cubes after building loads
        const cubes = createMissionCubes(scene)
        setMissionCubes(cubes)
        cubesRef.current = cubes
      },
      (progress) => {
        if (progress.total > 0) {
          setLoadingProgress((progress.loaded / progress.total) * 100)
        }
      },
      (error) => {
        console.error('Error loading model:', error)
        setModelError(true)
        setIsLoading(false)
      }
    )

    // ─── Event Handlers ───
    const onClick = (e) => {
      // Delegate to NoticeBoardSystem
      if (noticeBoardSystemRef.current) {
        noticeBoardSystemRef.current.handleInput(e)
        if (noticeBoardSystemRef.current.isZoomed) {
          if (inputState.current.isLocked) {
            document.exitPointerLock()
          }
          return
        }
      }

      if (!inputState.current.isLocked) {
        renderer.domElement.requestPointerLock()
      }
    }

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement
      inputState.current.isLocked = locked
      setIsLocked(locked)
    }

    const onMouseMove = (e) => {
      if (noticeBoardSystemRef.current) {
        noticeBoardSystemRef.current.handleInput(e)
      }

      if (!inputState.current.isLocked) return

      const deltaX = e.movementX || 0
      const deltaY = e.movementY || 0

      cameraSettings.rotationY -= deltaX * 0.002
      cameraSettings.rotationX += deltaY * 0.002
      cameraSettings.rotationX = Math.max(
        cameraSettings.minRotationX,
        Math.min(cameraSettings.maxRotationX, cameraSettings.rotationX)
      )
    }

    const onWheel = (e) => {
      cameraSettings.distance += e.deltaY * 0.01
      cameraSettings.distance = Math.max(2, Math.min(10, cameraSettings.distance))
    }

    const onKeyDown = (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      ) {
        return
      }

      if (e.key === 'Control') {
        if (inputState.current.isLocked) {
          document.exitPointerLock()
        } else {
          renderer.domElement.requestPointerLock()
        }
        return
      }

      if (!inputState.current.isLocked) return

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          playerState.current.moveForward = true
          break
        case "KeyS":
        case "ArrowDown":
          playerState.current.moveBackward = true
          break
        case "KeyA":
        case "ArrowLeft":
          playerState.current.moveLeft = true
          break
        case "KeyD":
        case "ArrowRight":
          playerState.current.moveRight = true
          break
        case "ShiftLeft":
        case "ShiftRight":
          playerState.current.sprint = true
          break
        case "KeyE":
          if (playerRef.current.interactionMissionId) {
            const targetIndex = cubesRef.current.findIndex(c => c.mission.id === playerRef.current.interactionMissionId)
            if (targetIndex !== -1) {
              const { mesh, mission } = cubesRef.current[targetIndex]
              mesh.visible = false
              setTimeout(() => { if (mesh) mesh.visible = true }, 3000)
              document.exitPointerLock()
              setCurrentMission(mission)
              setShowInfoModal(true)
              setInteractionTarget(null)
              playerRef.current.interactionMissionId = null
            }
          }
          break
      }
    }

    const onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': playerState.current.moveForward = false; break
        case 'KeyS': case 'ArrowDown': playerState.current.moveBackward = false; break
        case 'KeyA': case 'ArrowLeft': playerState.current.moveLeft = false; break
        case 'KeyD': case 'ArrowRight': playerState.current.moveRight = false; break
        case 'ShiftLeft': case 'ShiftRight': playerState.current.sprint = false; break
      }
    }

    // Add listeners
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    renderer.domElement.addEventListener('click', onClick)
    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true })
    renderer.domElement.addEventListener('contextmenu', e => e.preventDefault())

    // ─── Animation Loop ───
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      if (teleportCameraRotationY.current !== null) {
        cameraSettings.rotationY = teleportCameraRotationY.current
        teleportCameraRotationY.current = null
      }

      // Update animation mixer
      const delta = clock.getDelta()
      if (mixer) {
        mixer.update(delta)
      }

      // ─── Update Door Label Visibility ───
      updateLabelVisibility(player.position)

      // ─── Calculate Movement Direction ───
      if (!noticeBoardSystemRef.current?.isZoomed) {
        const moveDirection = new THREE.Vector3()

        const forward = new THREE.Vector3(
          -Math.sin(cameraSettings.rotationY),
          0,
          -Math.cos(cameraSettings.rotationY)
        )

        const right = new THREE.Vector3(
          Math.cos(cameraSettings.rotationY),
          0,
          -Math.sin(cameraSettings.rotationY)
        )

        if (playerState.current.moveForward) moveDirection.add(forward)
        if (playerState.current.moveBackward) moveDirection.sub(forward)
        if (playerState.current.moveLeft) moveDirection.sub(right)
        if (playerState.current.moveRight) moveDirection.add(right)

        // Reset auto walk if player provides manual input
        if (
          playerState.current.moveForward ||
          playerState.current.moveBackward ||
          playerState.current.moveLeft ||
          playerState.current.moveRight
        ) {
          if (playerState.current.autoWalkTarget) {
            playerState.current.autoWalkTarget = null
            playerState.current.crossFloorTarget = null
            console.log("Auto-walk cancelled by manual movement")
          }
        }

        // Apply auto-walk if target exists and no manual movement is happening
        if (playerState.current.autoWalkTarget) {
          const target = new THREE.Vector3(
            playerState.current.autoWalkTarget.x,
            player.position.y, // Ignore Y for horizontal distance calculation
            playerState.current.autoWalkTarget.z
          )

          const distToTarget = player.position.distanceTo(target)

          if (distToTarget < 0.5) {
            // Reached destination
            if (playerState.current.crossFloorTarget) {
              const { path, finalLocation } = playerState.current.crossFloorTarget;
              
              if (path && path.length > 0) {
                 const nextStep = path.shift();
                 console.log(`Cross-floor auto-walk reached stairs. Jumping to Floor ${nextStep.targetFloor}`);
                 
                 // Tell React to update the Current Floor state in UI
                 if (onFloorChange) {
                   onFloorChange(nextStep.targetFloor);
                 }
                 
                 // Instantly teleport player to the new floor's spawn location
                 player.position.set(nextStep.spawn.x, nextStep.spawn.y, nextStep.spawn.z);
                 playerState.current.currentY = nextStep.spawn.y;
                 playerState.current.targetY = nextStep.spawn.y;
                 
                 if (path.length > 0) {
                     // Walk to the next floor's stairs (in case it shifts horizontally)
                     playerState.current.autoWalkTarget = path[0].spawn;
                 } else {
                     // Final floor reached. Walk to the final goal.
                     playerState.current.autoWalkTarget = finalLocation.coordinates;
                     playerState.current.crossFloorTarget = null;
                     console.log(`Continuing auto-walk to ${finalLocation.name}`);
                 }
              } else {
                 // Fallback if path is empty
                 playerState.current.autoWalkTarget = finalLocation.coordinates;
                 playerState.current.crossFloorTarget = null;
                 console.log(`Continuing auto-walk to ${finalLocation.name}`);
              }
            } else {
              playerState.current.autoWalkTarget = null
              console.log("Auto-walk destination reached")
            }
          } else {
            // Walk towards destination
            const directionToTarget = target.clone().sub(player.position).normalize()
            
            // --- Obstacle Avoidance (Raycast ahead) ---
            const scanDistance = 1.0;
            // First check if direct path is blocked
            const isBlockedDirect = checkWallCollision(player.position, directionToTarget, scanDistance);
            
            if (isBlockedDirect) {
                // Determine left/right diversion vectors (rotate direction 90 degrees around Y axis)
                const leftDiverge = new THREE.Vector3(-directionToTarget.z, 0, directionToTarget.x).normalize();
                const rightDiverge = new THREE.Vector3(directionToTarget.z, 0, -directionToTarget.x).normalize();

                // Scan slightly diagonal as well to find the best open path
                const frontLeft = directionToTarget.clone().add(leftDiverge.clone().multiplyScalar(0.5)).normalize();
                const frontRight = directionToTarget.clone().add(rightDiverge.clone().multiplyScalar(0.5)).normalize();

                const blockedFL = checkWallCollision(player.position, frontLeft, scanDistance);
                const blockedFR = checkWallCollision(player.position, frontRight, scanDistance);
                const blockedL = checkWallCollision(player.position, leftDiverge, scanDistance * 1.2);
                const blockedR = checkWallCollision(player.position, rightDiverge, scanDistance * 1.2);
                
                // Try to find the most forward-facing clear path
                if (!blockedFL) {
                  moveDirection.copy(frontLeft);
                } else if (!blockedFR) {
                  moveDirection.copy(frontRight);
                } else if (!blockedL && !blockedR) {
                  // Both sides clear, but front is blocked (flat wall). 
                  // Pick the side that gets us closer to the target
                  const testLeftPos = player.position.clone().add(leftDiverge);
                  const testRightPos = player.position.clone().add(rightDiverge);
                  if (testLeftPos.distanceTo(target) < testRightPos.distanceTo(target)) {
                    moveDirection.copy(leftDiverge);
                  } else {
                    moveDirection.copy(rightDiverge);
                  }
                } else if (!blockedL) {
                  // Slide left
                  moveDirection.copy(leftDiverge);
                } else if (!blockedR) {
                  // Slide right
                  moveDirection.copy(rightDiverge);
                } else {
                  // We are completely stuck (corner or narrow corridor)
                  // Abort auto-walk to prevent infinite walking into wall
                  moveDirection.set(0,0,0);
                  playerState.current.autoWalkTarget = null;
                  playerState.current.crossFloorTarget = null;
                  console.log("Auto-walk aborted - player stuck.");
                }
            } else {
                // Clear path, use direct direction
                moveDirection.copy(directionToTarget)
            }

            // Force walking state
            playerState.current.sprint = false
          }
        }

        // ─── Determine Animation State ───
        const isMoving = moveDirection.length() > 0
        const isSprinting = playerState.current.sprint && isMoving

        // Detect if climbing stairs (height changing while moving)
        const heightDiff = playerState.current.targetY - playerState.current.currentY
        const isClimbingStairs = isMoving && heightDiff > 0.1

        // ─── Play Appropriate Animation ───
        if (mixer && Object.keys(animations).length > 0) {
          if (isClimbingStairs && animations['ascend']) {
            playAnimation('ascend')
          } else if (isSprinting && animations['run']) {
            playAnimation('run')
          } else if (isMoving && animations['walk']) {
            playAnimation('walk')
          } else if (!isMoving) {
            playAnimation('idle')
          }
        }

        // ─── Apply Movement with Collision ───
        if (isMoving) {
          moveDirection.normalize()

          const speed = playerState.current.sprint
            ? playerState.current.speed * playerState.current.sprintMultiplier
            : playerState.current.speed

          const collisionDist = 0.6

          const dirX = new THREE.Vector3(moveDirection.x, 0, 0).normalize()
          if (moveDirection.x !== 0 && !checkWallCollision(player.position, dirX, collisionDist)) {
            player.position.x += moveDirection.x * speed
          }

          const dirZ = new THREE.Vector3(0, 0, moveDirection.z).normalize()
          if (moveDirection.z !== 0 && !checkWallCollision(player.position, dirZ, collisionDist)) {
            player.position.z += moveDirection.z * speed
          }

          // Rotate player to face movement direction
          const targetRotation = Math.atan2(moveDirection.x, moveDirection.z)
          let rotDiff = targetRotation - player.rotation.y
          while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
          while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
          player.rotation.y += rotDiff * 0.15

          // Navigate camera behind player when auto-walking
          if (playerState.current.autoWalkTarget) {
            const targetCameraRot = player.rotation.y + Math.PI;
            let camRotDiff = targetCameraRot - cameraSettings.rotationY;
            while (camRotDiff > Math.PI) camRotDiff -= Math.PI * 2;
            while (camRotDiff < -Math.PI) camRotDiff += Math.PI * 2;
            cameraSettings.rotationY += camRotDiff * 0.05;
          }
        }

        // ─── Ground Detection ───
        if (collidableMeshes.length > 0) {
          const groundY = getGroundHeight(player.position)
          playerState.current.targetY = groundY

          const heightDiff = playerState.current.targetY - playerState.current.currentY

          if (Math.abs(heightDiff) < 2) {
            playerState.current.currentY += heightDiff * 0.15
          }

          player.position.y = playerState.current.currentY


          // ─── Update Floor UI ───
          const detectedFloor = Math.max(0, Math.floor((player.position.y + 0.5) / 4) + 1)

          if (playerRef.current.detectedFloor !== detectedFloor) {
            playerRef.current.detectedFloor = detectedFloor
            onFloorChange?.(detectedFloor)
          }
        }

        // ─── Update Camera with Collision ───
        const cameraTarget = new THREE.Vector3(
          player.position.x,
          player.position.y + 1.2,
          player.position.z
        )

        // Calculate ideal camera position
        const idealOffset = new THREE.Vector3(
          Math.sin(cameraSettings.rotationY) * cameraSettings.distance,
          cameraSettings.height + cameraSettings.rotationX * 2,
          Math.cos(cameraSettings.rotationY) * cameraSettings.distance
        )
        const idealPosition = cameraTarget.clone().add(idealOffset)

        // ─── Camera Collision Detection (OPTIMIZED: uses nearby meshes) ───
        const rayDirection = idealPosition.clone().sub(cameraTarget).normalize()
        const rayDistance = idealPosition.distanceTo(cameraTarget)

        raycaster.set(cameraTarget, rayDirection)
        raycaster.far = rayDistance

        const nearby = getNearbyMeshes(player.position)
        const cameraHits = raycaster.intersectObjects(nearby, false)

        let finalCameraPosition = idealPosition.clone()

        if (cameraHits.length > 0) {
          // Camera would hit something - pull it closer
          const hitDistance = cameraHits[0].distance
          const safeDistance = Math.max(0.5, hitDistance - 0.3) // Keep 0.3 units away from wall

          // Calculate new position at safe distance
          finalCameraPosition = cameraTarget.clone().add(
            rayDirection.multiplyScalar(safeDistance)
          )
        }

        // Smooth camera movement, but jump instantly if teleported
        if (teleportCameraRotationY.current !== null) {
          camera.position.copy(finalCameraPosition)
        } else {
          camera.position.lerp(finalCameraPosition, cameraSettings.smoothness)
        }
        camera.lookAt(cameraTarget)

        // Update light position (no shadows)
        directionalLight.position.set(
          player.position.x + 30,
          50,
          player.position.z + 30
        )

        // ─── Animate mission cubes (rotation and floating) ───
        const time = Date.now() * 0.001
        cubesRef.current.forEach(({ mesh }) => {
          if (mesh) {
            mesh.rotation.y = time
            if (mesh.userData.initialY === undefined) mesh.userData.initialY = mesh.position.y
            mesh.position.y = mesh.userData.initialY + Math.sin(time * 2) * 0.2
          }
        })

        // ─── Check for mission cube proximity (manual interaction) ───
        if (playerRef.current && inputState.current.isLocked) {
          let foundTarget = null
          cubesRef.current.forEach(({ mesh, mission }) => {
            if (!mesh || !mesh.visible) return
            const distance = playerRef.current.position.distanceTo(mesh.position)
            if (distance < 2) {
              foundTarget = { mesh, mission }
            }
          })
          if (playerRef.current.interactionMissionId !== (foundTarget?.mission.id || null)) {
            playerRef.current.interactionMissionId = foundTarget?.mission.id || null
            setInteractionTarget(foundTarget)
          }
        }
      } // end noticeBoardSystem isZoomed guard

      // Render via NoticeBoardSystem (Post Processing) only when zoomed
      let rendered = false
      if (noticeBoardSystemRef.current) {
        rendered = noticeBoardSystemRef.current.update(0.016)
      }
      if (!rendered) {
        renderer.render(scene, camera)
      }
    }
    animate()

    // ─── Handle Resize ───
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // ─── Cleanup ───
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      if (noticeBoardSystemRef.current) {
        noticeBoardSystemRef.current.dispose()
      }
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('click', onClick)
        renderer.domElement.removeEventListener('mousemove', onMouseMove)
        renderer.domElement.removeEventListener('wheel', onWheel)
      }
      if (mixer) {
        mixer.stopAllAction()
      }
      // Cleanup door labels
      doorLabels.forEach(label => {
        label.geometry.dispose()
        if (label.material.map) label.material.map.dispose()
        label.material.dispose()
        scene.remove(label)
      })
      renderer.dispose()
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [selectedBuilding]) // Note: we don't depend on missions here to avoid re-creating scene on completion

  const handleInfoContinue = () => {
    setShowInfoModal(false)
    setShowQuizModal(true)
  }

  const handleQuizComplete = (passed) => {
    setShowQuizModal(false)
    if (passed) {
      setMissions(prevMissions =>
        prevMissions.map(m =>
          m.id === currentMission.id ? { ...m, completed: true } : m
        )
      )
    }
    setCurrentMission(null)
  }

  const handleModalClose = () => {
    setShowInfoModal(false)
    setShowQuizModal(false)
    setCurrentMission(null)
  }

  return (
    <>
      <div ref={containerRef} className="game-canvas" />


      {showInfoModal && currentMission && (
        <MissionInfoModal
          mission={currentMission}
          onContinue={handleInfoContinue}
          onClose={handleModalClose}
        />
      )}

      {/* ─── Letter Hunt Component ─── */}
      <LetterHunt scene={sceneInstance} playerRef={playerRef} />

      {/* ─── Treasure Hunt Component ─── */}
      <TreasureHunt scene={sceneInstance} playerRef={playerRef} />

      {/* Interaction Prompt */}
      {interactionTarget && !showInfoModal && !showQuizModal && (
        <div className="interaction-prompt">
          <div className="key-hint">E</div>
          <span>Interact with {interactionTarget.mission.title}</span>
        </div>
      )}

      {showQuizModal && currentMission && (
        <MissionQuizModal
          mission={currentMission}
          onComplete={handleQuizComplete}
          onClose={handleModalClose}
        />
      )}

      {isLoading && (
        <div className="model-loading-overlay">
          <div className="model-loading-glass">
            <div className="model-loading-spinner-wrapper">
              <div className="spinner-ring outer-ring"></div>
              <div className="spinner-ring inner-ring"></div>
              <div className="model-loading-percent">{loadingProgress.toFixed(0)}%</div>
            </div>
            
            <div className="model-loading-info">
              <h2 className="loading-title">Loading Environment</h2>
              <p className="loading-subtitle">{selectedBuilding?.replace('-', ' ').toUpperCase() || 'Building'}</p>
            </div>
            
            <div className="model-loading-bar-container">
              <div className="model-loading-bar-track">
                <div 
                  className="model-loading-bar-fill" 
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="glow-edge"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modelError && !isLoading && (
        <div className="model-error-toast">
          <span>⚠️ Model not found. Using placeholder.</span>
        </div>
      )}
    </>
  )
}

export default GameCanvas