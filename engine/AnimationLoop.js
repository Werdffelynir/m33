
/**
 *
 * ```
 * loop = new AnimationLoop({
 *             update: (delta, iteration,  renderRequest) => {
 *                  renderRequest()
 *             },
 *             render: (delta, iteration) => {
 *                  // Draw something
 *             },
 *             fixedDelta: 1 / 60,
 *             timeScale: 1
 *         });
 *
 * loop.start();
 *
 * loop.stop();
 *
 * loop.pause();
 *
 * loop.resume()
 *
 * const togglePause() {
 *     return this._paused && this._running
 *         ? this.loop.resume()
 *         : (this.loop.started ? this.loop.pause() : this.loop.start());
 * }
 *
 * ```
 */

export class AnimationLoop {

    constructor({ fixedDelta = 1 / 60, update, render, tick = null, timeScale = 1 } = {}) {
        this.update = update;
        this.render = render;
        this.tick = tick;

        // (fixed time-step)
        this.fixedDelta = fixedDelta;
        this.timeScale = timeScale;
        this.accumulator = 0;

        this.logicFPS = 0;
        this._fpsTimer = 0;

        this.lastTime = null;
        this._running = false;
        this._paused = false;

        this._frameCount = 0;
        this._iterator = 0;

        this.useRenderRender = false;
        this._needsRender = true;

        this._raf = null;
    }

    pause() {
        if (!this._running || this._paused) return;
        this._paused = true;
    }

    resume() {
        if (!this._running || !this._paused) return;
        this._paused = false;
        this.lastTime = null;
    }

    stop() {
        this._running = false;
        if (this._raf != null) cancelAnimationFrame(this._raf);
        this._raf = null;
    }

    start() {
        if (this._running) return;
        this._running = true;
        this._paused = false;
        this.lastTime = null;
        this._fpsTimer = 0;
        this._frameCount = 0;
        this._iterator = 0;
        this._time = 0;
        this._raf = requestAnimationFrame(this._loop);
    }

    _loop = (time) => {
        if (!this._running) return;

        // time, paused, iterator
        if (this.tick && typeof this.tick === 'function') {
            this.tick(time / 1000, this._paused, this._iterator);
        }

        if (this._paused) {
            // При паузі просто оновлюємо lastTime, пропускаємо logic і render
            this.lastTime = time;
            this._raf = requestAnimationFrame(this._loop);
            return;
        }

        if (this.lastTime === null) this.lastTime = time;

        let delta = (time - this.lastTime) / 1000;
        this.lastTime = time;

        // fixed. spirals of death ([turn0search0][turn0search6])
        // const maxDelta = 0.25;
        // if (delta > maxDelta) delta = maxDelta;

        const scaled = delta * this.timeScale;
        this.accumulator += scaled;

        // fixed time-step logic
        while (this.accumulator >= this.fixedDelta) {

            // console.log(`world.tick`, this.fixedDelta);

            this.update(this.fixedDelta, this._iterator, () => this.requestRender());

            if (this.useRenderRender && !this._needsRender) {
                // _needsRender = false
            } else {
                this.render(this.fixedDelta, this._iterator);
                this._needsRender = false;
            }
            // todo be replaced ^
            this.accumulator -= this.fixedDelta;
            this._frameCount++;
            this._iterator++;
            this._time += scaled;
        }

        // optional: render з інтерполяцією між кроками physics
        // const alpha = this.accumulator / this.fixedDelta;
        // typeof sprite.interpolate === 'function' && sprite.interpolate(alpha);

        this._fpsTimer += scaled;
        if (this._fpsTimer >= 1) {
            this.logicFPS = this._frameCount;
            this._frameCount = 0;
            this._fpsTimer = 0;
        }

        this._raf = requestAnimationFrame(this._loop);
    };

    requestRender() {
        this._needsRender = true;
    }

    cancelAnimation() {
        if (this._raf != null) {
            cancelAnimationFrame(this._raf);
            this._raf = null;
        }
    }

    /**
     * Params: {update, render, fixedDelta, timeScale}
     * update       function (delta, iteration, renderRequest())
     * render       function (delta, iteration)
     * fixedDelta   Logic step (in seconds, e.g. 1/60)
     * timeScale    timezoom
     * ```
     *  configured({update, render, fixedDelta, timeScale})
     * ```
     * @param params {*}
     */
    configured(params) {
        if ('update' in params) this.update = params.update;
        if ('render' in params) this.render = params.render;
        if ('fixedDelta' in params) this.fixedDelta = params.fixedDelta;
        if ('timeScale' in params) this.timeScale = params.timeScale;
    }

    get started(){
        return this._running;
    }

    get played(){
        return !this._paused && this._running;
    }

    get running(){
        return this._running;
    }

    get time(){
        return this._time;
    }

    /**
     * Change the time scale (e.g. 2 - 2 times faster)
     * @param scale
     */
    setTimeScale(scale) {
        this.timeScale = scale;
    }

    togglePause() {
        return (this._paused && this._running)
            ? this.resume()
            : (this.started ? this.pause() : this.start());
    }
}



