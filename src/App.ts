import SceneSetup from './scenes/Scene';
import CameraControls from './controls/CameraControls';
import KeyboardControls from './controls/KeyboardControls';
import AppGUI from './helpers/GUI';
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

var camera, scene, renderer, mixer, clock;

class App {
    private sceneSetup: SceneSetup;
    private controls: CameraControls;
    private keyboardControls: KeyboardControls;
    private mixer;
    private clock = new THREE.Clock();

    constructor() {
        // scene
        const world = this.sceneSetup = new SceneSetup();
        const plane = this.sceneSetup.addPlane();

        // lights
        const directionalLight = this.sceneSetup.addDirectionalLight();

        // meshs
        const cubeMesh = this.sceneSetup.addCube();
        const cubeMesh2 = this.sceneSetup.addCube();
        cubeMesh2.position.set(3, 1, 0)

        // 3D models
        this.sceneSetup.addModel('./src/models/dummy_animated/dummy_animated.glb', (gltf: GLTF) => {
            world.scene.add(gltf.scene);
        });
        this.sceneSetup.addModel('./src/models/dummy_animated/dummy_animated.glb', (gltf: GLTF) => {
            world.scene.add(gltf.scene);
            this.keyboardControls = new KeyboardControls(gltf.scene);
            this.mixer = new THREE.AnimationMixer(gltf.scene);
            this.mixer.clipAction(gltf.animations[1]).play();
        });

        // controls
        this.controls = new CameraControls(this.sceneSetup.getCamera(), this.sceneSetup.getRenderer().domElement);
        // this.keyboardControls = new KeyboardControls(cubeMesh2);

        // helpers
        new AppGUI(cubeMesh, directionalLight);

        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.onWindowResize);

        this.animate = this.animate.bind(this);
        this.sceneSetup.getRenderer().setAnimationLoop(this.animate);
    }

    onWindowResize() {
        const camera = this.sceneSetup.getCamera();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        this.sceneSetup.getRenderer().setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.controls.update();
        if (this.keyboardControls) {
            this.keyboardControls.update();
        }
        var delta = this.clock.getDelta();

        if (this.mixer) this.mixer.update(delta);

        this.sceneSetup.getRenderer().render(this.sceneSetup.getScene(), this.sceneSetup.getCamera());
    }
}

export { App };
