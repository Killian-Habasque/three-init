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

    constructor(object: THREE.Object3D) {
        this.object = object;
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
}

export default KeyboardControls;
