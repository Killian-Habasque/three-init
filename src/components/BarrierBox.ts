import * as CANNON from 'cannon-es';
import HitMarker from './HitMarker';
import Score from './Score';

class BarrierBox {
    public body: CANNON.Body;
    private hitMarker: HitMarker;
    private lastCollisionTime: number = 0;
    public score: Score;
    private gameStartTime: number;

    constructor(position: CANNON.Vec3, size: CANNON.Vec3, score: Score) {
        const shape = new CANNON.Box(size);
        this.body = new CANNON.Body({ mass: 0 });
        this.body.addShape(shape);
        this.body.position.copy(position);
        this.body.addEventListener('collide', this.onCollision.bind(this));
        this.body.userData = { type: 'BarrierBox' };
        this.hitMarker = new HitMarker();
        this.score = score;
        this.gameStartTime = Date.now();
    }

    onCollision(event: any) {
        if (event.body.userData && event.body.userData.type === 'car') {
            const currentTime = Date.now();
            
            if (currentTime - this.gameStartTime < 2000) {
                return;
            }
            if (currentTime - this.lastCollisionTime > 1000) {
                this.score.reduce(1);
                this.hitMarker.show('-1');
                this.lastCollisionTime = currentTime;
            }
        }
    }
}

export default BarrierBox; 