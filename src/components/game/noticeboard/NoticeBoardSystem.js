import * as THREE from 'three';
import { NoticeBoard } from './NoticeBoard';
import { NoticeManager } from './NoticeManager';
import { InteractionController } from './InteractionController';
import { PostProcessingManager } from './PostProcessing';
import gsap from 'gsap';

export class NoticeBoardSystem {
    constructor(renderer, scene, camera, playerRef) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.playerRef = playerRef;

        // Components
        this.noticeBoard = new NoticeBoard(scene);
        this.noticeBoard.scale.set(0.35, 0.35, 0.35); // Make it smaller as requested
        this.basePosition = new THREE.Vector3(-4.0, 14.6, -13.8); // Lifted up to be visible mid-air (approx eye level on 2nd floor)
        this.noticeBoard.position.copy(this.basePosition);
        this.time = 0;
        this.scene.add(this.noticeBoard);

        this.noticeManager = new NoticeManager(this.noticeBoard);
        this.noticeManager.initializeDefaults();

        this.interactionController = new InteractionController(camera, scene, renderer.domElement);
        this.interactionController.setInteractables(this.noticeBoard.getInteractables());

        // Post Processing
        this.postProcessing = new PostProcessingManager(renderer, scene, camera);

        // State
        this.isZoomed = false;
        this.originalCameraState = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };

        // DOM Element Refs
        this.popupElement = null;
        this.closeButtonElement = null;
    }

    update(deltaTime) {
        // 1. Always update raycasting (cheap) so hover detection works for initial click
        this.interactionController.interactables = this.noticeBoard.getInteractables();
        this.interactionController.update();

        if (!this.isZoomed) {
            // Static position - no floating animation
            this.noticeBoard.position.copy(this.basePosition);
            this.noticeBoard.rotation.set(0, 0, 0);
            // Do NOT render via post-processing - let GameCanvas do a plain renderer.render()
            return false;
        }

        // 2. Post Processing Updates (only when zoomed — expensive)
        const dist = this.camera.position.distanceTo(this.noticeBoard.position);
        this.postProcessing.setFocus(dist);

        // 3. Render via post-processing only when zoomed
        this.postProcessing.render();
        return true; // tells GameCanvas we already rendered
    }

    handleInput(event) {
        if (event.type === 'mousemove') {
            this.interactionController.onMouseMove(event);
        } else if (event.type === 'click') {
            this.handleClick();
        }
    }

    handleClick() {
        const hovered = this.interactionController.hoveredObject;

        if (!this.isZoomed) {
            // Interaction 1: Zoom to board
            // Check if we are hovering THE BOARD or a PAPER on it (but not selected yet)
            if (hovered && (hovered === this.noticeBoard || hovered.parent === this.noticeBoard)) {
                this.enterZoomMode();
            }
        } else {
            // Interaction 2: Click paper to read
            if (hovered && hovered.parent === this.noticeBoard) { // Is a paper
                // If already selected, maybe unselect?
                if (hovered.isSelected) {
                    hovered.putBack();
                    this.hidePopup();
                } else {
                    if (this.currentPaper) {
                        this.currentPaper.putBack();
                        this.hidePopup();
                    }
                    hovered.liftForRead();
                    this.currentPaper = hovered;
                    this.showPopup(hovered.config);
                }
            } else {
                // Click off paper -> Exit zoom or deselect paper
                if (this.currentPaper) {
                    this.currentPaper.putBack();
                    this.hidePopup();
                    this.currentPaper = null;
                } else {
                    this.exitZoomMode();
                }
            }
        }
    }

    enterZoomMode() {
        this.isZoomed = true;

        // Save camera state
        this.originalCameraState.pos.copy(this.camera.position);
        this.originalCameraState.quat.copy(this.camera.quaternion);

        // Release pointer lock so cursor is visible
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        // Calculate target: position camera close and centered on the board
        const boardPos = this.noticeBoard.position.clone();
        const targetPos = boardPos.clone().add(new THREE.Vector3(0, 0, 1.1)); // 1.1 units in front
        const targetLook = boardPos.clone();

        if (this.onZoomEnter) this.onZoomEnter();

        // Animate Camera smoothly
        gsap.to(this.camera.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 1.2,
            ease: "power3.inOut",
            onUpdate: () => {
                this.camera.lookAt(targetLook);
            },
            onComplete: () => {
                // Hide player model AFTER zoom is complete
                if (this.playerRef.current) {
                    this.playerRef.current.visible = false;
                }
            }
        });

        // Show close button
        this.createCloseButton();
    }

    exitZoomMode() {
        if (this.currentPaper) {
            this.currentPaper.putBack();
            this.hidePopup();
            this.currentPaper = null;
        }

        // Remove close button
        this.removeCloseButton();

        // Show player model immediately so it's visible during the transition back
        if (this.playerRef.current) {
            this.playerRef.current.visible = true;
        }

        // Animate camera back to player
        gsap.to(this.camera.position, {
            x: this.originalCameraState.pos.x,
            y: this.originalCameraState.pos.y,
            z: this.originalCameraState.pos.z,
            duration: 1.0,
            ease: "power3.inOut",
            onUpdate: () => {
                if (this.playerRef.current) {
                    this.camera.lookAt(
                        this.playerRef.current.position.x,
                        this.playerRef.current.position.y + 1.2,
                        this.playerRef.current.position.z
                    );
                }
            },
            onComplete: () => {
                this.isZoomed = false;
                if (this.onZoomExit) this.onZoomExit();
            }
        });
    }

    createCloseButton() {
        this.removeCloseButton();

        const btn = document.createElement('button');
        this.closeButtonElement = btn;

        Object.assign(btn.style, {
            position: 'fixed',
            top: '24px',
            right: '24px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#e2e8f0',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '22px',
            cursor: 'pointer',
            zIndex: '10001',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            transition: 'all 0.2s ease',
            opacity: '0',
            fontFamily: 'sans-serif'
        });

        btn.innerHTML = '✕';

        btn.addEventListener('mouseenter', () => {
            btn.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
            btn.style.transform = 'scale(1.1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
            btn.style.transform = 'scale(1)';
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.exitZoomMode();
        });

        document.body.appendChild(btn);

        // Fade in 
        requestAnimationFrame(() => {
            btn.style.opacity = '1';
        });
    }

    removeCloseButton() {
        if (this.closeButtonElement) {
            const el = this.closeButtonElement;
            this.closeButtonElement = null;
            el.style.opacity = '0';
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 200);
        }
    }

    showPopup(config) {
        // Remove existing if any
        this.hidePopup();

        const popup = document.createElement('div');
        this.popupElement = popup;

        // Styles
        Object.assign(popup.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0.9)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            color: '#e2e8f0',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            zIndex: '10002',
            maxWidth: '520px',
            width: '90%',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            opacity: '0',
            transition: 'opacity 0.3s ease, transform 0.3s ease'
        });

        // Close button for popup
        const closeBtn = document.createElement('button');
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            fontFamily: 'sans-serif'
        });
        closeBtn.innerHTML = '✕';
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
            closeBtn.style.color = '#fff';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            closeBtn.style.color = '#94a3b8';
        });
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentPaper) {
                this.currentPaper.putBack();
                this.currentPaper = null;
            }
            this.hidePopup();
        });

        // Title
        const title = document.createElement('h2');
        title.innerText = '📋 Notice';
        Object.assign(title.style, {
            margin: '0 0 16px 0',
            fontSize: '1.4rem',
            color: '#fff',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '12px',
            paddingRight: '30px'
        });

        // Content
        const content = document.createElement('p');
        content.innerHTML = config.text.replace(/\n/g, '<br>');
        Object.assign(content.style, {
            fontSize: '1.05rem',
            lineHeight: '1.7',
            color: '#cbd5e1',
            margin: '0'
        });

        // Type-specific styling
        if (config.type === 'quest') {
            title.innerText = '⚔️ Quest';
            title.style.color = '#fbbf24';
        } else if (config.type === 'warning') {
            title.innerText = '⚠️ Warning';
            title.style.color = '#ef4444';
        }

        popup.appendChild(closeBtn);
        popup.appendChild(title);
        popup.appendChild(content);

        document.body.appendChild(popup);

        // Fade in with scale
        requestAnimationFrame(() => {
            popup.style.opacity = '1';
            popup.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    hidePopup() {
        if (this.popupElement) {
            const el = this.popupElement;
            this.popupElement = null;
            el.style.opacity = '0';
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 300);
        }
    }

    dispose() {
        this.removeCloseButton();
        this.hidePopup();
        this.postProcessing.dispose();
    }
}
