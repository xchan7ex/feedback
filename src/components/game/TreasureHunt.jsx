import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

const TreasureHunt = ({ scene, playerRef, setMissions }) => {
    const [gameState, setGameState] = useState({
        hasKey: false,
        chestOpen: false,
        rewardCollected: false
    });

    // UI State
    const [interactionLabel, setInteractionLabel] = useState("");
    const [showKeyIcon, setShowKeyIcon] = useState(false);

    // Ref to track game state without triggering re-renders of the effect
    const gameStateRef = useRef(gameState);

    // Keep ref in sync with state
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    // Three.js Objects Refs
    const keyRef = useRef(null);
    const chestRef = useRef(null);
    const rewardRef = useRef(null);
    const requestRef = useRef();
    const prevLabelRef = useRef("");

    // Inputs
    const keys = useRef({ e: false });

    // Constants
    const KEY_POS = new THREE.Vector3(-3.7, 22.5, -11.9); // location for Key
    const CHEST_POS = new THREE.Vector3(10.2, 29.5, 2.0); // location for Chest

    // ─── Input Handling ───
    useEffect(() => {
        const onDown = (e) => {
            if (e.code === 'KeyE') keys.current.e = true;
        }
        const onUp = (e) => {
            if (e.code === 'KeyE') keys.current.e = false;
        }
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        }
    }, []);

    // ─── Scene Setup ───
    useEffect(() => {
        if (!scene) return;

        console.log("Initializing Treasure Hunt...");

        // 1. Create Key 🗝️
        const createKey = () => {
            const group = new THREE.Group();
            group.position.copy(KEY_POS);
            group.scale.set(0.4, 0.4, 0.4); // Make key smaller 

            const goldMat = new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                metalness: 0.9,
                roughness: 0.2,
                emissive: 0xffaa00,
                emissiveIntensity: 0.2
            });

            // Shaft
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8), goldMat);
            shaft.rotation.z = Math.PI / 2;
            group.add(shaft);

            // Head (Bow) - Fancy Design
            const headGroup = new THREE.Group();
            headGroup.position.x = -0.75;

            const headRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 8, 16), goldMat);
            headRing.rotation.y = Math.PI / 2;
            headGroup.add(headRing);

            const headInner = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), goldMat);
            headGroup.add(headInner);

            group.add(headGroup);

            // Teeth
            const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.1), goldMat);
            tooth1.position.set(0.4, -0.2, 0);
            group.add(tooth1);

            const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.1), goldMat);
            tooth2.position.set(0.7, -0.15, 0);
            group.add(tooth2);

            // Glow


            scene.add(group);
            return group;
        };

        // 2. Create Chest 📦 (Stylized)
        const createChest = () => {
            const chest = new THREE.Group();
            chest.position.copy(CHEST_POS);
            chest.scale.set(0.4, 0.4, 0.4); // Made smaller as requested
            if (playerRef.current) {
                chest.lookAt(playerRef.current.position.x, CHEST_POS.y, playerRef.current.position.z);
            }

            // --- Materials (Stylized) ---
            const blueMat = new THREE.MeshStandardMaterial({
                color: 0x2f78a8,
                roughness: 0.4,
                metalness: 0.1
            });
            const goldMat = new THREE.MeshStandardMaterial({
                color: 0xf2b233,
                roughness: 0.3,
                metalness: 0.6
            });
            const darkMat = new THREE.MeshStandardMaterial({
                color: 0x1b3d5a,
                roughness: 0.8
            });

            // --- Base Body (Blue Panel) ---
            const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 1.6), blueMat);
            body.position.y = 0.6;
            body.castShadow = true;
            body.receiveShadow = true;
            chest.add(body);

            // --- Gold Frame (Bottom) ---
            const addGoldFrame = (width, height, depth, y) => {
                const frame = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), goldMat);
                frame.position.y = y;
                frame.castShadow = true;
                chest.add(frame);
            };
            addGoldFrame(2.6, 0.2, 1.8, 0.1); // Bottom
            addGoldFrame(2.6, 0.18, 1.8, 0.7); // Middle Band

            // --- Side Corner Posts ---
            const addCornerPost = (x, z) => {
                const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.2), goldMat);
                post.position.set(x, 0.6, z);
                post.castShadow = true;
                chest.add(post);
            };
            addCornerPost(1.2, 0.8);
            addCornerPost(-1.2, 0.8);
            addCornerPost(1.2, -0.8);
            addCornerPost(-1.2, -0.8);

            // --- Lid Group (Hinge) ---
            const lidGroup = new THREE.Group();
            lidGroup.position.set(0, 1.2, -0.8); // Hinge at back top

            // Lid Mesh (Half Cylinder)
            const lidGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.6, 32, 1, false, 0, Math.PI);
            lidGeo.rotateZ(Math.PI / 2); // Rotate to lie flat
            const lidMesh = new THREE.Mesh(lidGeo, blueMat);
            lidMesh.castShadow = true;
            // Position relative to hinge (back) to center over box
            lidMesh.position.set(0, 0.05, 0.8);
            lidGroup.add(lidMesh);

            chest.add(lidGroup);

            // --- Lid Gold Edges (Static Rims) ---
            const addLidEdge = (z) => {
                const edge = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.2), goldMat);
                edge.position.set(0, 1.2, z);
                chest.add(edge);
            };
            addLidEdge(0.85);
            addLidEdge(-0.85);

            // --- Lock Plate (Front) ---
            const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.08), goldMat);
            lockPlate.position.set(0, 0.75, 0.9);
            chest.add(lockPlate);

            // --- Keyhole ---
            const keyHole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16), darkMat);
            keyHole.rotation.x = Math.PI / 2;
            keyHole.position.set(0, 0.75, 0.95);
            chest.add(keyHole);

            // Add to scene
            scene.add(chest);

            // UserData for animation
            chest.userData = { lid: lidGroup };
            return chest;
        };

        keyRef.current = createKey();
        chestRef.current = createChest();

        // 3. Animation Loop 🔄
        const animate = () => {
            const time = Date.now() * 0.001;

            if (keyRef.current) {
                keyRef.current.rotation.y = time;
                keyRef.current.position.y = KEY_POS.y + Math.sin(time * 2) * 0.2;
            }

            let newLabel = "";

            if (playerRef.current) {
                const playerPos = playerRef.current.position;

                // --- Check Key Distance ---
                if (keyRef.current) {
                    const distKey = playerPos.distanceTo(keyRef.current.position);
                    if (distKey < 3.0) {
                        newLabel = "Collect Key";
                        if (keys.current.f || keys.current.e) {
                            // Collect Key
                            scene.remove(keyRef.current);
                            keyRef.current = null;

                            // Update State
                            setGameState(prev => ({ ...prev, hasKey: true }));
                            // Update Ref immediately to prevent multiple triggers
                            gameStateRef.current = { ...gameStateRef.current, hasKey: true };

                            setShowKeyIcon(true);
                        }
                    }
                }

                // --- Check Chest Distance ---
                if (chestRef.current && !newLabel) {
                    const distChest = playerPos.distanceTo(chestRef.current.position);
                    if (distChest < 4.0) {
                        if (gameStateRef.current.rewardCollected) {
                            // Nothing
                        } else if (gameStateRef.current.chestOpen && rewardRef.current) {
                            newLabel = "Collect Reward";
                            if (keys.current.f || keys.current.e) {
                                // Lock state immediately
                                setGameState(prev => ({ ...prev, rewardCollected: true }));
                                gameStateRef.current = { ...gameStateRef.current, rewardCollected: true };

                                // Update Global Missions State
                                if (setMissions) {
                                    setMissions(prev => prev.map(m =>
                                        m.id === 'mission-9' ? { ...m, completed: true } : m
                                    ));
                                }

                                // Visual Collection Animation
                                const gem = rewardRef.current;
                                rewardRef.current = null; // Detach ref immediately so loop skips

                                // Kill floating animations
                                gsap.killTweensOf(gem.position);
                                gsap.killTweensOf(gem.scale);
                                gsap.killTweensOf(gem.rotation);

                                // Fly to player and shrink
                                if (playerRef.current) {
                                    gsap.to(gem.position, {
                                        x: playerRef.current.position.x,
                                        y: playerRef.current.position.y + 1.5,
                                        z: playerRef.current.position.z,
                                        duration: 0.5,
                                        ease: "power2.in"
                                    });
                                }

                                gsap.to(gem.scale, {
                                    x: 0, y: 0, z: 0,
                                    duration: 0.5,
                                    ease: "back.in(1.7)",
                                    onComplete: () => {
                                        scene.remove(gem);
                                    }
                                });
                            }
                        } else if (gameStateRef.current.hasKey) {
                            newLabel = "Open Chest";
                            if (keys.current.f || keys.current.e) {
                                // Open Chest Logic
                                // Check if already opening to be safe
                                if (!chestRef.current.userData.isOpening) {
                                    chestRef.current.userData.isOpening = true;
                                    setGameState(prev => ({ ...prev, chestOpen: true }));
                                    gameStateRef.current = { ...gameStateRef.current, chestOpen: true };
                                    openChestAnimation(chestRef.current);
                                }
                            }
                        } else {
                            newLabel = "Locked (Find Key)";
                        }
                    }
                }
            }

            // Only update React state when label actually changes
            if (newLabel !== prevLabelRef.current) {
                prevLabelRef.current = newLabel;
                setInteractionLabel(newLabel);
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(requestRef.current);
            if (keyRef.current) scene.remove(keyRef.current);
            if (chestRef.current) scene.remove(chestRef.current);
            if (rewardRef.current) scene.remove(rewardRef.current);
        };
    }, [scene]); // Run only on mount/scene change

    // ─── Helper: Animated Chest Open ───
    const openChestAnimation = (chestGroup) => {
        const lid = chestGroup.userData.lid;
        // Bouncy Open with GSAP
        console.log("Opening chest...");
        gsap.to(lid.rotation, {
            x: -Math.PI / 1.5,
            duration: 1.5,
            ease: "elastic.out(1, 0.5)",
            onComplete: () => {
                spawnReward(chestGroup.position);
            }
        });
    };

    // ─── Helper: Spawn Reward inside Chest ───
    const spawnReward = (position) => {
        if (!scene) return;

        const group = new THREE.Group();
        // Start slightly inside chest, will float up
        group.position.set(position.x, position.y + 0.5, position.z);
        group.scale.set(0, 0, 0); // Pop in

        // Diamond / Gem (Smaller & Glowing)
        const geometry = new THREE.OctahedronGeometry(0.15, 0); // Made smaller
        const material = new THREE.MeshStandardMaterial({
            color: 0x00FFFF,
            emissive: 0x00FFFF,
            emissiveIntensity: 3.0, // High glow
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.9
        });
        const gem = new THREE.Mesh(geometry, material);
        group.add(gem);

        // Particles/Light


        scene.add(group);
        rewardRef.current = group;

        // Animate Reward Appearance
        gsap.to(group.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.8,
            ease: "back.out(1.7)"
        });

        gsap.to(group.position, {
            y: position.y + 2.0, // Float higher up
            duration: 2,
            ease: "power2.out"
        });

        // Continuous Rotation & Bobbing
        gsap.to(group.rotation, {
            y: Math.PI * 2,
            duration: 3,
            repeat: -1,
            ease: "none"
        });

        gsap.to(group.position, {
            y: "+=0.3",
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    };

    if (!scene) return null;

    return (
        <>
            {/* Inventory / Key Icon */}
            {showKeyIcon && !gameState.rewardCollected && (
                <div className="fixed top-24 left-4 bg-black/60 p-3 rounded-full border-2 border-yellow-500 shadow-lg z-[9000]">
                    <span className="text-2xl">🗝️</span>
                </div>
            )}

            {/* Interaction Prompt */}
            {interactionLabel && (
                <div className="interaction-prompt" style={{ zIndex: 9999 }}>
                    <div className="key-hint">E</div>
                    <span className={interactionLabel.includes("Locked") ? "text-red-300" : "text-white"}>
                        {interactionLabel}
                    </span>
                </div>
            )}

            {/* Win Screen */}
            {gameState.rewardCollected && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white p-10 rounded-3xl text-center border-4 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.5)] z-[10000] animate-bounce">
                    <h1 className="text-5xl font-bold text-cyan-400 mb-4 tracking-wider">TREASURE FOUND!</h1>
                    <p className="text-xl text-gray-200">You unlocked the ancient chest.</p>
                    <div className="mt-6 text-6xl">💎</div>
                </div>
            )}
        </>
    );
};

export default TreasureHunt;
