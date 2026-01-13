import {AnimationLoop} from "../../../engine/AnimationLoop.js";


export const LOOP_MAIN = 'main'


export class LoopMain {
    constructor(register, params = {}) {
        this.fps = register.config?.fps;
        this.skipFrame = register.config?.skipFrame ?? false;
        this._onupdate = new Set()
        this._onrender = new Set()

        this.setupAnimation()
        if (params?.onrender) this.onRender(params?.onrender)
        if (params?.onupdate) this.onUpdate(params?.onupdate)
    }

    onUpdate(cb) {this._onupdate.add(cb)}
    onRender(cb) {this._onrender.add(cb)}

    start() {this.animation.start()}
    stop() {this.animation.stop()}
    pause() {this.animation.pause()}
    resume() {this.animation.resume()}
    togglePause() {
        this.animation.togglePause()}
    setTimeScale(scale) {this.animation.setTimeScale(scale)}

    setupAnimation() {

        this.animation =  new AnimationLoop({

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



// /** @type {ModuleManager}*/
// const moduleManager = register.moduleManager;
// {theater3DComponent, theater3DProduce, updateControl}
// updateControl(delta, iterator)
//
// Loop tick. Started after `loop.start`. Infinity circle with maximum framerate/
//
// !WARNING!
// Independent callback that performs maximum frame purity uses - "requestAnimationFrame".
// System-dependent calls (75hz, 120hz, and 144hz).
// Returns time (time from cycle start in ms.), pause state, and game iterator in arguments
//
//
// tick: (time, paused, iterator) => {
//     modman?.tick?.(time, paused, iterator);
//     theater?.tick?.(time, paused, iterator);
// },
/*


export class LoopMainHandler {
    constructor(register) {

    }

    configured({
                   moduleManager,
                   theater3DProduce,
                   theater3DComponent,
                   propertyCameraComponent
               }) {

        this.moduleManager = moduleManager;
        this.theater3DProduce = theater3DProduce;
        this.theater3DComponent = theater3DComponent;
        this.propertyCameraComponent = propertyCameraComponent;
    }

    createLoop() {
        const moduleManagerUpdate = this.moduleManager.update.bind(this.moduleManager)
        const theater3DProduceUpdate = this.theater3DProduce.update.bind(this.theater3DProduce)
        const theater3DProduceDraw = this.theater3DProduce.draw.bind(this.theater3DProduce)
        const controlCameraUpdate = this.propertyCameraComponent.updateControl.bind(this.propertyCameraComponent)
        const skipFrame = 0;

        return new AnimationLoop({

            update(delta, iterator, requestRender) {
                if (skipFrame && iterator % skipFrame === 0) return;

                requestRender();

                controlCameraUpdate(delta, iterator);
                moduleManagerUpdate(delta, iterator);
                theater3DProduceUpdate(delta, iterator);
            },


            render: (delta, iterator) => {
                if (skipFrame && iterator % skipFrame === 0) return;

                theater3DProduceDraw(delta, iterator);
            },
        })
    }
}
*/