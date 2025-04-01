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

class App {
    private sceneSetup: SceneSetup;
    private controls: CameraControls;
    private clock = new THREE.Clock();

    private cameraOffset: THREE.Vector3 = new THREE.Vector3(0, 6, -7);

    private physics: Physics;
    private debugger: CannonDebugger;
    private carsBot: Car[] = [];
    private car: Car | undefined;
    private cube: Cube;

    constructor() {
        this.sceneSetup = new SceneSetup();
        this.sceneSetup.addDirectionalLight();

        this.controls = new CameraControls(this.sceneSetup.getCamera(), this.sceneSetup.getRenderer().domElement);

        this.physics = new Physics();

        // Cars
        this.sceneSetup.addModel('./src/assets/models/car/scene.glb', (gltf: GLTF) => {
            const carPosition = new CANNON.Vec3(5, 1, 0);
            const car = new Car(gltf, carPosition, false);
            this.carsBot.push(car);
            this.physics.world.addBody(car.body);
            this.sceneSetup.scene.add(car.mesh);
        });

        this.sceneSetup.addModel('./src/assets/models/car/scene.glb', (gltf: GLTF) => {
            const carPosition = new CANNON.Vec3(0, 1, 0);
            this.car = new Car(gltf, carPosition, true);
            this.car.setupWheels();
            this.physics.world.addBody(this.car.body);
            this.sceneSetup.scene.add(this.car.mesh);
        });

        // Map
        this.sceneSetup.addModel('./src/assets/models/map/scene_min.glb', (gltf: GLTF) => {
            const map = gltf.scene;
            map.position.set(0, -3.4, 0);
            map.scale.set(0.65, 0.65, 0.65);
            map.rotation.set(0, Math.PI / 2, 0);
            enableShadowForModel(map);
            this.sceneSetup.scene.add(map);
        });

        // Barrier blocks
        const barriers = [
            { position: new CANNON.Vec3(1.5, 4, 6), size: new CANNON.Vec3(11, 4, 4) },
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
        const cubePosition = new THREE.Vector3(-3, 3, 0); 
        const cubeSize = new THREE.Vector3(1, 1, 1);
        this.cube = new Cube(cubePosition, cubeSize);
        this.sceneSetup.scene.add(this.cube.mesh);
        this.physics.world.addBody(this.cube.body); 

        this.debugger = new CannonDebugger(this.sceneSetup.scene, this.physics.world);

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

        this.physics.update(delta);

        if (this.car) {
            this.car.update();
            this.car.updateWheels(delta);
            const carPosition = this.car.mesh.position; 
            this.sceneSetup.getCamera().position.copy(carPosition).add(this.cameraOffset);
            this.sceneSetup.getCamera().lookAt(carPosition);
        }

        this.carsBot.forEach(carBot => {
            carBot.update();
        });

        this.cube.update();

        this.debugger.update();

        this.sceneSetup.getRenderer().render(this.sceneSetup.getScene(), this.sceneSetup.getCamera());
    }
}

export { App };

