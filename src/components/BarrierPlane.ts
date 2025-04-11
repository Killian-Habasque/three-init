import * as CANNON from 'cannon-es';

class BarrierPlane {
    public body: CANNON.Body;

    constructor() {
        const shape = new CANNON.Plane();
        this.body = new CANNON.Body({ mass: 0 });
        this.body.addShape(shape);
        this.body.userData = { type: 'BarrierPlane' };
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    }
}

export default BarrierPlane; 