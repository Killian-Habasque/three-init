import * as CANNON from 'cannon-es';

class Physics {
    world: CANNON.World;

    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0); 
    }

    update(delta: number) {
        const fixedTimeStep = 1 / 60;
        const maxSubSteps = 5;
        this.world.step(fixedTimeStep, delta, maxSubSteps);
    }
}

export default Physics; 