

export class CollisionSystem {
    constructor(actors = []) {
        this.actors = actors;
    }

    update() {
        for (let i = 0; i < this.actors.length; i++) {
            const a = this.actors[i];
            if (!a.collider) continue;
            for (let j = i + 1; j < this.actors.length; j++) {
                const b = this.actors[j];
                if (!b.collider) continue;
                if (a.collider.constructor !== b.collider.constructor) continue;
                if (a.collider.checkCollision(a, b)) {
                    // Simple resolve: push apart
                    const delta = a.position.copy().subtract(b.position);
                    delta.normalize().multiply(1);
                    a.position.add(delta);
                    b.position.subtract(delta);
                }
            }
        }
    }
}

