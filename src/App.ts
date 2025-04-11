import SceneSetup from './scenes/Scene';
import CameraControls from './controls/CameraControls';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Physics from './physics/Physics';
import CannonDebugger from 'cannon-es-debugger';
import BarrierBox from './components/BarrierBox';
import { enableShadowForModel } from '../src/lib/shadow';
import Car from './components/Car';
import BarrierPlane from './components/BarrierPlane';
import Cube from './components/Cube';
import * as CANNON from 'cannon-es';
import AppGUI from './helpers/GUI';
import BotCar from './components/BotCar';
import Score from './components/Score';

const showGUI = import.meta.env.VITE_SHOW_GUI === 'true';

class App {
    private sceneSetup: SceneSetup;
    private controls: CameraControls;
    private clock = new THREE.Clock();

    private cameraOffset: THREE.Vector3 = new THREE.Vector3(0, 6, -7);

    private physics: Physics;
    private debugger: CannonDebugger | undefined;
    private botsCar: BotCar[] = [];
    private car: Car | undefined;
    // private cube: Cube;
    private cameraFollowEnabled: boolean = true;
    public score: Score;
    private lastBotAddedAtScore: number = 0;

    constructor() {
        this.sceneSetup = new SceneSetup();
        this.sceneSetup.addDirectionalLight();
        this.score = new Score();

        this.controls = new CameraControls(this.sceneSetup.getCamera(), this.sceneSetup.getRenderer().domElement);

        this.physics = new Physics();

        // Cars
        this.sceneSetup.addModel('/assets/models/car/scene.glb', (gltf: GLTF) => {
            const carPosition = new CANNON.Vec3(0, 1, 1.5);
            this.car = new Car(gltf, carPosition, true, this.score);
            this.car.setupWheels();
            this.physics.world.addBody(this.car.body);
            this.sceneSetup.scene.add(this.car.mesh);
        });


        this.addCarBot(0);
        this.addCarBot(1);
        this.addCarBot(2);
        // Map
        this.sceneSetup.addModel('/assets/models/map/scene_min.glb', (gltf: GLTF) => {
            const map = gltf.scene;
            map.position.set(0, -3.4, 0);
            map.scale.set(0.65, 0.65, 0.65);
            map.rotation.set(0, Math.PI / 2, 0);
            enableShadowForModel(map);
            this.sceneSetup.scene.add(map);
        });

        // Barrier blocks
        const barriers = [
            { position: new CANNON.Vec3(1.5, 4, 5.5), size: new CANNON.Vec3(11, 4, 3.5) },
            { position: new CANNON.Vec3(1.5, 4, -12), size: new CANNON.Vec3(11, 4, 9) },
            { position: new CANNON.Vec3(1.5, 4, 16), size: new CANNON.Vec3(20, 4, 2) },
            { position: new CANNON.Vec3(1.5, 4, -27), size: new CANNON.Vec3(20, 4, 2) },
            { position: new CANNON.Vec3(21, 4, -15), size: new CANNON.Vec3(4, 4, 30) },
            { position: new CANNON.Vec3(-18, 4, -15), size: new CANNON.Vec3(4, 4, 30) }
        ];
        barriers.forEach(barrier => {
            const barrierBox = new BarrierBox(barrier.position, barrier.size);
            this.physics.world.addBody(barrierBox.body);
        });

        // Barrier plane
        const barrierPlane = new BarrierPlane();
        this.physics.world.addBody(barrierPlane.body);

        // Cube
        // const cubePosition = new THREE.Vector3(-3, 3, 0); 
        // const cubeSize = new THREE.Vector3(1, 1, 1);
        // this.cube = new Cube(cubePosition, cubeSize);
        // this.sceneSetup.scene.add(this.cube.mesh);
        // this.physics.world.addBody(this.cube.body); 

        if (showGUI) {
            this.debugger = new CannonDebugger(this.sceneSetup.scene, this.physics.world);

            const appGUI = new AppGUI(this.sceneSetup.getDirectionalLight(), this.debugger, (value: boolean) => {
                this.cameraFollowEnabled = value;
            });
        }

        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.sceneSetup.getRenderer().setAnimationLoop(this.animate.bind(this));
    }

    onWindowResize() {
        const camera = this.sceneSetup.getCamera();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        this.sceneSetup.getRenderer().setSize(window.innerWidth, window.innerHeight);
    }

    private addCarBot(index?: number | undefined) {
        this.sceneSetup.addModel('/assets/models/car/scene.glb', (gltf: GLTF) => {
            const waypointPatterns = [
                [
                    new THREE.Vector3(14, 1, 1),
                    new THREE.Vector3(14, 1, 10.5),
                    new THREE.Vector3(-11, 1, 10.5),
                    new THREE.Vector3(-11, 1, 1),
                    new THREE.Vector3(-11, 1, 1)
                ],
                [
                    new THREE.Vector3(16, 1, 1),
                    new THREE.Vector3(16, 1, -24),
                    new THREE.Vector3(-13, 1, -24),
                    new THREE.Vector3(-13, 1, 1),
                    new THREE.Vector3(-13, 1, 1)
                ],
                [
                    new THREE.Vector3(-10.5, 1, -1.5),
                    new THREE.Vector3(-10.5, 1, -22),
                    new THREE.Vector3(14, 1, -22),
                    new THREE.Vector3(14, 1, -1.5),
                    new THREE.Vector3(14, 1, -1.5)
                ]
            ];
            const scenarioIndex = index ?? Math.floor(Math.random() * waypointPatterns.length)
            const waypoints = waypointPatterns[scenarioIndex];

            let startPosition;
            switch (scenarioIndex) {
                case 0:
                    startPosition = new CANNON.Vec3(6, 4, 1);
                    break;
                case 1:
                    startPosition = new CANNON.Vec3(10, 4, 1);
                    break;
                case 2:
                    startPosition = new CANNON.Vec3(-8, 4, -1.5);
                    break;
                default:
                    startPosition = new CANNON.Vec3(6, 4, 1);
            }

            const car = new BotCar(gltf, startPosition, waypoints, this.score);
            this.botsCar.push(car);
            this.physics.world.addBody(car.body);
            this.sceneSetup.scene.add(car.mesh);
        });
    }

    animate() {
        this.controls.update();
        const delta = this.clock.getDelta();
        this.physics.update(delta);


        const currentScore = this.score.getScore();
        if (currentScore >= 5 && currentScore % 5 === 0 && currentScore > this.lastBotAddedAtScore) {
            console.log("New bot !!!")
            this.addCarBot();
            this.lastBotAddedAtScore = currentScore;
        }

        if (this.car) {
            this.car.update(delta);
            this.car.updateWheels(delta);
            if (this.cameraFollowEnabled) {
                const carPosition = this.car.mesh.position;
                this.sceneSetup.getCamera().position.copy(carPosition).add(this.cameraOffset);
                this.sceneSetup.getCamera().lookAt(carPosition);
            }
        }

        this.botsCar.forEach(carBot => {
            carBot.update(delta);
        });

        // this.cube.update();

        if (this.debugger && this.debugger.enabled) {
            this.debugger.update();
        }

        this.sceneSetup.getRenderer().render(this.sceneSetup.getScene(), this.sceneSetup.getCamera());
    }
}

export { App };

