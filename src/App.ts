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
import * as CANNON from 'cannon-es';
import AppGUI from './helpers/GUI';
import BotCar from './components/BotCar';
import Score from './components/Score';
import WaveNotification from './components/WaveNotification';

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
    private cameraFollowEnabled: boolean = true;
    public score: Score;
    private lastBotAddedAtScore: number = 0;
    private waveNotification: WaveNotification;

    constructor() {
        this.sceneSetup = new SceneSetup();
        this.controls = new CameraControls(this.sceneSetup.getCamera(), this.sceneSetup.getRenderer().domElement);
        this.physics = new Physics();
        this.score = new Score();
        this.waveNotification = new WaveNotification();

        this.sceneSetup.addDirectionalLight();

        this.addCar()
        this.addMap()
        this.addCarBot();
        // this.addCarBot(2);

        if (showGUI) {
            this.debugger = new CannonDebugger(this.sceneSetup.scene, this.physics.world);
            new AppGUI(this.sceneSetup.getDirectionalLight(), this.debugger, (value: boolean) => {
                this.cameraFollowEnabled = value;
            });
        }

        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.sceneSetup.getRenderer().setAnimationLoop(this.animate.bind(this));
    }

    private addCar() {
        this.sceneSetup.addModel('/assets/models/car/scene.glb', (gltf: GLTF) => {
            const carPosition = new CANNON.Vec3(0, 1, 1.5);
            this.car = new Car(gltf, carPosition, true, this.score);
            this.car.setupWheels();
            this.physics.world.addBody(this.car.body);
            this.sceneSetup.scene.add(this.car.mesh);
        });

    }
    private addMap() {
        this.sceneSetup.addModel('/assets/models/map/scene_min.glb', (gltf: GLTF) => {
            const map = gltf.scene;
            map.position.set(0, -3.4, 0);
            map.scale.set(0.65, 0.65, 0.65);
            map.rotation.set(0, Math.PI / 2, 0);
            enableShadowForModel(map);
            this.sceneSetup.scene.add(map);
        });

        const barriers = [
            { position: new CANNON.Vec3(1.7, 4, 5.5), size: new CANNON.Vec3(10.7, 4, 3.5) },
            { position: new CANNON.Vec3(1.7, 4, -12), size: new CANNON.Vec3(10.7, 4, 8.5) },
            { position: new CANNON.Vec3(1.5, 4, 16), size: new CANNON.Vec3(20, 4, 2) },
            { position: new CANNON.Vec3(1.5, 4, -27.5), size: new CANNON.Vec3(20, 4, 2) },
            { position: new CANNON.Vec3(21.5, 4, -15), size: new CANNON.Vec3(4, 4, 30) },
            { position: new CANNON.Vec3(-18, 4, -15), size: new CANNON.Vec3(4, 4, 30) }
        ];
        barriers.forEach(barrier => {
            const barrierBox = new BarrierBox(barrier.position, barrier.size, this.score);
            this.physics.world.addBody(barrierBox.body);
        });
        const barrierPlane = new BarrierPlane();
        this.physics.world.addBody(barrierPlane.body);
    }

    private addCarBot(index?: number | undefined) {
        this.sceneSetup.addModel('/assets/models/car/scene.glb', (gltf: GLTF) => {
            const waypointPatterns = [
                [
                    new THREE.Vector3(14, 1, 1),
                    new THREE.Vector3(14, 1, 10.5),
                    new THREE.Vector3(-11, 1, 10.5),
                    new THREE.Vector3(-11, 1, 1)
                ],
                [
                    new THREE.Vector3(16, 1, 1),
                    new THREE.Vector3(16, 1, -24),
                    new THREE.Vector3(-13, 1, -24),
                    new THREE.Vector3(-13, 1, 1)
                ],
                [
                    new THREE.Vector3(-10.5, 1, -1.5),
                    new THREE.Vector3(-10.5, 1, -22),
                    new THREE.Vector3(14, 1, -22),
                    new THREE.Vector3(14, 1, -1.5)
                ],
                [
                    new THREE.Vector3(-13, 1, -1.5),
                    new THREE.Vector3(-13, 1, 13),
                    new THREE.Vector3(16, 1, 13),
                    new THREE.Vector3(16, 1, -1.5)
                ]
            ];
            const scenarioIndex = index ?? Math.floor(Math.random() * waypointPatterns.length)
            const waypoints = waypointPatterns[scenarioIndex];
            
            const randomWaypointIndex = Math.floor(Math.random() * waypoints.length);
            const randomWaypoint = waypoints[randomWaypointIndex];
            const startPosition = new CANNON.Vec3(randomWaypoint.x, 6, randomWaypoint.z);
            const nextIndex = (randomWaypointIndex + 1) % waypoints.length;
            const reorderedWaypoints = [];
            for (let i = 0; i < waypoints.length; i++) {
                const index = (nextIndex + i) % waypoints.length;
                reorderedWaypoints.push(waypoints[index]);
            }

            const car = new BotCar(gltf, startPosition, reorderedWaypoints, this.score);
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
            this.score.addWave();
            const waveNumber = this.score.getWave();
            this.waveNotification.show(`Wave ${waveNumber}: 🚗 New bot appears !`);
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

        if (this.debugger && this.debugger.enabled) {
            this.debugger.update();
        }
        this.sceneSetup.getRenderer().render(this.sceneSetup.getScene(), this.sceneSetup.getCamera());
    }

    onWindowResize() {
        const camera = this.sceneSetup.getCamera();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        this.sceneSetup.getRenderer().setSize(window.innerWidth, window.innerHeight);
    }
}

export { App };

