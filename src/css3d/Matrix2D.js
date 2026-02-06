/**
 * ```
 * const m = new Matrix2D();
 *
 * m.translate(100, 50)
 *  .scale(2, 1.5)
 *  .rotateZ(Math.PI / 4);
 *
 * element.style.transform = m.toCSS();
 *
 *
 * const m = new Matrix2D();
 * m.setFromCSS("matrix(1, 0, 0, 1, 100, 50)");
 *
 *
 * const p = m.applyToPoint(10, 20);
 * console.log(p); // { x: 110, y: 70, z: 0 }
 *
 *
 * const m = new Matrix2D();
 * m.setFromCSS("translate3d(100px, 50px, 20px) rotateX(30deg) rotateY(15deg) scale3d(2, 2, 1)");
 * const comp = m.decompose();
 *
 *
 * const m = new Matrix2D();
 * m.setFromCSS("translate3d(120px, 40px, 10px) rotateY(25deg) rotateZ(10deg) scale3d(1.5, 1.2, 1)");
 * const css = m.toObjectCSS();
 *
 * ```
 */

/**
 * ```
 *
 * ```
 */
export class Matrix2D {
    constructor(data) {
        this.data = data instanceof Float32Array ? data : new Float32Array(16);
        this.identity();
    }

    // --- identity matrix ---
    identity() {
        const m = this.data;
        m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
        m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
        m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
        m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
        return this;
    }

    // --- offset ---
    translate(x, y) {
        const m = this.data;
        m[12] += x * m[0] + y * m[4];
        m[13] += x * m[1] + y * m[5];
        m[14] += x * m[2] + y * m[6];
        return this;
    }

    // --- scaling ---
    scale(x, y) {
        const m = this.data;
        m[0] *= x; m[1] *= x; m[2] *= x;
        m[4] *= y; m[5] *= y; m[6] *= y;
        return this;
    }

    // --- rotation around X ---
    rotateX(rad) {
        const m = this.data;
        const c = Math.cos(rad);
        const s = Math.sin(rad);

        const m1 = m[1], m5 = m[5], m9 = m[9];
        const m2 = m[2], m6 = m[6], m10 = m[10];

        m[1] = m1 * c + m2 * -s;
        m[5] = m5 * c + m6 * -s;
        m[9] = m9 * c + m10 * -s;

        m[2] = m1 * s + m2 * c;
        m[6] = m5 * s + m6 * c;
        m[10] = m9 * s + m10 * c;
        return this;
    }

    // --- rotation around Y ---
    rotateY(rad) {
        const m = this.data;
        const c = Math.cos(rad);
        const s = Math.sin(rad);

        const m0 = m[0], m4 = m[4], m8 = m[8];
        const m2 = m[2], m6 = m[6], m10 = m[10];

        m[0] = m0 * c + m2 * s;
        m[4] = m4 * c + m6 * s;
        m[8] = m8 * c + m10 * s;

        m[2] = m0 * -s + m2 * c;
        m[6] = m4 * -s + m6 * c;
        m[10] = m8 * -s + m10 * c;
        return this;
    }

    // --- rotation around Z (regular 2D rotation) ---
    rotateZ(rad) {
        const m = this.data;
        const c = Math.cos(rad);
        const s = Math.sin(rad);

        const m0 = m[0], m4 = m[4], m8 = m[8];
        const m1 = m[1], m5 = m[5], m9 = m[9];

        m[0] = m0 * c + m1 * -s;
        m[4] = m4 * c + m5 * -s;
        m[8] = m8 * c + m9 * -s;

        m[1] = m0 * s + m1 * c;
        m[5] = m4 * s + m5 * c;
        m[9] = m8 * s + m9 * c;
        return this;
    }

    // --- multiplication ---
    multiply(m2) {
        const a = this.data;
        const b = m2.data;
        const out = new Float32Array(16);

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                out[row * 4 + col] =
                    a[row * 4 + 0] * b[0 * 4 + col] +
                    a[row * 4 + 1] * b[1 * 4 + col] +
                    a[row * 4 + 2] * b[2 * 4 + col] +
                    a[row * 4 + 3] * b[3 * 4 + col];
            }
        }

        this.data.set(out);
        return this;
    }

    clone() {
        return new Matrix2D(new Float32Array(this.data));
    }

    // --- inversion ---
    getInverse() {
        const inv = new Float32Array(16);
        Matrix2D.invertMatrix(this.data, inv);
        return new Matrix2D(inv);
    }

    invert() {
        Matrix2D.invertMatrix(this.data, this.data);
        return this;
    }

    _invertMatrix(m, inv) {
        return Matrix2D.invertMatrix(m, inv);
    }

    // --- conversion to CSS ---
    toCSS() {
        const m = this.data;
        // CSS очікує matrix3d у стовпцевому порядку
        return `matrix3d(${Array.from(m).map(n => +n.toFixed(6)).join(",")})`;
    }

    // --- static inversion method ---
    static invertMatrix(m, inv) {
        const a = m;
        const r = inv || new Float32Array(16);

        const [
            a00,a01,a02,a03,
            a10,a11,a12,a13,
            a20,a21,a22,a23,
            a30,a31,a32,a33
        ] = a;

        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;

        // determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return null;
        det = 1.0 / det;

        r[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        r[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * det;
        r[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        r[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * det;
        r[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * det;
        r[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        r[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * det;
        r[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        r[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        r[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * det;
        r[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        r[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * det;
        r[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * det;
        r[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        r[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * det;
        r[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

        return r;
    }

    setFromCSS(matrixString) {
        if (!matrixString) return this.identity();

        const values = matrixString
            .replace(/matrix3d?\(|\)/g, "")
            .split(",")
            .map(v => parseFloat(v.trim()));

        const m = this.data;

        if (values.length === 6) {
            // 2D matrix → перетворюємо у 4×4
            const [a, b, c, d, e, f] = values;
            m.set([
                a, b, 0, 0,
                c, d, 0, 0,
                0, 0, 1, 0,
                e, f, 0, 1
            ]);
        } else if (values.length === 16) {
            m.set(values);
        } else {
            this.identity();
        }

        return this;
    }


    applyToPoint(x, y, z = 0, w = 1) {
        const m = this.data;
        return {
            x: m[0] * x + m[4] * y + m[8]  * z + m[12] * w,
            y: m[1] * x + m[5] * y + m[9]  * z + m[13] * w,
            z: m[2] * x + m[6] * y + m[10] * z + m[14] * w,
        };
    }

    decompose() {
        const m = this.data;

        // Extract the position (translate)
        const tx = m[12];
        const ty = m[13];
        const tz = m[14];

        // Extract the scale
        const sx = Math.hypot(m[0], m[1], m[2]);
        const sy = Math.hypot(m[4], m[5], m[6]);
        const sz = Math.hypot(m[8], m[9], m[10]);

        // Normalize the rotation
        const nm = new Float32Array(m);
        if (sx) { nm[0] /= sx; nm[1] /= sx; nm[2] /= sx; }
        if (sy) { nm[4] /= sy; nm[5] /= sy; nm[6] /= sy; }
        if (sz) { nm[8] /= sz; nm[9] /= sz; nm[10] /= sz; }

        // Extract the rotation angles (YXZ order)
        let ry = Math.asin(-nm[2]);
        let rx, rz;

        if (Math.abs(nm[2]) < 0.9999999) {
            rx = Math.atan2(nm[6], nm[10]);
            rz = Math.atan2(nm[1], nm[0]);
        } else {
            // Gimbal lock
            rx = Math.atan2(-nm[9], nm[5]);
            rz = 0;
        }

        // Convert to degrees
        const toDeg = rad => rad * 180 / Math.PI;

        return {
            translate: { x: tx, y: ty, z: tz },
            rotate: { x: toDeg(rx), y: toDeg(ry), z: toDeg(rz) },
            scale: { x: sx, y: sy, z: sz },
        };
    }

    toObjectCSS() {
        const { translate, rotate, scale } = this.decompose();

        const translate3d = `translate3d(${translate.x.toFixed(3)}px, ${translate.y.toFixed(3)}px, ${translate.z.toFixed(3)}px)`;
        const rotateX = `rotateX(${rotate.x.toFixed(3)}deg)`;
        const rotateY = `rotateY(${rotate.y.toFixed(3)}deg)`;
        const rotateZ = `rotateZ(${rotate.z.toFixed(3)}deg)`;
        const scale3d = `scale3d(${scale.x.toFixed(3)}, ${scale.y.toFixed(3)}, ${scale.z.toFixed(3)})`;

        const string = `${translate3d} ${rotateX} ${rotateY} ${rotateZ} ${scale3d}`;

        return { translate3d, rotateX, rotateY, rotateZ, scale3d, string };
    }

    /**
     * ```
     * const m1 = new Matrix2D();
     * m1.setFromCSS("translate3d(0px, 0px, 0px) rotateY(0deg) scale3d(1,1,1)");
     *
     * const m2 = new Matrix2D();
     * m2.setFromCSS("translate3d(200px, 100px, 0px) rotateY(90deg) scale3d(2,2,1)");
     *
     * const halfway = m1.lerp(m2, 0.5);
     * console.log(halfway.toObjectCSS().string);
     * // translate3d(100px, 50px, 0px) rotateX(0deg) rotateY(45deg) rotateZ(0deg) scale3d(1.5, 1.5, 1)
     * ```
     * @param otherMatrix
     * @param t
     * @return {Matrix2D}
     */
    lerp(otherMatrix, t) {
        // Clone so as not to mess up the current matrix
        const result = new Matrix2D();

        // Decompose both matrices
        const a = this.decompose();
        const b = otherMatrix.decompose();

        // Helper function for interpolation
        const mix = (a, b, t) => a + (b - a) * t;

        // Linear interpolation translate / scale
        const tx = mix(a.translate.x, b.translate.x, t);
        const ty = mix(a.translate.y, b.translate.y, t);
        const tz = mix(a.translate.z, b.translate.z, t);

        const sx = mix(a.scale.x, b.scale.x, t);
        const sy = mix(a.scale.y, b.scale.y, t);
        const sz = mix(a.scale.z, b.scale.z, t);

        // Interpolate angles (in degrees)
        const rx = mix(a.rotate.x, b.rotate.x, t);
        const ry = mix(a.rotate.y, b.rotate.y, t);
        const rz = mix(a.rotate.z, b.rotate.z, t);

        // Restore the resulting matrix in the correct order
        result.identity()
            .translate(tx, ty, tz)
            .rotateX(rx * Math.PI / 180)
            .rotateY(ry * Math.PI / 180)
            .rotateZ(rz * Math.PI / 180)
            .scale(sx, sy, sz);

        return result;
    }

}