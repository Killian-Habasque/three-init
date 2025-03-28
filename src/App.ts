import SceneSetup from './scenes/Scene';
import CameraControls from './controls/CameraControls';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import KeyboardControls from './controls/KeyboardControls';

class App {
    private sceneSetup: SceneSetup;
    private controls: CameraControls;
    private clock = new THREE.Clock();

    private keyboardControls: KeyboardControls | null = null;  
    
    private cameraOffset: THREE.Vector3 = new THREE.Vector3(0, 2, -5);

    constructor() {
        this.sceneSetup = new SceneSetup();
        this.sceneSetup.addPlane();
        this.sceneSetup.addDirectionalLight();

        this.sceneSetup.addModel('./src/models/car/scene.glb', (gltf: GLTF) => {
            const carMesh = gltf.scene;
            carMesh.traverse((node) => {
                if (node instanceof THREE.Mesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            this.sceneSetup.scene.add(carMesh);

            const steeringGroupFL = new THREE.Group();
            const steeringGroupFR = new THREE.Group();
            carMesh.add(steeringGroupFL);
            carMesh.add(steeringGroupFR);

            const wheelFL = carMesh.getObjectByName("Wheel_FL_8");
            const wheelFR = carMesh.getObjectByName("Wheel_FR_21");
            const wheelRL = carMesh.getObjectByName("Wheel_RL_19");
            const wheelRR = carMesh.getObjectByName("Wheel_RR_23");
            if (wheelFL) {
                const wheelPositionFL = wheelFL.position.clone();
                steeringGroupFL.position.copy(wheelPositionFL);
                steeringGroupFL.add(wheelFL);
                wheelFL.position.set(0, 0, 0);
            }

            if (wheelFR) {
                const wheelPositionFR = wheelFR.position.clone();
                steeringGroupFR.position.copy(wheelPositionFR);
                steeringGroupFR.add(wheelFR);
                wheelFR.position.set(0, 0, 0);
            }
            this.keyboardControls = new KeyboardControls(carMesh, wheelFL, wheelFR, wheelRL, wheelRR, steeringGroupFL, steeringGroupFR);
        });

        this.sceneSetup.addModel('./src/models/map/low_poly_city.glb', (gltf: GLTF) => {
            const map = gltf.scene;
            map.position.set(0, -3.4, 0);
            map.scale.set(0.65, 0.65, 0.65);
            map.rotation.set(0, Math.PI / 2, 0);
            this.sceneSetup.scene.add(map);
        });

        this.controls = new CameraControls(this.sceneSetup.getCamera(), this.sceneSetup.getRenderer().domElement);

        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.sceneSetup.getRenderer().setAnimationLoop(this.animate.bind(this));

  
    }

    onWindowResize() {
        const camera = this.sceneSetup.getCamera();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        this.sceneSetup.getRenderer().setSize(window.innerWidth, window.innerHeight);
    }


    animate() {
        this.controls.update();
        const delta = this.clock.getDelta();

        if (this.keyboardControls) {
            this.keyboardControls.update();
            this.keyboardControls.updateWheels(delta);
            const carPosition = this.keyboardControls.object.position;
            this.sceneSetup.getCamera().position.copy(carPosition).add(this.cameraOffset);
            this.sceneSetup.getCamera().lookAt(carPosition);
        }

        this.sceneSetup.getRenderer().render(this.sceneSetup.getScene(), this.sceneSetup.getCamera());
    }
}

export { App };

