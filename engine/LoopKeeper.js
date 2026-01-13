import {AnimationLoop} from "./AnimationLoop.js";



export class LoopKeeper {
    constructor(register, params = {}) {
        this.fps = register.config?.fps ?? params?.fps ?? 15;
        this.skipFrame = register.config?.skipFrame ?? params?.skipFrame ?? false;
        this._onupdate = new Set()
        this._onrender = new Set()

        if (params?.onrender) this.onRender(params?.onrender)
        if (params?.onupdate) this.onUpdate(params?.onupdate)

        this.setup()
    }
    get animation () { return this._animation }
    onUpdate(cb) {this._onupdate.add(cb)}
    onRender(cb) {this._onrender.add(cb)}
    start() {this._animation.start()}
    stop() {this._animation.stop()}
    pause() {this._animation.pause()}
    resume() {this._animation.resume()}
    togglePause() {this._animation.togglePause()}
    setTimeScale(scale) {this._animation.setTimeScale(scale)}
    get isPlayed () { return !this._animation._paused && this._animation._running }
    setup() {

        this._animation =  new AnimationLoop({

            fixedDelta: 1 / this.fps,

            //
            // Main Update loop. for run render, call the requestRender
            //
            //
            //
            update: (delta, iterator, requestRender) => {
                if (this.skipFrame && iterator % this.skipFrame === 0) return;
                this._onupdate.forEach((cb) => { cb?.(delta, iterator, requestRender) })
            },

            //
            // Main Render loop
            //
            //
            //
            render: (delta, iterator) => {
                if (this.skipFrame && iterator % this.skipFrame === 0) return;

                this._onrender.forEach((cb) => { cb?.(delta, iterator) })
            },
        })

    }
}

