import {Vector2} from "./Vector2.js";


export class Particle {
    constructor(x, y, life = 1) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2();
        this.life = life; // seconds
    }

    update(dt) {
        this.position.add(this.velocity.copy().multiply(dt));
        this.life -= dt;
    }

    isAlive() {
        return this.life > 0;
    }
}

