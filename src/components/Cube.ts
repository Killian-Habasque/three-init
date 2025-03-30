import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class Cube {
    mesh: THREE.Mesh;
    body: CANNON.Body;

    constructor(position: THREE.Vector3 = new THREE.Vector3(0, 0, 0), size: THREE.Vector3 = new THREE.Vector3(1, 1, 1)) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;

        const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
        this.body = new CANNON.Body({ mass: 1 });
        this.body.addShape(shape);
        this.body.position.copy(position);
    }

    update() {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }
}

export default Cube; 