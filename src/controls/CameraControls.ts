import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

class CameraControls {
    controls: OrbitControls;

    constructor(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLElement) {
        this.controls = new OrbitControls(camera, rendererDomElement);
        camera.position.set(0, 20, 20);
        this.controls.update();
    }

    update() {
        this.controls.update();
    }
}

export default CameraControls; 