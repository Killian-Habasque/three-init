import * as THREE from 'three';

class KeyboardControls {
    private keys: { [key: string]: boolean } = {};
    private object: THREE.Object3D; 

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
        const speed = 0.1;

        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.object.position.z -= speed;
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.object.position.z += speed; 
        }
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.object.position.x -= speed; 
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.object.position.x += speed; 
        }
    }
}

export default KeyboardControls;
