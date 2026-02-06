
export class PhysicsSystem {
    constructor(actors = []) {
        this.actors = actors;
    }

    update(dt) {
        for (const a of this.actors) {
            a.update(dt);
        }
    }
}

