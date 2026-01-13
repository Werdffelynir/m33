

'use strict';

export

/**
 * perlin.clear();
 * perlin.setSeed(seed);
 * perlin.randomSeed();
 * perlin.get(x, y);
 */
let perlin = {
        seed: 0,
        setSeed: function (newSeed) {
            this.seed = typeof newSeed === "string" ? perlin._getCodes(newSeed) : Number(newSeed);
            this.clear();
        },
        _getCodes: (str) => {
            return [...str].map(c => c.charCodeAt(0)).reduce((acc, curr) => acc * curr, 1);
        },
        _randVect: function (x, y) {
            let seed = (x * 73856093) ^ (y * 19349663) ^ this.seed;
            let theta = (Math.sin(seed) * 10000) % (2 * Math.PI);
            return {x: Math.cos(theta), y: Math.sin(theta)};
        },
        _dotProdGrid: function (x, y, vx, vy) {
            let g_vect;
            let d_vect = {x: x - vx, y: y - vy};
            let key = `${vx},${vy}`;
            if (this.gradients[key]) {
                g_vect = this.gradients[key];
            } else {
                g_vect = this._randVect(vx, vy);
                this.gradients[key] = g_vect;
            }
            return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
        },
        _smootherStep: function (x) {
            return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
        },
        _interp: function (x, a, b) {
            return a + this._smootherStep(x) * (b - a);
        },
        randomSeed: function () {
            const seed = parseInt(Array(8).fill(0).map(i => Math.floor(Math.random() * 10)).join(''))
            perlin.setSeed( seed )
            return seed
        },
        clear: function () {
            this.gradients = {};
            this.memory = {};
        },
        get: function (x, y) {
            let key = `${x},${y}`;
            if (this.memory.hasOwnProperty(key)) return this.memory[key];
            let xf = Math.floor(x);
            let yf = Math.floor(y);
            let tl = this._dotProdGrid(x, y, xf, yf);
            let tr = this._dotProdGrid(x, y, xf + 1, yf);
            let bl = this._dotProdGrid(x, y, xf, yf + 1);
            let br = this._dotProdGrid(x, y, xf + 1, yf + 1);
            let xt = this._interp(x - xf, tl, tr);
            let xb = this._interp(x - xf, bl, br);
            let v = this._interp(y - yf, xt, xb);
            this.memory[key] = v;
            return v;
        }
    };

perlin.clear();



