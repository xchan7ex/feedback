import * as THREE from 'three';
import { NoticePaper } from './NoticePaper';

export class NoticeBoard extends THREE.Group {
    constructor(scene) {
        super();
        this.scene = scene;
        this.papers = [];

        this.initStructure();

        // Add to scene immediately? No, let the system handle placement.
    }

    initStructure() {
        // 1. Frame
        const frameGeo = new THREE.BoxGeometry(4, 3, 0.1);
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x5c4033, // Dark Wood
            roughness: 0.9,
            metalness: 0.1
        });
        this.frame = new THREE.Mesh(frameGeo, frameMat);
        this.frame.castShadow = true;
        this.frame.receiveShadow = true;
        this.add(this.frame);

        // 2. Cork Board Surface
        const boardGeo = new THREE.BoxGeometry(3.6, 2.6, 0.05);
        const boardMat = new THREE.MeshStandardMaterial({
            color: 0xd2b48c, // Tan/Cork
            roughness: 1.0,
            metalness: 0.0
        });
        this.surface = new THREE.Mesh(boardGeo, boardMat);
        this.surface.position.z = 0.05; // Slightly protruding from frame center
        this.surface.receiveShadow = true;
        this.add(this.surface);

        // Add interactivity marker/tag?
    }

    addNotice(config) {
        const paper = new NoticePaper(config);

        // Determine position (random or fixed from config)
        let x, y, rot;
        if (config.x !== undefined && config.y !== undefined) {
            x = config.x;
            y = config.y;
            rot = config.rotation !== undefined ? config.rotation : 0;
        } else {
            x = (Math.random() - 0.5) * 2.5; // Spread
            y = (Math.random() - 0.5) * 1.5;
            rot = (Math.random() - 0.5) * 0.4; // Slight tilt
        }

        paper.position.set(x, y, 0.08 + Math.random() * 0.02); // On top of cork with slight variation
        paper.rotation.z = rot;

        // Save original placement for animations
        paper.originalPosition.copy(paper.position);
        paper.originalRotation.copy(paper.rotation);

        this.add(paper);
        this.papers.push(paper);
        return paper;
    }

    getInteractables() {
        // Return meshes that can be raycasted
        // We want to return the PAPER MESHES primarily, but maybe the board itself for general zoom?
        // The requirement says: "Hover State... detect when player is aiming at the notice board." AND "Papers... each paper is its own interactive object."

        // So distinct targets.
        const targets = [this.frame, this.surface];
        this.papers.forEach(p => targets.push(p.mesh));
        return targets;
    }
}
