/**
 * ```
 * let target = { x: 0 };
 *
 * let tween = new Tween(target, { x: 100 }, 1000, {
 *     easing: Tween.Easing.easeOutCubic,
 *     onUpdate: (target, progress) => console.log("x:", target.x, "progress:", progress),
 *     onComplete: target => console.log("done:", target.x)
 * });
 *
 * tween.start();
 *
 * update(delta) {
 *      tween.update(delta);
 * }
 *
 * ```
 */
export class Tween {
    constructor(target, to, duration, options = {}) {
        this.target = target;
        this.to = { ...to };
        this.duration = duration;

        this._from = {};
        this._elapsed = 0;
        this._state = "idle";
        this._delay = options.delay || 0;
        this.easing = options.easing || Tween.Easing.linear;
        this.onUpdate = options.onUpdate || (() => {});
        this.onComplete = options.onComplete || (() => {});
    }

    get currentState() { return this._state; }
    resume() {
        if (this._state !== "paused") {
            this.start()
            return;
        }
        this._state = "running";
    }
    pause() {
        if (this._state !== "running") return;
        this._state = "paused";
    }

    start() {
        // debugger
        this._elapsed = -this._delay;
        this._state = "running";

        for (let key in this.to) {
            this._from[key] = this.target[key];
        }

        return this;
    }

    update(deltaTime) {
        if (this._state !== "running") return;
        this._elapsed += deltaTime;
        if (this._elapsed < 0) return; // ще йде delay

        let t = Math.min(this._elapsed / this.duration, 1);
        let eased = this.easing(t);

        for (let key in this.to) {
            const start = this._from[key];
            const end = this.to[key];
            this.target[key] = start + (end - start) * eased;
        }

        this.onUpdate(this.target, t);

        if (t >= 1) {
            this._state = "finished";
            this.onComplete(this.target);
        }
    }

    restart() {
        this._elapsed = -this._delay;
        this._state = "running";
        for (let key in this.to) {
            this._from[key] = this.target[key];
        }
        return this;
    }

    reverse(deltaTime) {
        if (this._state !== "running") return;

        this._elapsed -= deltaTime;

        if (this._elapsed < 0) this._elapsed = 0;

        let t = Math.max(this._elapsed / this.duration, 0);
        let eased = this.easing(t);

        for (let key in this.to) {
            const start = this._from[key];
            const end = this.to[key];
            this.target[key] = start + (end - start) * eased;
        }

        this.onUpdate(this.target, t);

        if (this._elapsed <= 0) {
            this._state = "idle";
            this.onComplete(this.target);
        }
        return this;
    }

    clone() {
        return new Tween(
            this.target,
            this.to,
            this.duration,
            {
                delay: this._delay,
                easing: this.easing,
            }
        );
    }

    delay(ms) {
        this._delay = ms;
        return this;
    }
}

Tween.Easing = {
    linear: t => t,

    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => 1 - (--t) * t * t * t,
    easeInOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t),

    easeInQuint: t => t * t * t * t * t,
    easeOutQuint: t => 1 + (--t) * t * t * t * t,
    easeInOutQuint: t => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t),

    easeInSine: t => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: t => Math.sin((t * Math.PI) / 2),
    easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,

    easeInExpo: t => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
    easeOutExpo: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    easeInOutExpo: t =>
        t === 0 ? 0 :
            t === 1 ? 1 :
                t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,

    easeInCirc: t => 1 - Math.sqrt(1 - t * t),
    easeOutCirc: t => Math.sqrt(1 - (--t) * t),
    easeInOutCirc: t =>
        t < 0.5
            ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
            : (Math.sqrt(1 - (2 * t - 2) * (2 * t - 2)) + 1) / 2,

    easeInBack: t => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * t * t * t - c1 * t * t;
    },
    easeOutBack: t => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * (--t) * t * t + c1 * t * t;
    },
    easeInOutBack: t => {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return t < 0.5
            ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
            : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },

    easeInElastic: t => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0
            ? 0
            : t === 1
                ? 1
                : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeOutElastic: t => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0
            ? 0
            : t === 1
                ? 1
                : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeInOutElastic: t => {
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0
            ? 0
            : t === 1
                ? 1
                : t < 0.5
                    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
                    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    },

    easeInBounce: t => 1 - Tween.Easing.easeOutBounce(1 - t),
    easeOutBounce: t => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },
    easeInOutBounce: t =>
        t < 0.5
            ? (1 - Tween.Easing.easeOutBounce(1 - 2 * t)) / 2
            : (1 + Tween.Easing.easeOutBounce(2 * t - 1)) / 2
};

