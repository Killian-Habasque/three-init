import SceneSetup from './scenes/Scene';
import CameraControls from './controls/CameraControls';
import KeyboardControls from './controls/KeyboardControls';
import AppGUI from './helpers/GUI';
import * as THREE from 'three';

class App {
    private sceneSetup: SceneSetup;
    private controls: CameraControls;
    private keyboardControls: KeyboardControls;

    constructor() {
        // scene
        this.sceneSetup = new SceneSetup();
        this.sceneSetup.addPlane();

        // lights
        const directionalLight = this.sceneSetup.addDirectionalLight();

        // meshs
        const cubeMesh = this.sceneSetup.addCube();
        const cubeMesh2 = this.sceneSetup.addCube();
        cubeMesh2.position.set(3, 1, 0)

        // controls
        this.controls = new CameraControls(this.sceneSetup.getCamera(), this.sceneSetup.getRenderer().domElement);
        this.keyboardControls = new KeyboardControls(cubeMesh2);

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
        this.keyboardControls.update();
        this.sceneSetup.getRenderer().render(this.sceneSetup.getScene(), this.sceneSetup.getCamera());
    }
}

export { App };
