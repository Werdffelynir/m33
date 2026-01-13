/**
 *
 * ```
 * Common Use Cases
 *     .normalize() — use when direction matters but not speed.
 *     .dot() — use for angle comparisons, projections.
 *     .cross() — for orientation and turning decisions.
 *     .rotate(angle) — helpful in space games or bullet spread.
 *     .lerp() — used for interpolation / easing / smooth movement.
 * ```
 */
export class Vector2 {

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Clone the vector
    copy() {
        return new Vector2(this.x, this.y);
    }
    // clone() {
    //     return new Vector2(this.x, this.y);
    // }

    // Set new coordinates
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    setVector(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    // Add another vector
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    // Subtract another vector
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    // Multiply by scalar
    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    // Divide by scalar
    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }

    limit(max) {
        const len = this.length();
        if (len > max) {
            return this.normalize().multiply(max);
        }
        return this.copy();
    }
    limitComponents(min, max) {
        this.x = Math.max(min, Math.min(this.x, max));
        this.y = Math.max(min, Math.min(this.y, max));
        return this;
    }
    // Get the length (magnitude)
    length() {
        return Math.hypot(this.x, this.y);
    }

    // Squared length (faster for comparisons)
    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    // Normalize the vector (unit vector)
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }

    // Distance to another vector
    distanceTo(v) {
        return Math.hypot(this.x - v.x, this.y - v.y);
    }

    // Squared distance (faster)
    distanceSq(v) {
        return (this.x - v.x) ** 2 + (this.y - v.y) ** 2;
    }

    eqPosition(v) {
        return this.x === v.x && this.y === v.y;
    }
    // distanceSq(v) {
    //     const dx = this.x - v.x;
    //     const dy = this.y - v.y;
    //     return dx * dx + dy * dy;
    // }

    // Dot product (angle between vectors)
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    // Cross product (in 2D returns scalar)
    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    // Get angle to another vector in radians
    angleTo(v) {
        const len1Sq = this.x * this.x + this.y * this.y;
        const len2Sq = v.x * v.x + v.y * v.y;
        if (len1Sq === 0 || len2Sq === 0) return 0;

        const dot = this.x * v.x + this.y * v.y;
        const cosine = dot / Math.sqrt(len1Sq * len2Sq);
        return Math.acos(Math.max(-1, Math.min(1, cosine)));
    }
    fromAngle (angle) {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }

    // angleTo(v) {
    //     const dot = this.dot(v);
    //     const len1 = this.length();
    //     const len2 = v.length();
    //     if (len1 === 0 || len2 === 0) return 0;
    //     const cosine = dot / (len1 * len2);
    //     return Math.acos(Math.min(Math.max(cosine, -1), 1)); // Clamp between [-1, 1]
    // }

    // Rotate the vector by angle (in radians)10k+ objects
    rotate(angle) {
        const x = this.x, y = this.y, a = angle;
        const c = Math.cos(a), s = Math.sin(a);
        this.x = x * c - y * s;
        this.y = x * s + y * c;
        return this;
    }

    // Є ще низькорівневий SIMD / Float32Array підхід, який ще швидший
    // 100k+ обʼєктів
    // rotate(angle) {
    //     const cos = Math.cos(angle);
    //     const sin = Math.sin(angle);
    //     const x = this.x;
    //     this.x = x * cos - this.y * sin;
    //     this.y = x * sin + this.y * cos;
    //     return this;
    // }

    // Returns true if x and y are both 0
    isZero(threshold = 0.00001) {
        return Math.abs(this.x) < threshold && Math.abs(this.y) < threshold;
    }

    // Set vector to zero
    zero() {
        this.x = 0;
        this.y = 0;
        return this;
    }


    // Linear interpolation to another vector
    lerp(target, t) {
        this.x += (target.x - this.x) * t;
        this.y += (target.y - this.y) * t;
        return this;
    }

    // Return a plain object
    toObject() {
        return { x: this.x, y: this.y };
    }

    // Static: create from angle and length
    static fromAngle(angle, length = 1) {
        return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
    }
}

