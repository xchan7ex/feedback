import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

// ─── LetterObject Class (Internal) ───
class LetterObject {
    constructor(scene, position, letterType) {
        this.scene = scene;
        this.position = position;
        this.letterType = letterType; // 'I' or 'T'
        this.mesh = null;
        this.baseY = position.y;
        this.isCollected = false;
        this.isCollecting = false;
        this.scale = 1;

        this.createMesh();
    }

    createMesh() {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);

        // 🎨 Blue Styles
        const material = new THREE.MeshStandardMaterial({
            color: 0x00BFFF, // Deep Sky Blue
            emissive: 0x0044AA,
            emissiveIntensity: 1.0,
            metalness: 0.9,
            roughness: 0.1,
        });

        // "Covered Corners" / Tech look via Wireframe Overlay
        const edgeMaterial = new THREE.MeshBasicMaterial({
            color: 0x88CCFF,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });

        // Helper to create box with "corners"
        const createPart = (w, h, d, y = 0) => {
            const geo = new THREE.BoxGeometry(w, h, d);
            const mesh = new THREE.Mesh(geo, material);
            mesh.position.y = y;
            mesh.castShadow = true;

            const edgeGeo = new THREE.BoxGeometry(w + 0.02, h + 0.02, d + 0.02);
            const edgeMesh = new THREE.Mesh(edgeGeo, edgeMaterial);
            mesh.add(edgeMesh);

            this.mesh.add(mesh);
        };

        if (this.letterType === 'I') {
            createPart(0.25, 0.8, 0.25, 0);
            createPart(0.5, 0.15, 0.3, 0.4);      // Top Cap
            createPart(0.5, 0.15, 0.3, -0.4);     // Bottom Cap

        } else if (this.letterType === 'T') {
            createPart(0.25, 0.8, 0.25, 0);       // Vertical
            createPart(0.7, 0.25, 0.3, 0.4);      // Top Bar
        }



        this.scene.add(this.mesh);
    }

    update(time) {
        if (!this.mesh) return;

        if (this.isCollecting) {
            this.scale -= 0.05;
            this.mesh.scale.setScalar(this.scale);
            this.mesh.rotation.y += 0.2;
            this.mesh.position.y += 0.1; // Float up faster opacity

            if (this.scale <= 0) {
                this.dispose();
            }
        } else {
            // Idle animation
            this.mesh.rotation.y = time * 0.8;
            this.mesh.position.y = this.baseY + Math.sin(time * 2.5) * 0.3;
        }
    }

    collect() {
        if (this.isCollected) return;
        this.isCollected = true;
        this.isCollecting = true;
    }

    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            this.mesh = null;
        }
    }
}

// ─── Component ───
const LetterHunt = ({ scene, playerRef, setMissions }) => {
    const [letters, setLetters] = useState([]);
    const [foundCount, setFoundCount] = useState(0);
    const [totalLetters, setTotalLetters] = useState(0);
    const [showPrompt, setShowPrompt] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [activeTarget, setActiveTarget] = useState(null);
    const [giftOpened, setGiftOpened] = useState(false);

    // Ref needed for accessing active target in event listener closure
    const activeTargetRef = useRef(null);
    const lettersRef = useRef([]);
    const giftRef = useRef(null); // Track the gift box
    const requestRef = useRef();

    // Track keys for polling in animation loop
    const keys = useRef({ e: false });

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

    // Spawn Reward Book Logic (Updated to Gift Box)
    const spawnRewardBook = () => {
        if (!scene || !playerRef.current) return;

        console.log("Spawning Gift Box!");

        // Spawn gift strictly in front of player
        const playerPos = playerRef.current.position.clone();

        // Calculate offset in front of player
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyEuler(playerRef.current.rotation);
        direction.normalize();

        // Spawn 2 units in front, slightly elevated
        const spawnPos = playerPos.add(direction.multiplyScalar(2.0));
        spawnPos.y += 1.0;

        const giftGroup = new THREE.Group();
        giftGroup.position.copy(spawnPos);
        giftGroup.lookAt(playerRef.current.position);
        giftGroup.userData = { isGift: true }; // Tag it

        // Materials - Cartoon Style
        const boxMat = new THREE.MeshStandardMaterial({
            color: 0xE74C3C, // Red
            roughness: 0.4,
            metalness: 0.1
        });
        const ribbonMat = new THREE.MeshStandardMaterial({
            color: 0xF1C40F, // Yellow/Gold
            roughness: 0.4,
            metalness: 0.3
        });

        // --- Box Base ---
        const boxGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.castShadow = true;
        giftGroup.add(box);

        // --- Box Lid ---
        const lidGeo = new THREE.BoxGeometry(0.65, 0.15, 0.65);
        const lid = new THREE.Mesh(lidGeo, boxMat);
        lid.position.y = 0.35; // Top of box
        lid.castShadow = true;
        giftGroup.add(lid);

        // --- Ribbons (Vertical) ---
        // Z-axis ribbon
        const ribbonZGeo = new THREE.BoxGeometry(0.15, 0.61, 0.61);
        const ribbonZ = new THREE.Mesh(ribbonZGeo, ribbonMat);
        giftGroup.add(ribbonZ);

        // X-axis ribbon
        const ribbonXGeo = new THREE.BoxGeometry(0.61, 0.61, 0.15);
        const ribbonX = new THREE.Mesh(ribbonXGeo, ribbonMat);
        giftGroup.add(ribbonX);

        // --- Ribbons (Lid) ---
        const lidRibbonZ = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.66), ribbonMat);
        lidRibbonZ.position.y = 0.35;
        giftGroup.add(lidRibbonZ);

        const lidRibbonX = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.16, 0.16), ribbonMat);
        lidRibbonX.position.y = 0.35;
        giftGroup.add(lidRibbonX);

        // --- Bow Knot ---
        const knotGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const knot = new THREE.Mesh(knotGeo, ribbonMat);
        knot.position.y = 0.45;
        giftGroup.add(knot);

        // --- Bow Loops ---
        const loopGeo = new THREE.TorusGeometry(0.15, 0.05, 8, 32);

        const loop1 = new THREE.Mesh(loopGeo, ribbonMat);
        loop1.position.set(0.1, 0.5, 0);
        loop1.rotation.set(0, 0, -Math.PI / 3);
        loop1.scale.set(1, 1, 0.6); // Flatten logic
        giftGroup.add(loop1);

        const loop2 = new THREE.Mesh(loopGeo, ribbonMat);
        loop2.position.set(-0.1, 0.5, 0);
        loop2.rotation.set(0, 0, Math.PI / 3);
        loop2.scale.set(1, 1, 0.6);
        giftGroup.add(loop2);

        // Light


        scene.add(giftGroup);
        giftRef.current = giftGroup; // Store reference

        // Floating Animation
        const animateGift = () => {
            if (giftGroup && giftGroup.parent) { // Only animate if still in scene
                giftGroup.rotation.y += 0.01;
                giftGroup.position.y = spawnPos.y + Math.sin(Date.now() * 0.003) * 0.2;
                requestAnimationFrame(animateGift);
            }
        }
        animateGift();
    };

    useEffect(() => {
        if (!scene) return;

        // Initialize Letters
        const configs = [
            { type: 'I', pos: new THREE.Vector3(-2.0, 4.6, -0.6) },
            { type: 'I', pos: new THREE.Vector3(3.4, 11.4, -2.8) },
            { type: 'T', pos: new THREE.Vector3(3.8, 18.1, -0.6) }
        ];

        const newLetters = configs.map(config => {
            return new LetterObject(scene, config.pos, config.type);
        });

        lettersRef.current = newLetters;
        setLetters(newLetters);
        setTotalLetters(newLetters.length);

        // Reset state
        setFoundCount(0);
        setCompleted(false);
        setGiftOpened(false);
        setActiveTarget(null);
        activeTargetRef.current = null;
        giftRef.current = null;

        console.log("Letter Hunt Initialized with", newLetters.length, "letters");

        // Animation Loop
        const animate = () => {
            const time = Date.now() * 0.001;

            let closestDist = Infinity;
            let closestLetter = null;
            let isGiftTarget = false;

            if (playerRef.current) {
                const playerPos = playerRef.current.position;

                // 1. Check Letters
                lettersRef.current.forEach(letter => {
                    letter.update(time);

                    if (!letter.isCollected) {
                        const dx = playerPos.x - letter.mesh.position.x;
                        const dz = playerPos.z - letter.mesh.position.z;
                        const distHz = Math.sqrt(dx * dx + dz * dz);
                        const dy = Math.abs(playerPos.y - letter.mesh.position.y);

                        if (distHz < 2.0 && dy < 3.0) {
                            if (distHz < closestDist) {
                                closestDist = distHz;
                                closestLetter = letter;
                            }
                        }
                    }
                });

                // 2. Check Gift (if visible and letters done)
                if (giftRef.current && !giftOpened) {
                    const dx = playerPos.x - giftRef.current.position.x;
                    const dz = playerPos.z - giftRef.current.position.z;
                    const distHz = Math.sqrt(dx * dx + dz * dz);

                    if (distHz < 2.0) {
                        // Gift takes priority or becomes the target if no letter is strictly closer
                        if (distHz < closestDist) {
                            closestDist = distHz;
                            closestLetter = {
                                letterType: 'GIFT',
                                mesh: giftRef.current,
                                collect: () => { } // Dummy
                            };
                            isGiftTarget = true;
                        }
                    }
                }
            }

            // Update Active Target & Interact
            if (closestLetter) {
                // Check for interaction
                if (keys.current.f || keys.current.e) {

                    if (isGiftTarget) {
                        // Handle Gift Open
                        console.log("Opening Gift!");
                        setGiftOpened(true);

                        // Remove gift logic
                        if (giftRef.current) {
                            scene.remove(giftRef.current);
                            giftRef.current = null; // Stops the local animation loop check
                            // Play particle effect here if available?
                        }

                        // Reset target
                        closestLetter = null;
                        closestDist = Infinity;

                    } else {
                        // Handle Letter Collection
                        console.log("Collecting letter:", closestLetter.letterType);
                        closestLetter.collect();

                        setFoundCount(prevCount => {
                            const newCount = prevCount + 1;
                            const total = lettersRef.current.length;
                            if (newCount === total) {
                                setCompleted(true);
                                spawnRewardBook();
                                // Mark mission as completed
                                setMissions(prev => prev.map(m => m.id === 'mission-8' ? { ...m, completed: true } : m));
                            }
                            return newCount;
                        });

                        closestLetter = null;
                        closestDist = Infinity;
                    }
                }
            }

            // Sync React State for UI Prompt
            // We use a simple ref check to avoid React state update spam
            const targetType = closestLetter ? closestLetter.letterType : null;
            const currentType = activeTargetRef.current ? activeTargetRef.current.letterType : null;

            if (targetType !== currentType) {
                console.log("Target changed to:", targetType);
                activeTargetRef.current = closestLetter;
                setActiveTarget(closestLetter);
                setShowPrompt(!!closestLetter);
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(requestRef.current);
            newLetters.forEach(l => l.dispose());
        };
    }, [scene]);

    if (!scene) return null;

    return (
        <>
            {/* HUD Overlay */}
            <div className="fixed top-24 right-4 bg-blue-900/80 text-white p-4 rounded-xl border border-blue-400/50 pointer-events-none select-none backdrop-blur-sm shadow-lg z-[9999]">
                <h3 className="text-xl font-bold text-blue-200 mb-1 shadow-black drop-shadow-md">IIT Hunt</h3>
                <div className="flex items-center gap-2">
                    <div className="text-3xl font-mono mobile-font text-blue-300 font-bold">{foundCount} / {totalLetters}</div>
                </div>

                {completed && (
                    <div className="mt-2 text-yellow-300 animate-pulse font-bold text-lg border-t border-blue-500/30 pt-2">
                        🎁 GIFT UNLOCKED!
                    </div>
                )}
            </div>

            {/* Interaction Prompt - Standard Game Style */}
            {showPrompt && !giftOpened && (
                <div className="interaction-prompt" style={{ zIndex: 9999 }}>
                    <div className="key-hint">E</div>
                    <span>
                        {activeTarget?.letterType === 'GIFT' ? 'Open Gift' : 'Collect Letter'}
                    </span>
                </div>
            )}

            {/* Completion Message - Stage 1 (Gift Appears) */}
            {completed && !giftOpened && (
                <div className="fixed top-24 right-4 mt-20 bg-black/60 text-white p-4 rounded-xl border border-yellow-500/50 backdrop-blur-sm shadow-lg pointer-events-none z-50">
                    <p className="text-yellow-400 font-bold animate-pulse">🎁 GIFT UNLOCKED!</p>
                    <p className="text-sm text-gray-200">A special gift has appeared nearby.</p>
                </div>
            )}

            {/* Final Success - Stage 2 (Gift Opened) */}
            {giftOpened && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white p-10 rounded-3xl text-center border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.5)] z-[10000] animate-bounce">
                    <h1 className="text-5xl font-bold text-yellow-500 mb-4 tracking-wider">🎉 AMAZING!</h1>
                    <p className="text-2xl font-semibold mb-2">You found the treasure!</p>
                    <p className="text-gray-300">Your SDGP Mission is complete.</p>
                    <div className="mt-6 text-6xl">🏆</div>
                </div>
            )}
        </>
    );
};

export default LetterHunt;
