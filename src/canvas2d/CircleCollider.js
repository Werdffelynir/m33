

export class CircleCollider {
    constructor(radius) {
        this.radius = radius;
    }

    checkCollision(a, b) {
        const dist = a.position.distanceTo(b.position);
        return dist < this.radius + b.collider.radius;
    }

    toObject(){
        return {radius: this.radius};
    }

}
