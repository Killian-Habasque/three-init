import * as THREE from 'three';

class KeyboardControls {
    private keys: { [key: string]: boolean } = {};
    private object: THREE.Object3D; 
    private isMoving: boolean = false;
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
        const speed = 0.05;
        const rotationSpeed = 0.03; 

        const movingKeys = [
            this.keys['ArrowDown'],
            this.keys['z'],
            this.keys['ArrowUp'],
            this.keys['s']
        ].filter(Boolean).length;

        this.isMoving = movingKeys === 1;

        this.isReversing = this.keys['ArrowDown'] || this.keys['s'];

        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.object.translateZ(-speed);
        }
        if (this.keys['ArrowUp'] || this.keys['z']) {
            this.object.translateZ(speed); 
        }
        if (this.isMoving) {
            if (this.keys['ArrowLeft'] || this.keys['q']) {
                this.object.rotation.y += rotationSpeed; 
            }
            if (this.keys['ArrowRight'] || this.keys['d']) {
                this.object.rotation.y -= rotationSpeed;  
            }
        }
    }
}

export default KeyboardControls;
