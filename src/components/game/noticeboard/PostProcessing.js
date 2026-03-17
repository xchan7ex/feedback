import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export class PostProcessingManager {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.composer = new EffectComposer(renderer);
        this.composer.setSize(this.width, this.height);

        // Base Render Pass
        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        // 1. Unreal Bloom Pass (Subtle glow)
        // resolution, strength, radius, threshold
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.width, this.height),
            0.4,  // strength (subtle by default)
            0.1,  // radius
            0.85  // threshold (only bright/emissive parts bloom)
        );
        this.composer.addPass(this.bloomPass);

        // 2. DOF / Bokeh Pass (Cinematic Focus)
        // To make this work properly, focus distance needs to be dynamically updated based on raycast target
        this.bokehPass = new BokehPass(scene, camera, {
            focus: 1.0,
            aperture: 0.0001, // Small aperture = deep focus (initially off/subtle)
            maxblur: 0.0,
            width: this.width,
            height: this.height
        });
        // We modify the shader uniforms manually sometimes for smoother transitions
        this.composer.addPass(this.bokehPass);

        // Output Pass (SRGB Encoding, etc.)
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);

        // Bind resize
        window.addEventListener('resize', this.onResize);
    }

    setFocus(distance, smoothness = 0.1) {
        // Determine target focus values
        const targetFocus = distance;
        const currentFocus = this.bokehPass.uniforms['focus'].value;

        // Simple lerp for focus 
        this.bokehPass.uniforms['focus'].value += (targetFocus - currentFocus) * smoothness;

        // Aperture logic: wide open (blur) when zoomed in, closed (sharp) when distant
        // distance < 5 -> aperture high (blur background)
        // distance > 5 -> aperture low (sharp everything)
        const targetAperture = distance < 3 ? 0.001 : 0.0001;
        const currentAperture = this.bokehPass.uniforms['aperture'].value;
        this.bokehPass.uniforms['aperture'].value += (targetAperture - currentAperture) * smoothness;

        const targetBlur = distance < 3 ? 0.01 : 0.0;
        const currentBlur = this.bokehPass.uniforms['maxblur'].value;
        this.bokehPass.uniforms['maxblur'].value += (targetBlur - currentBlur) * smoothness;
    }

    onResize = () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.composer.setSize(this.width, this.height);
        this.bloomPass.setSize(new THREE.Vector2(this.width, this.height));
    };

    render() {
        this.composer.render();
    }

    dispose() {
        window.removeEventListener('resize', this.onResize);
        this.composer.dispose();
    }
}
