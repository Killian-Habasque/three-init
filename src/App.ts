import SceneSetup from './scenes/Scene';
import CameraControls from './controls/CameraControls';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import KeyboardControls from './controls/KeyboardControls';

class App {
    private sceneSetup: SceneSetup;
    private controls: CameraControls;
    private clock = new THREE.Clock();

    private wheelFL: THREE.Object3D | null = null;
    private wheelFR: THREE.Object3D | null = null;
    private wheelRL: THREE.Object3D | null = null;
    private wheelRR: THREE.Object3D | null = null;

    private isTurningLeft: boolean = false;
    private isTurningRight: boolean = false;

    private steeringGroupFL: THREE.Group | null = null;
    private steeringGroupFR: THREE.Group | null = null;
    private keyboardControls: KeyboardControls | null = null;  

    private initialSteeringFLRotationY: number = 0;
    private initialSteeringFRRotationY: number = 0;

    private cameraOffset: THREE.Vector3 = new THREE.Vector3(0, 2, -5);

    constructor() {
        this.sceneSetup = new SceneSetup();
        this.sceneSetup.addPlane();
        this.sceneSetup.addDirectionalLight();

        this.sceneSetup.addModel('./src/models/car/scene.glb', (gltf: GLTF) => {
            const carMesh = gltf.scene;
            this.sceneSetup.scene.add(carMesh);

            this.steeringGroupFL = new THREE.Group();
            this.steeringGroupFR = new THREE.Group();
            carMesh.add(this.steeringGroupFL);
            carMesh.add(this.steeringGroupFR);

            this.wheelFL = carMesh.getObjectByName("Wheel_FL_8");
            this.wheelFR = carMesh.getObjectByName("Wheel_FR_21");
            this.wheelRL = carMesh.getObjectByName("Wheel_RL_19");
            this.wheelRR = carMesh.getObjectByName("Wheel_RR_23");

            if (this.wheelFL) {
                const wheelPositionFL = this.wheelFL.position.clone();
                this.steeringGroupFL.position.copy(wheelPositionFL);
                this.steeringGroupFL.add(this.wheelFL);
                this.wheelFL.position.set(0, 0, 0);
                this.initialSteeringFLRotationY = this.steeringGroupFL.rotation.y;
            }

            if (this.wheelFR) {
                const wheelPositionFR = this.wheelFR.position.clone();
                this.steeringGroupFR.position.copy(wheelPositionFR);
                this.steeringGroupFR.add(this.wheelFR);
                this.wheelFR.position.set(0, 0, 0);
                this.initialSteeringFRRotationY = this.steeringGroupFR.rotation.y;
            }

            this.keyboardControls = new KeyboardControls(carMesh);
        });

        this.controls = new CameraControls(this.sceneSetup.getCamera(), this.sceneSetup.getRenderer().domElement);

        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.sceneSetup.getRenderer().setAnimationLoop(this.animate.bind(this));

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    onWindowResize() {
        const camera = this.sceneSetup.getCamera();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        this.sceneSetup.getRenderer().setSize(window.innerWidth, window.innerHeight);
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowLeft' || event.key === 'q') {
            this.isTurningRight = true;
        } else if (event.key === 'ArrowRight' || event.key === 'd') {
            this.isTurningLeft = true;
        }
    }

    handleKeyUp(event: KeyboardEvent) {
        if (event.key === 'ArrowRight' || event.key === 'd') {
            this.isTurningLeft = false;
        } else if (event.key === 'ArrowLeft' || event.key === 'q') {
            this.isTurningRight = false;
        }
    }

    animate() {
        this.controls.update();
        const delta = this.clock.getDelta();

        if (this.wheelRL) this.wheelRL.rotation.x += delta * 30;
        if (this.wheelRR) this.wheelRR.rotation.x += delta * 30;

        if (this.wheelFL) this.wheelFL.rotation.x += delta * 30;
        if (this.wheelFR) this.wheelFR.rotation.x += delta * 30;

        if (this.keyboardControls) {
            this.keyboardControls.update();
            const carPosition = this.keyboardControls.object.position;
            this.sceneSetup.getCamera().position.copy(carPosition).add(this.cameraOffset);
            this.sceneSetup.getCamera().lookAt(carPosition);
        }

        if (this.steeringGroupFL && this.steeringGroupFR) {
            const maxSteeringAngle = Math.PI / 6;
            const steeringSpeed = delta * 2;

            const turningKeys = [
                this.isTurningLeft,
                this.isTurningRight
            ].filter(Boolean).length;

            if (turningKeys === 1) {
                if (this.isTurningLeft) {
                    if (this.keyboardControls?.isReversing) {
                        this.steeringGroupFL.rotation.y = Math.min(this.steeringGroupFL.rotation.y + steeringSpeed, maxSteeringAngle);
                        this.steeringGroupFR.rotation.y = Math.min(this.steeringGroupFR.rotation.y + steeringSpeed, maxSteeringAngle);
                    } else {
                        this.steeringGroupFL.rotation.y = Math.max(this.steeringGroupFL.rotation.y - steeringSpeed, -maxSteeringAngle);
                        this.steeringGroupFR.rotation.y = Math.max(this.steeringGroupFR.rotation.y - steeringSpeed, -maxSteeringAngle);
                    }
                } else if (this.isTurningRight) {
                    if (this.keyboardControls?.isReversing) {
                        this.steeringGroupFL.rotation.y = Math.max(this.steeringGroupFL.rotation.y - steeringSpeed, -maxSteeringAngle);
                        this.steeringGroupFR.rotation.y = Math.max(this.steeringGroupFR.rotation.y - steeringSpeed, -maxSteeringAngle);
                    } else {
                        this.steeringGroupFL.rotation.y = Math.min(this.steeringGroupFL.rotation.y + steeringSpeed, maxSteeringAngle);
                        this.steeringGroupFR.rotation.y = Math.min(this.steeringGroupFR.rotation.y + steeringSpeed, maxSteeringAngle);
                    }
                }
            } else {
                this.steeringGroupFL.rotation.y = this.initialSteeringFLRotationY;
                this.steeringGroupFR.rotation.y = this.initialSteeringFRRotationY;
            }
        }

        this.sceneSetup.getRenderer().render(this.sceneSetup.getScene(), this.sceneSetup.getCamera());
    }
}

export { App };

