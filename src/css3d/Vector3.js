export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x, y, z) {
        this.x = x; this.y = y; this.z = z;
        return this;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(v) {
        this.x = v.x; this.y = v.y; this.z = v.z;
        return this;
    }

    equals(v) {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    
    // Math
    add(v) {
        this.x += v.x; this.y += v.y; this.z += v.z;
        return this;
    }

    sub(v) {
        this.x -= v.x; this.y -= v.y; this.z -= v.z;
        return this;
    }

    multiply(v) {
        this.x *= v.x; this.y *= v.y; this.z *= v.z;
        return this;
    }

    divide(v) {
        this.x /= v.x; this.y /= v.y; this.z /= v.z;
        return this;
    }

    multiplyScalar(s) {
        this.x *= s; this.y *= s; this.z *= s;
        return this;
    }

    divideScalar(s) {
        if (s !== 0) {
            const inv = 1 / s;
            this.x *= inv; this.y *= inv; this.z *= inv;
        } else {
            this.x = this.y = this.z = 0;
        }
        return this;
    }

    negate() {
        this.x = -this.x; this.y = -this.y; this.z = -this.z;
        return this;
    }



    // Length, distances
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    distanceTo(v) {
        return Math.sqrt(this.distanceToSquared(v));
    }

    distanceToSquared(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    manhattanDistanceTo(v) {
        return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
    }

    // Normalization
    normalize() {
        return this.divideScalar(this.length() || 1);
    }

    setLength(l) {
        return this.normalize().multiplyScalar(l);
    }

    // Vectors
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    angleTo(v) {
        const theta = this.dot(v) / (this.length() * v.length());
        return Math.acos(Math.min(Math.max(theta, -1), 1));
    }

    projectOnVector(v) {
        const scalar = this.dot(v) / v.lengthSq();
        return this.copy(v.clone().multiplyScalar(scalar));
    }

    reflect(normal) {
        // віддзеркалення: v - 2 * (v·n) * n
        return this.sub(normal.clone().multiplyScalar(2 * this.dot(normal)));
    }

    // Auxiliary
    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;
        return this;
    }

    min(v) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        this.z = Math.min(this.z, v.z);
        return this;
    }

    max(v) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        this.z = Math.max(this.z, v.z);
        return this;
    }

    clamp(min, max) {
        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
        this.z = Math.max(min.z, Math.min(max.z, this.z));
        return this;
    }

    toArray() {
        return [this.x, this.y, this.z];
    }

    fromArray(arr) {
        this.x = arr[0]; this.y = arr[1]; this.z = arr[2];
        return this;
    }

    toString() {
        return `Vector3(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)})`;
    }
}
