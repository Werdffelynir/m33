/**
 * A 4×4 matrix is used to combine all 3D transformations:
 *
 * translate → rotate → scale → perspective
 *
 * CSS matrix3d() has a format of 16 numbers, so Float32Array(16) is ideal.
 * The matrix is stored in column-major format (as in WebGL and CSS).
 * `matrix = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]`
 *
 *
 */
export class Matrix3D {

    constructor(data) {
        this.data = data instanceof Float32Array ? data : new Float32Array(16);
        this.identity();
    }

    identity() {
        const d = this.data;
        d.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this;
    }

    translate(x, y, z) {
        const t = new Matrix3D().identity();
        const d = t.data;
        d[12] = x;
        d[13] = y;
        d[14] = z;
        return this.multiply(t);
    }

    scale(x, y, z) {
        const s = new Matrix3D().identity();
        const d = s.data;
        d[0] = x;
        d[5] = y;
        d[10] = z;
        return this.multiply(s);
    }

    rotate(x, y, z) {
        this.rotateX(x)
        this.rotateY(y)
        this.rotateZ(z)
    }
    rotateX(rad) {
        const c = Math.cos(rad), s = Math.sin(rad);
        const r = new Matrix3D().identity();
        const d = r.data;
        d[5] = c;
        d[6] = s;
        d[9] = -s;
        d[10] = c;
        return this.multiply(r);
    }

    rotateY(rad) {
        const c = Math.cos(rad), s = Math.sin(rad);
        const r = new Matrix3D().identity();
        const d = r.data;
        d[0] = c;
        d[2] = -s;
        d[8] = s;
        d[10] = c;
        return this.multiply(r);
    }

    rotateZ(rad) {
        const c = Math.cos(rad), s = Math.sin(rad);
        const r = new Matrix3D().identity();
        const d = r.data;
        d[0] = c;
        d[1] = s;
        d[4] = -s;
        d[5] = c;
        return this.multiply(r);
    }

    multiply(m) {
        const a = this.data;
        const b = m.data;
        const r = new Float32Array(16);

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                r[col * 4 + row] =
                    a[0 * 4 + row] * b[col * 4 + 0] +
                    a[1 * 4 + row] * b[col * 4 + 1] +
                    a[2 * 4 + row] * b[col * 4 + 2] +
                    a[3 * 4 + row] * b[col * 4 + 3];
            }
        }

        this.data.set(r);
        return this;
    }

    clone() {
        return new Matrix3D(new Float32Array(this.data));
    }

    // does not change the current matrix, but returns a new inverted one
    getInverse() {
    }

    invert() {
        const m = this.data;
        const inv = new Float32Array(16);
        const det = this._invertMatrix(m, inv);
        if (det === 0) {
            console.warn("Matrix3D.invert(): determinant = 0, matrix not invertible");
            return this;
        }
        this.data.set(inv);
        return this;
    }

    /**
     * (standard implementation of inversion - omitted for compactness)
     *  can be taken from WebGL boilerplate or glMatrix
     *
     * @param m
     * @param inv
     * @returns {number}
     * @private
     */
    _invertMatrix(m, inv) {
        return Matrix3D.invertMatrix(m, inv);
    }

    toCSS() {
        return `matrix3d(${Array.from(this.data).map(n => +n.toFixed(10)).join(',')})`;
    }

    toJSON() {
        return Array.from(this.data);
    }

    static fromJSON(arr) {
        return new Matrix3D(new Float32Array(arr));
    }

    convertCSSTransform() {
        const m = this.data;

        // translate
        const tx = m[12], ty = m[13], tz = m[14];

        // scale
        const sx = Math.hypot(m[0], m[1], m[2]);
        const sy = Math.hypot(m[4], m[5], m[6]);
        const sz = Math.hypot(m[8], m[9], m[10]);

        // rotation
        const rotY = Math.asin(-m[2] / sx);
        const rotX = Math.atan2(m[6] / sy, m[10] / sz);
        const rotZ = Math.atan2(m[1] / sx, m[0] / sx);

        return `
        translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, ${tz.toFixed(2)}px)
        rotateX(${(rotX * 180 / Math.PI).toFixed(2)}deg)
        rotateY(${(rotY * 180 / Math.PI).toFixed(2)}deg)
        rotateZ(${(rotZ * 180 / Math.PI).toFixed(2)}deg)
        scale3d(${sx.toFixed(2)}, ${sy.toFixed(2)}, ${sz.toFixed(2)})
    `;
    }
}

Matrix3D.invertMatrix = function (m, inv) {
    inv[0] = m[5] * m[10] * m[15] -
        m[5] * m[11] * m[14] -
        m[9] * m[6] * m[15] +
        m[9] * m[7] * m[14] +
        m[13] * m[6] * m[11] -
        m[13] * m[7] * m[10];

    inv[4] = -m[4] * m[10] * m[15] +
        m[4] * m[11] * m[14] +
        m[8] * m[6] * m[15] -
        m[8] * m[7] * m[14] -
        m[12] * m[6] * m[11] +
        m[12] * m[7] * m[10];

    inv[8] = m[4] * m[9] * m[15] -
        m[4] * m[11] * m[13] -
        m[8] * m[5] * m[15] +
        m[8] * m[7] * m[13] +
        m[12] * m[5] * m[11] -
        m[12] * m[7] * m[9];

    inv[12] = -m[4] * m[9] * m[14] +
        m[4] * m[10] * m[13] +
        m[8] * m[5] * m[14] -
        m[8] * m[6] * m[13] -
        m[12] * m[5] * m[10] +
        m[12] * m[6] * m[9];

    inv[1] = -m[1] * m[10] * m[15] +
        m[1] * m[11] * m[14] +
        m[9] * m[2] * m[15] -
        m[9] * m[3] * m[14] -
        m[13] * m[2] * m[11] +
        m[13] * m[3] * m[10];

    inv[5] = m[0] * m[10] * m[15] -
        m[0] * m[11] * m[14] -
        m[8] * m[2] * m[15] +
        m[8] * m[3] * m[14] +
        m[12] * m[2] * m[11] -
        m[12] * m[3] * m[10];

    inv[9] = -m[0] * m[9] * m[15] +
        m[0] * m[11] * m[13] +
        m[8] * m[1] * m[15] -
        m[8] * m[3] * m[13] -
        m[12] * m[1] * m[11] +
        m[12] * m[3] * m[9];

    inv[13] = m[0] * m[9] * m[14] -
        m[0] * m[10] * m[13] -
        m[8] * m[1] * m[14] +
        m[8] * m[2] * m[13] +
        m[12] * m[1] * m[10] -
        m[12] * m[2] * m[9];

    inv[2] = m[1] * m[6] * m[15] -
        m[1] * m[7] * m[14] -
        m[5] * m[2] * m[15] +
        m[5] * m[3] * m[14] +
        m[13] * m[2] * m[7] -
        m[13] * m[3] * m[6];

    inv[6] = -m[0] * m[6] * m[15] +
        m[0] * m[7] * m[14] +
        m[4] * m[2] * m[15] -
        m[4] * m[3] * m[14] -
        m[12] * m[2] * m[7] +
        m[12] * m[3] * m[6];

    inv[10] = m[0] * m[5] * m[15] -
        m[0] * m[7] * m[13] -
        m[4] * m[1] * m[15] +
        m[4] * m[3] * m[13] +
        m[12] * m[1] * m[7] -
        m[12] * m[3] * m[5];

    inv[14] = -m[0] * m[5] * m[14] +
        m[0] * m[6] * m[13] +
        m[4] * m[1] * m[14] -
        m[4] * m[2] * m[13] -
        m[12] * m[1] * m[6] +
        m[12] * m[2] * m[5];

    inv[3] = -m[1] * m[6] * m[11] +
        m[1] * m[7] * m[10] +
        m[5] * m[2] * m[11] -
        m[5] * m[3] * m[10] -
        m[9] * m[2] * m[7] +
        m[9] * m[3] * m[6];

    inv[7] = m[0] * m[6] * m[11] -
        m[0] * m[7] * m[10] -
        m[4] * m[2] * m[11] +
        m[4] * m[3] * m[10] +
        m[8] * m[2] * m[7] -
        m[8] * m[3] * m[6];

    inv[11] = -m[0] * m[5] * m[11] +
        m[0] * m[7] * m[9] +
        m[4] * m[1] * m[11] -
        m[4] * m[3] * m[9] -
        m[8] * m[1] * m[7] +
        m[8] * m[3] * m[5];

    inv[15] = m[0] * m[5] * m[10] -
        m[0] * m[6] * m[9] -
        m[4] * m[1] * m[10] +
        m[4] * m[2] * m[9] +
        m[8] * m[1] * m[6] -
        m[8] * m[2] * m[5];

    let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

    if (det === 0) return 0;

    det = 1.0 / det;
    for (let i = 0; i < 16; i++) inv[i] *= det;

    return det;
}