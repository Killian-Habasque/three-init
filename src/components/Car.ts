
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { enableShadowForModel } from '../lib/shadow';

class Car {
    public mesh: THREE.Object3D;
    public body: CANNON.Body;

    constructor(gltf: GLTF, position: CANNON.Vec3) {
        this.mesh = gltf.scene;
        enableShadowForModel(this.mesh);

        const carShape = new CANNON.Box(new CANNON.Vec3(0.6, 0.5, 1.05));
        this.body = new CANNON.Body({ mass: 1 });
        this.body.addShape(carShape);
        this.body.position.copy(position);
    }

    update() {
        this.mesh.position.copy(this.body.position);
        this.mesh.position.y -= 0.48;
        this.mesh.quaternion.copy(this.body.quaternion);
    }
}

export default Car;