import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { enableShadowForModel } from '../lib/shadow';
import KeyboardControls from '../controls/KeyboardControls';

class Car {
    public mesh: THREE.Object3D;
    public body: CANNON.Body;
    public wheelFL: THREE.Object3D | null = null;
    public wheelFR: THREE.Object3D | null = null;
    public wheelRL: THREE.Object3D | null = null;
    public wheelRR: THREE.Object3D | null = null;
    public steeringGroupFL: THREE.Group | null = null;
    public steeringGroupFR: THREE.Group | null = null;

    private keyboardControls: KeyboardControls | null = null;
    public velocity: number = 0.02;
    public acceleration: number = 0.002;
    public maxSpeed: number = 0.2;
    public friction: number = 0.98;
    public rotationSpeedFactor: number = 0.25;
    public isReversing: boolean = false;

    constructor(gltf: GLTF, position: CANNON.Vec3, enableControls: boolean = true) {
        this.mesh = gltf.scene;
        enableShadowForModel(this.mesh);

        const carShape = new CANNON.Box(new CANNON.Vec3(0.6, 0.5, 1.05));
        this.body = new CANNON.Body({ mass: 1 });
        this.body.addShape(carShape);
        this.body.position.copy(position);
        this.body.quaternion.setFromEuler(0, Math.PI / 2, 0);
        this.body.userData = { type: 'car' };
        if (enableControls) {
            this.keyboardControls = new KeyboardControls();
        }

    }

    setupWheels() {
        this.steeringGroupFL = new THREE.Group();
        this.steeringGroupFR = new THREE.Group();
        this.mesh.add(this.steeringGroupFL);
        this.mesh.add(this.steeringGroupFR);

        this.wheelFL = this.mesh.getObjectByName("Wheel_FL_8");
        this.wheelFR = this.mesh.getObjectByName("Wheel_FR_21");
        this.wheelRL = this.mesh.getObjectByName("Wheel_RL_19");
        this.wheelRR = this.mesh.getObjectByName("Wheel_RR_23");

        if (this.wheelFL) {
            const wheelPositionFL = this.wheelFL.position.clone();
            this.steeringGroupFL.position.copy(wheelPositionFL);
            this.steeringGroupFL.add(this.wheelFL);
            this.wheelFL.position.set(0, 0, 0);
        }
        if (this.wheelFR) {
            const wheelPositionFR = this.wheelFR.position.clone();
            this.steeringGroupFR.position.copy(wheelPositionFR);
            this.steeringGroupFR.add(this.wheelFR);
            this.wheelFR.position.set(0, 0, 0);
        }
    }

    update() {
        this.velocity = Math.max(-this.maxSpeed, Math.min(this.velocity * this.friction, this.maxSpeed));

        const forward = new CANNON.Vec3(0, 0, -1);
        const rotatedForward = new CANNON.Quaternion();
        rotatedForward.copy(this.body.quaternion);
        rotatedForward.vmult(forward, forward);

        this.body.position.x += forward.x * this.velocity;
        this.body.position.z += forward.z * this.velocity;

        const rotationSpeed = Math.abs(this.velocity) * this.rotationSpeedFactor;
        const turnQuaternion = new CANNON.Quaternion();

        if (this.keyboardControls) {
            if (this.keyboardControls.isKeyPressed('ArrowUp') || this.keyboardControls.isKeyPressed('z')) {
                this.velocity -= this.acceleration;
            } else if (this.keyboardControls.isKeyPressed('ArrowDown') || this.keyboardControls.isKeyPressed('s')) {
                this.velocity += this.acceleration;
                this.isReversing = true;
            } else {
                this.isReversing = false;
            }
            if (this.keyboardControls.isKeyPressed('ArrowLeft') || this.keyboardControls.isKeyPressed('q')) {
                turnQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationSpeed);
                this.body.quaternion = this.body.quaternion.mult(turnQuaternion);
            }
            if (this.keyboardControls.isKeyPressed('ArrowRight') || this.keyboardControls.isKeyPressed('d')) {
                turnQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -rotationSpeed);
                this.body.quaternion = this.body.quaternion.mult(turnQuaternion);
            }
        }

        this.mesh.position.copy(this.body.position);
        this.mesh.position.y -= 0.48;
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    updateWheels(delta: number) {
        const wheelRotationSpeed = this.velocity * delta * 350;

        if (this.wheelFL) this.wheelFL.rotation.x -= wheelRotationSpeed;
        if (this.wheelFR) this.wheelFR.rotation.x -= wheelRotationSpeed;
        if (this.wheelRL) this.wheelRL.rotation.x -= wheelRotationSpeed;
        if (this.wheelRR) this.wheelRR.rotation.x -= wheelRotationSpeed;

        if (this.steeringGroupFL && this.steeringGroupFR) {
            const maxSteeringAngle = Math.PI / 6;
            const steeringSpeed = delta * 2;

            const turningKeys = [
                this.keyboardControls?.isKeyPressed('ArrowLeft') || this.keyboardControls?.isKeyPressed('q'),
                this.keyboardControls?.isKeyPressed('ArrowRight') || this.keyboardControls?.isKeyPressed('d')
            ].filter(Boolean).length;

            if (turningKeys === 1) {
                if (this.keyboardControls?.isKeyPressed('ArrowLeft') || this.keyboardControls?.isKeyPressed('q')) {
                    if (!this.isReversing) {
                        this.steeringGroupFL.rotation.y = Math.min(this.steeringGroupFL.rotation.y + steeringSpeed, maxSteeringAngle);
                        this.steeringGroupFR.rotation.y = Math.min(this.steeringGroupFR.rotation.y + steeringSpeed, maxSteeringAngle);
                    } else {
                        this.steeringGroupFL.rotation.y = Math.max(this.steeringGroupFL.rotation.y - steeringSpeed, -maxSteeringAngle);
                        this.steeringGroupFR.rotation.y = Math.max(this.steeringGroupFR.rotation.y - steeringSpeed, -maxSteeringAngle);
                    }
                } else if (this.keyboardControls?.isKeyPressed('ArrowRight') || this.keyboardControls?.isKeyPressed('d')) {
                    if (!this.isReversing) {
                        this.steeringGroupFL.rotation.y = Math.max(this.steeringGroupFL.rotation.y - steeringSpeed, -maxSteeringAngle);
                        this.steeringGroupFR.rotation.y = Math.max(this.steeringGroupFR.rotation.y - steeringSpeed, -maxSteeringAngle);
                    } else {
                        this.steeringGroupFL.rotation.y = Math.min(this.steeringGroupFL.rotation.y + steeringSpeed, maxSteeringAngle);
                        this.steeringGroupFR.rotation.y = Math.min(this.steeringGroupFR.rotation.y + steeringSpeed, maxSteeringAngle);
                    }
                }
            } else {
                this.steeringGroupFL.rotation.y = 0;
                this.steeringGroupFR.rotation.y = 0;
            }
        }
    }
}

export default Car;