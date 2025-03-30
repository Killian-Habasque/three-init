import * as CANNON from 'cannon-es';

class BarrierBlock {
    public body: CANNON.Body;

    constructor(position: CANNON.Vec3, size: CANNON.Vec3) {
        const shape = new CANNON.Box(size);
        this.body = new CANNON.Body({ mass: 0 });
        this.body.addShape(shape);
        this.body.position.copy(position);
    }
}

export default BarrierBlock; 