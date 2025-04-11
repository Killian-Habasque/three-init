import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Car from './Car';
import Score from './Score';
import HitMarker from './HitMarker';

class BotCar extends Car {
    private waypoints: THREE.Vector3[];
    private currentWaypointIndex: number = 0;
    public velocity: number = 4;
    private isStopped: boolean = false;
    public score: Score;
    private lastCollisionTime: number = 0;
    private hitMarker: HitMarker;

    private mixer: THREE.AnimationMixer | null = null;
    private animations: THREE.AnimationClip[] = [];
    private spawnAnimation: THREE.AnimationAction | null = null;

    constructor(gltf: GLTF, position: CANNON.Vec3, waypoints: THREE.Vector3[], score: Score) {
        super(gltf, position, false);
        this.waypoints = waypoints;
        this.score = score;
        this.body.userData = { type: 'carBot' };
        this.body.addEventListener('collide', this.onCollision.bind(this));
        this.hitMarker = new HitMarker();
        this.setupAnimations(gltf);
    }

    onCollision(event: any) {
        if (event.body.userData && event.body.userData.type === 'car') {
            const currentTime = Date.now();

            if (currentTime - this.lastCollisionTime > 1000) {
                this.stopForCollision();
                this.score.reduce(5);
                this.hitMarker.show('-5');
                this.lastCollisionTime = currentTime;
            }

        }

        if (event.body.userData && event.body.userData.type === 'carBot') {
            this.stopForCollision();
        }
    }

    stopForCollision() {
        if (!this.isStopped) {
            this.isStopped = true;
            this.velocity = 1;
            setTimeout(() => {
                this.isStopped = false;
                this.velocity = 4;
            }, 1000);
        }
    }
    setupAnimations(gltf: GLTF) {
        if (gltf.animations && gltf.animations.length > 0) {
            this.animations = gltf.animations;
            this.mixer = new THREE.AnimationMixer(this.mesh);

            if (this.animations.length > 0) {
                const spawnClip = this.animations[0];
                const trimmedClip = THREE.AnimationUtils.subclip(spawnClip, 'trimmedSpawn', 7 * 30, 10 * 30); 
                
                this.spawnAnimation = this.mixer.clipAction(trimmedClip);
                this.spawnAnimation.setLoop(THREE.LoopOnce, 1);
                this.spawnAnimation.clampWhenFinished = true;
                this.spawnAnimation.play();
            }
        }
    }
    update(delta: number) {
        if (this.waypoints.length > 0) {
            if (this.mixer) {
                this.mixer.update(delta * 2);
            }
            const target = this.waypoints[this.currentWaypointIndex];
            const direction = new THREE.Vector3().subVectors(target, this.mesh.position);
            const distance = direction.length();

            direction.y = 0;
            direction.normalize();

            const threshold = 1;
            if (distance > threshold) {
                this.body.position.x += direction.x * this.velocity * delta;
                this.body.position.z += direction.z * this.velocity * delta;

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