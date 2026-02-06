import {Vector2} from "./Vector2.js";


export class RigidBody {
    constructor(mass = 1, drag = 0) {
        this.mass = mass;
        this.drag = drag;
        this.force = new Vector2();
    }

    applyForce(f) {
        this.force.add(f);
    }

    update(actor, dt) {
        const acc = this.force.copy().multiply(1 / this.mass);
        actor.velocity.add(acc.multiply(dt));
        actor.velocity.multiply(1 - this.drag);
        actor.position.add(actor.velocity.copy().multiply(dt));
        this.force.set(0, 0); // clear force
    }

    toObject(){
        return {mass: this.mass, drag: this.drag, force: this.force.toObject()};
    }

}

