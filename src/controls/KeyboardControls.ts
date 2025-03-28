import * as THREE from 'three';

class KeyboardControls {
    private keys: { [key: string]: boolean } = {};
    private object: THREE.Object3D;
    private velocity: number = 0;
    private acceleration: number = 0.002;
    private maxSpeed: number = 0.2;
    private friction: number = 0.98;
    private rotationSpeedFactor: number = 0.25;
    public isReversing: boolean = false;
    private wheelFL: THREE.Object3D;
    private wheelFR: THREE.Object3D;
    private wheelRL: THREE.Object3D;
    private wheelRR: THREE.Object3D;
    private steeringGroupFL: THREE.Group;
    private steeringGroupFR: THREE.Group;
    private initialSteeringFLRotationY: number = 0;
    private initialSteeringFRRotationY: number = 0;

    constructor(object: THREE.Object3D, wheelFL: THREE.Object3D, wheelFR: THREE.Object3D, wheelRL: THREE.Object3D, wheelRR: THREE.Object3D, steeringGroupFL: THREE.Group, steeringGroupFR: THREE.Group) {
        this.object = object;
        this.wheelFL = wheelFL;
        this.wheelFR = wheelFR;
        this.wheelRL = wheelRL;
        this.wheelRR = wheelRR;
        this.steeringGroupFL = steeringGroupFL;
        this.steeringGroupFR = steeringGroupFR;
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        window.addEventListener('keyup', (event) => this.onKeyUp(event));
    }

    private onKeyDown(event: KeyboardEvent) {
        this.keys[event.key] = true;
    }

    private onKeyUp(event: KeyboardEvent) {
        this.keys[event.key] = false;
    }

    update() {
        if (this.keys['ArrowUp'] || this.keys['z']) {
            this.velocity += this.acceleration;
        } else if (this.keys['ArrowDown'] || this.keys['s']) {
            this.velocity -= this.acceleration;
            this.isReversing = true;
        } else {
            this.isReversing = false;
        }

        this.velocity = Math.max(-this.maxSpeed, Math.min(this.velocity * this.friction, this.maxSpeed));

        this.object.translateZ(this.velocity);

        const rotationSpeed = Math.abs(this.velocity) * this.rotationSpeedFactor;
        if (this.keys['ArrowLeft'] || this.keys['q']) {
            this.object.rotation.y += rotationSpeed;
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.object.rotation.y -= rotationSpeed;
        }
    }

    updateWheels(delta: number) {
        const wheelRotationSpeed = this.velocity * delta * 350;

        if (this.wheelFL) this.wheelFL.rotation.x += wheelRotationSpeed;
        if (this.wheelFR) this.wheelFR.rotation.x += wheelRotationSpeed;
        if (this.wheelRL) this.wheelRL.rotation.x += wheelRotationSpeed;
        if (this.wheelRR) this.wheelRR.rotation.x += wheelRotationSpeed;

        if (this.steeringGroupFL && this.steeringGroupFR) {
            const maxSteeringAngle = Math.PI / 6;
            const steeringSpeed = delta * 2;

            const turningKeys = [
                this.keys['ArrowLeft'] || this.keys['q'],
                this.keys['ArrowRight'] || this.keys['d']
            ].filter(Boolean).length;

            if (turningKeys === 1) {
                if (this.keys['ArrowLeft'] || this.keys['q']) {
                    if (!this.isReversing) {
                        this.steeringGroupFL.rotation.y = Math.min(this.steeringGroupFL.rotation.y + steeringSpeed, maxSteeringAngle);
                        this.steeringGroupFR.rotation.y = Math.min(this.steeringGroupFR.rotation.y + steeringSpeed, maxSteeringAngle);
                    } else {
                        this.steeringGroupFL.rotation.y = Math.max(this.steeringGroupFL.rotation.y - steeringSpeed, -maxSteeringAngle);
                        this.steeringGroupFR.rotation.y = Math.max(this.steeringGroupFR.rotation.y - steeringSpeed, -maxSteeringAngle);
                    }
                } else if (this.keys['ArrowRight'] || this.keys['d']) {
                    if (!this.isReversing) {
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
    }
}

export default KeyboardControls;
