import * as THREE from 'three'

class ThreeHero {
  constructor(container) {
    this.container = container
    this.scene     = null
    this.camera    = null
    this.renderer  = null
    this.particles = null
    this.objects   = []
    this.animationId = null
    this.onResize  = () => this.onWindowResize()
    this.baseZ     = 50          // camera rest position
    this.init()
  }

  init() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0f172a)

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.z = this.baseZ

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0x0f172a, 1)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.appendChild(this.renderer.domElement)

    // Lighting — warm-cool contrast, no neon
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.3))

    const l1 = new THREE.PointLight(0x6366f1, 1.0)   // indigo
    l1.position.set(100, 80, 60)
    this.scene.add(l1)

    const l2 = new THREE.PointLight(0x38bdf8, 0.6)   // sky
    l2.position.set(-90, -70, 50)
    this.scene.add(l2)

    const l3 = new THREE.PointLight(0x818cf8, 0.35)  // soft indigo
    l3.position.set(0, 40, -60)
    this.scene.add(l3)

    this.createParticles()
    this.createCubes()
    this.createSpheres()
    this.createTorus()

    window.addEventListener('resize', this.onResize)
    this.animate()
  }

  createParticles() {
    const geo   = new THREE.BufferGeometry()
    const count = 350
    const pos   = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      pos[i]     = (Math.random() - 0.5) * 220
      pos[i + 1] = (Math.random() - 0.5) * 220
      pos[i + 2] = (Math.random() - 0.5) * 220
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.5,
      color: 0x6366f1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5
    })
    this.particles = new THREE.Points(geo, mat)
    this.scene.add(this.particles)
  }

  createCubes() {
    const geo = new THREE.BoxGeometry(3, 3, 3)
    const mat = new THREE.MeshPhongMaterial({
      color: 0x6366f1, emissive: 0x312e81,
      transparent: true, opacity: 0.25, wireframe: true
    })

    const c1 = new THREE.Mesh(geo, mat)
    c1.position.set(-30, 15, 0)
    this.scene.add(c1)
    this.objects.push({ mesh: c1, vx: 0.018, vy: 0.01, vz: 0.014 })

    const c2 = new THREE.Mesh(geo, mat.clone())
    c2.position.set(30, -15, 0)
    this.scene.add(c2)
    this.objects.push({ mesh: c2, vx: -0.014, vy: 0.018, vz: -0.01 })
  }

  createSpheres() {
    const geo = new THREE.IcosahedronGeometry(5, 4)
    const mat = new THREE.MeshPhongMaterial({
      color: 0x38bdf8, emissive: 0x0c4a6e,
      transparent: true, opacity: 0.16, wireframe: true
    })

    const s1 = new THREE.Mesh(geo, mat)
    s1.position.set(-40, -20, -20)
    this.scene.add(s1)
    this.objects.push({ mesh: s1, vx: 0.01, vy: -0.014, vz: 0.018 })

    const s2 = new THREE.Mesh(geo, mat.clone())
    s2.position.set(40, 20, -20)
    this.scene.add(s2)
    this.objects.push({ mesh: s2, vx: -0.018, vy: 0.01, vz: 0.014 })
  }

  createTorus() {
    const geo = new THREE.TorusGeometry(8, 2, 16, 32)
    const mat = new THREE.MeshPhongMaterial({
      color: 0x818cf8, emissive: 0x312e81,
      transparent: true, opacity: 0.2, wireframe: true
    })

    const t = new THREE.Mesh(geo, mat)
    t.position.set(0, 0, -30)
    this.scene.add(t)
    this.objects.push({ mesh: t, vx: 0.005, vy: 0.007, vz: 0 })
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate())

    // Parallax: gently zoom camera based on page scroll
    const scrollRatio = Math.min(window.scrollY / window.innerHeight, 1)
    this.camera.position.z = this.baseZ - scrollRatio * 18  // zoom in as you scroll

    if (this.particles) {
      this.particles.rotation.x += 0.00008
      this.particles.rotation.y += 0.00015
    }

    const t = Date.now() * 0.001
    this.objects.forEach((obj, i) => {
      obj.mesh.rotation.x += obj.vx
      obj.mesh.rotation.y += obj.vy
      obj.mesh.rotation.z += obj.vz
      obj.mesh.position.x += Math.sin(t + i)     * 0.018
      obj.mesh.position.y += Math.cos(t + i*0.7) * 0.018
      obj.mesh.position.z += Math.sin(t + i*0.5) * 0.009
    })

    this.renderer.render(this.scene, this.camera)
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  cleanup() {
    if (this.animationId) cancelAnimationFrame(this.animationId)
    window.removeEventListener('resize', this.onResize)
    if (this.renderer && this.container && this.renderer.domElement.parentNode) {
      this.container.removeChild(this.renderer.domElement)
    }
    if (this.scene) {
      this.scene.traverse(o => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) {
          Array.isArray(o.material) ? o.material.forEach(m => m.dispose()) : o.material.dispose()
        }
      })
    }
    if (this.renderer) this.renderer.dispose()
  }
}

export default ThreeHero
