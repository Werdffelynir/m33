

export class Timeline {
    constructor() {
        this.tracks = [];
        this.running = false;
        this.paused = false;

        this._elapsed = 0;
        this._pauseElapsed = 0;

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
            tween._timelineOffset = offset;
            tween.start();
            tween._elapsed = -offset;
        });

        return this;
    }

    update(deltaTime) {
        if (!this.running || this.paused) return;

        this._elapsed += deltaTime;

        let allFinished = true;

        this.tracks.forEach(({ tween, offset }) => {
            if (!tween.finished) {
                tween.update(deltaTime);
                allFinished = false;
            }
        });

        if (allFinished && typeof this.onComplete === "function") {
            this.onComplete();
        }
    }

    stop() {
        this.running = false;
        this.tracks.forEach(({ tween }) => tween.stop && tween.stop());
    }

    pause() {
        if (!this.paused) {
            this.paused = true;
        }
    }

    resume() {
        if (this.paused) {
            this.paused = false;
        }
    }

    repeat(count = Infinity, delay = 0) {
        const originalTracks = this.tracks.slice();
        let repeats = 0;
        const loop = () => {
            if (++repeats > count) return;
            this.tracks = originalTracks.map(({ tween, offset }) => ({
                tween: tween.clone(),
                offset: offset + delay
            }));
            this.start();
        };
        this.onComplete = loop;
        return this;
    }
}

