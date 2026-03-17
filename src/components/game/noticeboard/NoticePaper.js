import * as THREE from 'three';
import gsap from 'gsap';

export class NoticePaper extends THREE.Group {
    constructor(config = {}) {
        super();
        this.config = {
            width: config.width || 0.6,
            height: config.height || 0.8,
            color: config.color || 0xf8f1e0, // Creamy paper color
            text: config.text || "Notice\n\nDefault Content",
            type: config.type || "standard", // standard, wanted, handwritten
            id: config.id || Math.random().toString(36).substr(2, 9),
            ...config
        };

        this.isHovered = false;
        this.isSelected = false;
        this.originalPosition = new THREE.Vector3();
        this.originalRotation = new THREE.Euler();

        this.initMesh();
        this.initContent();
    }

    initMesh() {
        // Segmented plane for bending/curling
        const geometry = new THREE.PlaneGeometry(this.config.width, this.config.height, 16, 16);

        // Add some random vertex displacement for crumpled/aged look
        const posAttribute = geometry.attributes.position;
        for (let i = 0; i < posAttribute.count; i++) {
            const x = posAttribute.getX(i);
            const y = posAttribute.getY(i);
            const z = posAttribute.getZ(i);
            // Slight noise
            const noise = (Math.random() - 0.5) * 0.015;
            // Curl edges slightly (z-displacement based on distance from center interactive with corner logic)
            // Simple curl at bottom right
            const distFromBottomRight = Math.sqrt(Math.pow(x - this.config.width / 2, 2) + Math.pow(y + this.config.height / 2, 2));
            const curl = Math.max(0, 0.1 - distFromBottomRight * 0.2);

            posAttribute.setZ(i, z + noise + curl);
        }
        geometry.computeVertexNormals();

        // Material - PBR-like
        this.material = new THREE.MeshStandardMaterial({
            color: this.config.color,
            roughness: 0.8, // Paper is rough
            metalness: 0.0,
            side: THREE.DoubleSide,
            emissive: 0x000000,
            emissiveIntensity: 0,
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Pin (Thumbtack)
        const pinGeo = new THREE.CylinderGeometry(0.02, 0.005, 0.05, 8);
        const pinHeadGeo = new THREE.SphereGeometry(0.03, 16, 16);
        const pinMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.3, metalness: 0.5 });

        this.pin = new THREE.Group();
        const pinStem = new THREE.Mesh(pinGeo, pinMat);
        pinStem.rotation.x = Math.PI / 2;
        const pinHead = new THREE.Mesh(pinHeadGeo, pinMat);
        pinHead.position.z = 0.025;

        this.pin.add(pinStem);
        this.pin.add(pinHead);
        this.pin.position.set(0, this.config.height / 2 - 0.05, 0.02); // Top centeish

        this.add(this.mesh);
        this.add(this.pin);
    }

    initContent() {
        // Generate texture using HTML5 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 1024; // Portrait
        const ctx = canvas.getContext('2d');

        // Bg (transparent or matching paper color to blend)
        ctx.fillStyle = '#' + this.config.color.toString(16).padStart(6, '0');
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill simplistic base

        // Text Style
        ctx.fillStyle = '#1a1a1a'; // Ink color
        ctx.font = 'bold 48px "Times New Roman", serif';
        ctx.textAlign = 'center';

        // Draw Text
        const lines = this.config.text.split('\n');
        let y = 100;

        lines.forEach((line, i) => {
            if (i === 0) { // Header
                ctx.font = 'bold 64px "Courier New", monospace';
                ctx.fillText(line.toUpperCase(), canvas.width / 2, y);
                y += 80;
                // Underline
                ctx.beginPath();
                ctx.moveTo(50, y - 40);
                ctx.lineTo(canvas.width - 50, y - 40);
                ctx.strokeStyle = '#1a1a1a';
                ctx.lineWidth = 4;
                ctx.stroke();
                y += 60;
            } else {
                ctx.font = '36px "Courier New", monospace';
                ctx.fillText(line, canvas.width / 2, y);
                y += 50;
            }
        });

        // Texture
        const texture = new THREE.CanvasTexture(canvas);
        this.mesh.material.map = texture;
        this.mesh.material.needsUpdate = true;
    }

    // ─── Interaction States ───

    setHover(active) {
        if (this.isSelected) return; // Don't hover if already focused
        this.isHovered = active;

        // Visual feedback
        gsap.to(this.mesh.material, {
            emissiveIntensity: active ? 0.3 : 0,
            duration: 0.3
        });

        if (active) {
            this.mesh.material.emissive.setHex(0xffaa00);
            // Subtle flutter
            gsap.to(this.rotation, {
                z: this.originalRotation.z + (Math.random() - 0.5) * 0.05,
                duration: 0.5,
                yoyo: true,
                repeat: 1
            });
            // Play sound (mock) note: handle in Manager/System
        } else {
            gsap.to(this.rotation, {
                z: this.originalRotation.z,
                duration: 0.5
            });
        }
    }

    // Lift animation when clicked
    liftForRead() {
        this.isSelected = true;

        // Store original state
        this.originalPosition.copy(this.position);
        this.originalRotation.copy(this.rotation);

        // Animate to "read" position (relative to camera or board center)
        // Actually, usually we move the CAMERA to the board, but for reading 
        // we might want the paper to pop out slightly or just stay put while camera zooms.
        // The requirement says "Animate one pinned paper slightly lifting forward."

        gsap.to(this.position, {
            z: this.originalPosition.z + 0.2, // Move forward
            y: this.originalPosition.y,
            x: this.originalPosition.x,
            duration: 0.5,
            ease: "back.out(1.2)"
        });

        gsap.to(this.rotation, {
            x: 0,
            y: 0,
            z: 0, // Straighten
            duration: 0.5
        });

        // Remove pin visual temporarily? Or keep it? 
        // "Unpin paper" -> maybe hide pin
        gsap.to(this.pin.scale, { x: 0, y: 0, z: 0, duration: 0.2 });
    }

    putBack() {
        this.isSelected = false;

        gsap.to(this.position, {
            x: this.originalPosition.x,
            y: this.originalPosition.y,
            z: this.originalPosition.z,
            duration: 0.6,
            ease: "power2.inOut"
        });

        gsap.to(this.rotation, {
            x: this.originalRotation.x,
            y: this.originalRotation.y,
            z: this.originalRotation.z,
            duration: 0.6
        });

        // Show pin
        gsap.to(this.pin.scale, { x: 1, y: 1, z: 1, duration: 0.3, delay: 0.4 });
        // Reset emissive
        this.mesh.material.emissiveIntensity = 0;
    }

    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.map.dispose();
        this.mesh.material.dispose();
        this.remove(this.mesh);
    }
}
