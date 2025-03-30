import SceneSetup from './scenes/Scene';
import CameraControls from './controls/CameraControls';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import KeyboardControls from './controls/KeyboardControls';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger'
import BarrierBlock from './components/BarrierBlock';
import { enableShadowForModel } from '../src/lib/shadow';
import Car from './components/Car'; // Importation de la classe Car


class App {
    private sceneSetup: SceneSetup;
    private controls: CameraControls;
    private clock = new THREE.Clock();

    private keyboardControls: KeyboardControls | null = null;

    private cameraOffset: THREE.Vector3 = new THREE.Vector3(0, 6, -7);

    private world: CANNON.World;
    private cubeBody: CANNON.Body;
    private planeBody: CANNON.Body;
    private cubeMesh: THREE.Mesh;
    private debugger: CannonDebugger;
    private cars: Car[] = [];

    constructor() {
        this.sceneSetup = new SceneSetup();
        // this.sceneSetup.addPlane();
        this.sceneSetup.addDirectionalLight();


        this.sceneSetup.addModel('./src/assets/models/car/scene.glb', (gltf: GLTF) => {
            const carPosition1 = new CANNON.Vec3(5, 1, 0);
            const car1 = new Car(gltf, carPosition1);
            this.cars.push(car1);
            this.world.addBody(car1.body);
            this.sceneSetup.scene.add(car1.mesh);
        });

        this.sceneSetup.addModel('./src/assets/models/car/scene.glb', (gltf: GLTF) => {
            const carPosition1 = new CANNON.Vec3(0, 1, 0);
            const car1 = new Car(gltf, carPosition1);
            this.cars.push(car1);
            this.world.addBody(car1.body);
            this.sceneSetup.scene.add(car1.mesh);

            const steeringGroupFL = new THREE.Group();
            const steeringGroupFR = new THREE.Group();
            car1.mesh.add(steeringGroupFL);
            car1.mesh.add(steeringGroupFR);

            const wheelFL = car1.mesh.getObjectByName("Wheel_FL_8");
            const wheelFR = car1.mesh.getObjectByName("Wheel_FR_21");
            const wheelRL = car1.mesh.getObjectByName("Wheel_RL_19");
            const wheelRR = car1.mesh.getObjectByName("Wheel_RR_23");
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
            this.keyboardControls = new KeyboardControls(car1.mesh, wheelFL, wheelFR, wheelRL, wheelRR, steeringGroupFL, steeringGroupFR, car1.body);
        });

        this.sceneSetup.addModel('./src/assets/models/map/scene_min.glb', (gltf: GLTF) => {
            const map = gltf.scene;
            map.position.set(0, -3.4, 0);
            map.scale.set(0.65, 0.65, 0.65);
            map.rotation.set(0, Math.PI / 2, 0);
            enableShadowForModel(map);
            this.sceneSetup.scene.add(map);
        });

        this.controls = new CameraControls(this.sceneSetup.getCamera(), this.sceneSetup.getRenderer().domElement);

        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);

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
            const barrierBlock = new BarrierBlock(barrier.position, barrier.size);
            this.world.addBody(barrierBlock.body);
        });

        const planeShape = new CANNON.Plane();
        this.planeBody = new CANNON.Body({ mass: 0 });
        this.planeBody.addShape(planeShape);
        this.planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.addBody(this.planeBody);

        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.cubeMesh = new THREE.Mesh(cubeGeometry, new THREE.MeshNormalMaterial());
        this.cubeMesh.position.set(-3, 3, 0);
        this.cubeMesh.castShadow = true;
        this.sceneSetup.scene.add(this.cubeMesh);

        const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        this.cubeBody = new CANNON.Body({ mass: 1 });
        this.cubeBody.addShape(cubeShape);
        this.cubeBody.position.set(this.cubeMesh.position.x, this.cubeMesh.position.y, this.cubeMesh.position.z);
        this.world.addBody(this.cubeBody);

        this.debugger = new CannonDebugger(this.sceneSetup.scene, this.world);

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
        // this.controls.update();
        const delta = this.clock.getDelta();
        const fixedTimeStep = 1 / 60;
        const maxSubSteps = 5;
        this.world.step(fixedTimeStep, delta, maxSubSteps);

        if (this.keyboardControls) {
            this.keyboardControls.update();
            this.keyboardControls.updateWheels(delta);

            const carPosition = this.keyboardControls.object.position;
            this.sceneSetup.getCamera().position.copy(carPosition).add(this.cameraOffset);
            this.sceneSetup.getCamera().lookAt(carPosition);
        }

        this.cars.forEach(car => {
            car.update();
        });



        this.cubeMesh.position.set(this.cubeBody.position.x, this.cubeBody.position.y, this.cubeBody.position.z);
        this.cubeMesh.quaternion.set(this.cubeBody.quaternion.x, this.cubeBody.quaternion.y, this.cubeBody.quaternion.z, this.cubeBody.quaternion.w);

        this.debugger.update();

        this.sceneSetup.getRenderer().render(this.sceneSetup.getScene(), this.sceneSetup.getCamera());
    }
}

export { App };

