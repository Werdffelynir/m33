

/**
 * ```
 * perlin = new PerlinNoiseSeed(seedNumber)
 * perlin.noise(x, y)
 *         this._seed = seed ?? math?.random?.() ?? Math.random()
 * ```
 */

export class PerlinNoiseSeed {

    constructor(seed = 1, math) {


        // simple deterministic RNG (LCG)
        let s = seed >>> 0
        this.random = math?.random ?? (() => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)

        this.seedGenerate()
    }

    seedGenerate() {
        const p = new Uint8Array(256)
        this.perm = new Uint8Array(512)

        for (let i = 0; i < 256; i++) p[i] = i

        // Fisher–Yates shuffle
        for (let i = 255; i > 0; i--) {
            const j = (this.random() * (i + 1)) | 0
            ;[p[i], p[j]] = [p[j], p[i]]
        }

        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255]
        }
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10)
    }

    lerp(a, b, t) {
        return a + t * (b - a)
    }

    grad(hash, x, y) {
        switch (hash & 7) {
            case 0: return  x + y
            case 1: return -x + y
            case 2: return  x - y
            case 3: return -x - y
            case 4: return  x
            case 5: return -x
            case 6: return  y
            case 7: return -y
        }
    }

    noise(x, y) {
        const X = Math.floor(x) & 255
        const Y = Math.floor(y) & 255

        const xf = x - Math.floor(x)
        const yf = y - Math.floor(y)

        const u = this.fade(xf)
        const v = this.fade(yf)

        const p = this.perm

        const aa = p[X +     p[Y]]
        const ab = p[X +     p[Y + 1]]
        const ba = p[X + 1 + p[Y]]
        const bb = p[X + 1 + p[Y + 1]]

        const x1 = this.lerp(
            this.grad(aa, xf,     yf),
            this.grad(ba, xf - 1, yf),
            u
        )

        const x2 = this.lerp(
            this.grad(ab, xf,     yf - 1),
            this.grad(bb, xf - 1, yf - 1),
            u
        )

        // [-1, 1]
        return this.lerp(x1, x2, v)
    }
}
