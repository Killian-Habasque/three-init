import SceneSetup from './scenes/Scene';
import CameraControls from './controls/CameraControls';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import KeyboardControls from './controls/KeyboardControls';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger'


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
    private carMesh2: THREE.Object3D;
    private carBody2: CANNON.Body;

    constructor() {
        this.sceneSetup = new SceneSetup();
        // this.sceneSetup.addPlane();
        this.sceneSetup.addDirectionalLight();

        this.sceneSetup.addModel('./src/models/car/scene.glb', (gltf: GLTF) => {
            this.carMesh2 = gltf.scene;
            this.carMesh2.traverse((node) => {
                if (node instanceof THREE.Mesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            this.sceneSetup.scene.add(this.carMesh2);

            const carShape = new CANNON.Box(new CANNON.Vec3(0.6, 0.5, 1.05));
            this.carBody2 = new CANNON.Body({ mass: 1 });
            this.carBody2.addShape(carShape);
            this.carBody2.position.set(5, 0, 0);
            this.world.addBody(this.carBody2);

            this.carMesh2.position.copy(this.carBody2.position);
            this.carMesh2.quaternion.copy(this.carBody2.quaternion);
            // ajout un fonction pour l'avoir dans update
        });

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

            const carShape = new CANNON.Box(new CANNON.Vec3(0.6, 0.5, 1.05));
            const carBody = new CANNON.Body({ mass: 1 });
            carBody.addShape(carShape);
            carBody.position.set(0, 1, 0);
            this.world.addBody(carBody);

            carMesh.position.copy(carBody.position);

            this.keyboardControls = new KeyboardControls(carMesh, wheelFL, wheelFR, wheelRL, wheelRR, steeringGroupFL, steeringGroupFR, carBody);
        });

        this.sceneSetup.addModel('./src/models/map/scene_min.glb', (gltf: GLTF) => {
            const map = gltf.scene;
            map.position.set(0, -3.4, 0);
            map.scale.set(0.65, 0.65, 0.65);
            map.rotation.set(0, Math.PI / 2, 0);
            map.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            this.sceneSetup.scene.add(map);
        });

        this.controls = new CameraControls(this.sceneSetup.getCamera(), this.sceneSetup.getRenderer().domElement);

        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);

        // const planeGeometry = new THREE.PlaneGeometry(40, 40);
        // const planeMesh = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial());
        // planeMesh.rotateX(-Math.PI / 2);
        // planeMesh.position.z = -6;
        // planeMesh.receiveShadow = true;
        // this.sceneSetup.scene.add(planeMesh);

        const cubeShape2 = new CANNON.Box(new CANNON.Vec3(11, 4, 4));
        const cubeBody2 = new CANNON.Body({ mass: 0 });
        cubeBody2.addShape(cubeShape2);
        cubeBody2.position.set(1.5, 4, 6);
        this.world.addBody(cubeBody2);

        const cubeShapePark = new CANNON.Box(new CANNON.Vec3(11, 4, 9));
        const cubeBodyPark = new CANNON.Body({ mass: 0 });
        cubeBodyPark.addShape(cubeShapePark);
        cubeBodyPark.position.set(1.5, 4, -12);
        this.world.addBody(cubeBodyPark);

        const cubeShapeRight = new CANNON.Box(new CANNON.Vec3(20, 4, 2));
        const cubeBodyRight = new CANNON.Body({ mass: 0 });
        cubeBodyRight.addShape(cubeShapeRight);
        cubeBodyRight.position.set(1.5, 4, 16);
        this.world.addBody(cubeBodyRight);

        const cubeShapeLeft = new CANNON.Box(new CANNON.Vec3(20, 4, 2));
        const cubeBodyLeft = new CANNON.Body({ mass: 0 });
        cubeBodyLeft.addShape(cubeShapeLeft);
        cubeBodyLeft.position.set(1.5, 4, -27);
        this.world.addBody(cubeBodyLeft);

        const cubeShape3 = new CANNON.Box(new CANNON.Vec3(4, 4, 30));
        const cubeBody3 = new CANNON.Body({ mass: 0 });
        cubeBody3.addShape(cubeShape3);
        cubeBody3.position.set(21, 4, -15);
        this.world.addBody(cubeBody3);

        const cubeShape4 = new CANNON.Box(new CANNON.Vec3(4, 4, 30));
        const cubeBody4 = new CANNON.Body({ mass: 0 });
        cubeBody4.addShape(cubeShape4);
        cubeBody4.position.set(-18, 4, -15);
        this.world.addBody(cubeBody4);

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
        this.controls.update();
        const delta = this.clock.getDelta();

        if (this.keyboardControls) {
            this.keyboardControls.update();
            this.keyboardControls.updateWheels(delta);
            const carPosition = this.keyboardControls.object.position;
            this.sceneSetup.getCamera().position.copy(carPosition).add(this.cameraOffset);
            this.sceneSetup.getCamera().lookAt(carPosition);
        }
        if (this.carMesh2) {
            this.carMesh2.position.copy(this.carBody2.position);
            this.carMesh2.position.y -= 0.48;
            this.carMesh2.quaternion.copy(this.carBody2.quaternion);
        }
        const fixedTimeStep = 1 / 60;
        const maxSubSteps = 5;
        this.world.step(fixedTimeStep, delta, maxSubSteps);

        this.cubeMesh.position.set(this.cubeBody.position.x, this.cubeBody.position.y, this.cubeBody.position.z);
        this.cubeMesh.quaternion.set(this.cubeBody.quaternion.x, this.cubeBody.quaternion.y, this.cubeBody.quaternion.z, this.cubeBody.quaternion.w);

        this.debugger.update();

        this.sceneSetup.getRenderer().render(this.sceneSetup.getScene(), this.sceneSetup.getCamera());
    }
}

export { App };

