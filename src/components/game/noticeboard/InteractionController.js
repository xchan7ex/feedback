import * as THREE from 'three';
import gsap from 'gsap';

export class InteractionController {
    constructor(camera, scene, canvasElement) {
        this.camera = camera;
        this.scene = scene;
        this.canvas = canvasElement;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.center = new THREE.Vector2(0, 0); // For pointer lock (center screen)

        this.interactables = [];
        this.hoveredObject = null;

        // Input state
        this.isPointerLocked = false;

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = !!document.pointerLockElement;
        });
    }

    setInteractables(list) {
        this.interactables = list;
    }

    update() {
        // If pointer locked, raycast from center of screen.
        // If mouse cursor (unlocked), raycast from mouse pos.
        // The game switches states. 

        if (this.isPointerLocked) {
            this.raycaster.setFromCamera(this.center, this.camera);
        } else {
            // Update mouse vector from last known event? 
            // We need a mouse move listener in the system or passed in.
            // For now, assume mainly center raycast for FPS style or rely on passed mouse coords.
            // But wait, "First Click – Cinematic Zoom... Lock player controls... cursor to interaction icon".
            // Actually, usually FPS games use center raycast.
            // But if we zoom in and unlock mouse (to click specific papers), we need mouse coordinates.
            this.raycaster.setFromCamera(this.mouse, this.camera);
        }

        const intersects = this.raycaster.intersectObjects(this.interactables, false);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            // Find the NoticePaper parent if we hit a mesh
            let target = hit;
            // Traverse up to find NoticePaper or NoticeBoard
            while (target && !target.isNoticePaper && !target.isNoticeBoard && target.parent) {
                if (target.parent.isNoticePaper) target = target.parent; // Helper property or check class
                else if (target.parent.isNoticeBoard) target = target.parent;
                else target = target.parent;
            }

            // Check if we found a valid component
            // For now, let's assume we attached metadata or simple parent check
            // My NoticePaper class extends Group and has `mesh`. 
            // `hit` is `mesh`. `hit.parent` is `NoticePaper` instance.

            const parent = hit.parent; // The Group

            if (this.hoveredObject !== parent) {
                // Out old
                if (this.hoveredObject && this.hoveredObject.setHover) {
                    this.hoveredObject.setHover(false);
                }

                // In new
                this.hoveredObject = parent;
                if (this.hoveredObject && this.hoveredObject.setHover) {
                    this.hoveredObject.setHover(true);
                }
            }
        } else {
            if (this.hoveredObject) {
                if (this.hoveredObject.setHover) this.hoveredObject.setHover(false);
                this.hoveredObject = null;
            }
        }
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
}
