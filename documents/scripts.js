



class Tween {
    constructor(target, to, duration = 1000) {
        this.target = target;
        this.to = { ...to };
        this.duration = duration;

        this.easing = Tween.Easing.linear;
        this.onUpdate = () => {};
        this.onComplete = () => {};

        this._from = {};
        this._elapsed = 0;
        this._delay = 0;

        this.finished = false;
        this._state = "idle";
    }

    static Easing = {
        linear: t => t,
        easeIn: t => t * t,
        easeOut: t => t * (2 - t),
        easeInOut: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    };

    start() {
        this._from = {};
        for (let key in this.to) {
            this._from[key] = this.target[key];
        }
        this._elapsed = -this._delay;
        this.finished = false;
        this._state = "running";
        return this;
    }

    update(deltaTime) {
        if (this._state !== "running" || this.finished) return;

        this._elapsed += deltaTime;
        if (this._elapsed < 0) return; // ще чекаємо delay/offset

        let t = Math.min(this._elapsed / this.duration, 1);
        let eased = this.easing(t);

        for (let key in this.to) {
            const start = this._from[key];
            const end = this.to[key];
            this.target[key] = start + (end - start) * eased;
        }

        this.onUpdate(this.target, t);

        if (t >= 1) {
            this.finished = true;
            this._state = "idle";
            this.onComplete(this.target);
        }
    }

    delay(ms) {
        this._delay = ms;
        return this;
    }

    clone() {
        return new Tween(this.target, this.to, this.duration);
    }
}



class Timeline {
    constructor() {
        this.tracks = [];
        this.running = false;
        this.paused = false;
        this._elapsed = 0;
        this.onComplete = null;
    }

    add(tween, offset = 0) {
        this.tracks.push({ tween, offset });
        return this;
    }

    start() {
        this.running = true;
        this.paused = false;
        this._elapsed = 0;

        this.tracks.forEach(({ tween, offset }) => {
            tween.start();
            tween._elapsed = -offset;
        });

        return this;
    }

    update(deltaTime) {
        if (!this.running || this.paused) return;

        this._elapsed += deltaTime;

        let allFinished = true;

        this.tracks.forEach(({ tween }) => {
            if (!tween.finished) {
                tween.update(deltaTime);
                allFinished = false;
            }
        });

        if (allFinished && typeof this.onComplete === "function") {
            this.onComplete();
        }
    }
}






