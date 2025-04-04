import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Car from './Car';

class BotCar extends Car {
    private waypoints: THREE.Vector3[];
    private currentWaypointIndex: number = 0;
    public velocity: number = 0.05;
    private isStopped: boolean = false; 

    constructor(gltf: GLTF, position: CANNON.Vec3, waypoints: THREE.Vector3[]) {
        super(gltf, position, false);
        this.waypoints = waypoints;

        this.body.addEventListener('collide', this.onCollision.bind(this));
    }

    onCollision(event: any) {
        if (event.body.userData && event.body.userData.type === 'car') {
            this.stopForCollision();
        }
    }

    stopForCollision() {
        if (!this.isStopped) {
            this.isStopped = true;
            this.velocity = 0.015; 
            setTimeout(() => {
                this.isStopped = false;
                this.velocity = 0.05;
            }, 1000);
        }
    }

    update() {
        if (this.waypoints.length > 0) {
            const target = this.waypoints[this.currentWaypointIndex];
            const direction = new THREE.Vector3().subVectors(target, this.mesh.position);
            const distance = direction.length();

            direction.y = 0; 
            direction.normalize();

            const threshold = 1; 
            if (distance > threshold) {
                this.body.position.x += direction.x * this.velocity;
                this.body.position.z += direction.z * this.velocity;

                const desiredAngle = Math.atan2(direction.x, direction.z);
                const currentQuat = new THREE.Quaternion(
                    this.body.quaternion.x,
                    this.body.quaternion.y,
                    this.body.quaternion.z,
                    this.body.quaternion.w
                );
                const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, desiredAngle, 0));
                currentQuat.slerp(targetQuat, 0.1);
                this.body.quaternion.set(currentQuat.x, currentQuat.y, currentQuat.z, currentQuat.w);

                this.mesh.position.copy(this.body.position);
                this.mesh.position.y -= 0.48;
                this.mesh.quaternion.copy(this.body.quaternion);
            } else {
                this.currentWaypointIndex++;
                if (this.currentWaypointIndex >= this.waypoints.length) {
                    this.currentWaypointIndex = 0; 
                }
            }
        }
    }
}

export default BotCar;