

export class AABBCollider {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    checkCollision(a, b) {
        const dx = Math.abs(a.position.x - b.position.x);
        const dy = Math.abs(a.position.y - b.position.y);
        return dx < (this.width + b.collider.width) / 2 &&
            dy < (this.height + b.collider.height) / 2;
    }
}

