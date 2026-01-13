import {AnimationLoop} from "./AnimationLoop.js";
import {IManager} from "./IManager.js";
import {Ut} from "./Ut.js";


export class LoopManager extends IManager {

    constructor(register) {
        super(register)

        this.register = register;
        this.eventBus = register.eventBus;

        this.props.fixedDelta = 1/30;
        this.props.timeScale = 1;

        this.pausedLoops = new Set();
        this.isConfigured = false;
    }

    /**
     * ```
     * loopIntro = new AnimationLoop( {
     *     update: (delta, iteration, renderRequest) => {
     *         renderRequest();
     *         starSystem.update(delta);
     *     },
     *     render: (delta, iteration) => {
     *         // Draw something #IndexScreenCanvas #IndexMenu
     *
     *         starSystem.render(delta);
     *     },
     * } )
     *
     * registerLoops ( {
     *     loopIntro,
     *     loopPause,
     *     loop,
     * } )
     *
     *
     * configured( {
     *         fixedDelta: 1 / 15,
     *         timeScale: 1
     *     } )
     *
     *
     * ```
     * @param params
     */
    configured({loops, fixedDelta, timeScale}) {
        if(this.isConfigured) {
            return console.warn(`Error. \nTry calling LoopManager.configured, it is already configured! \nFor add new loop use ".addLoop(key, instance)" for many ".registerLoops(classes) "`)
        }
        this.isConfigured = true;

        if (fixedDelta) this.props.fixedDelta = fixedDelta
        if (timeScale) this.props.timeScale = timeScale

        if (Ut.isObject(loops) && Ut.len(loops) > 0) {
            this.registerLoops(loops)
        }
    }

    async init(params) {

    }

    /** @returns {AnimationLoop|{animation:AnimationLoop}|*} */
    loop(key = 'main') {
        return this.stackmanager.get(key);
    }
    /** @returns {AnimationLoop|{animation:AnimationLoop}|*} */
    get(key = 'main') {
        return this.stackmanager.get(key);
    }

    reload() {}

    destroy() {
        this.stop();
        this.stackmanager.clear();
    }

    start(key) {
        if (!this.has(key)) {
            return console.error(`loop [${key}] not found`);
        }
        this.get(key).start();

        this.eventBus.publish(`loop:started:${key}`)
    }

    stop(key) {
        if (!key) {
            this.stackmanager.forEach((loop) => {
                loop.stop();
            })
            return;
        }

        this.get(key).stop();
        this.eventBus.publish(`loop:stopped:${key}`)
    }

    pause(key) {
        this.get(key).pause();
        this.eventBus.publish(`loop:paused:${key}`)
    }

    resume(key) {
        this.get(key).resume();
        this.eventBus.publish(`loop:resumed:${key}`)
    }

    togglePause(key) {
        const loop =  this.get(key)

        this.pausedLoops.add(key)

        return (this._paused && this._running)
            ? this.resume(key)
            : (loop.started ? this.pause(key) : this.start(key));
    }


    addLoop(key, instance) {
        if (typeof key !== 'string') return console.warn(`key must be a string.`);

        if (Ut.isNumber(this.props?.fixedDelta)) instance.fixedDelta = this.props.fixedDelta;
        if (Ut.isNumber(this.props?.timeScale)) instance.timeScale = this.props.timeScale;

        const loop =  (instance?.loop instanceof AnimationLoop) ? instance.loop : instance

        if (!(loop instanceof AnimationLoop))
            return console.warn(`"instance", must be a AnimationLoop `);

        this.stackmanager.set(key, instance)

        this.eventBus.publish(`loop:added:${key}`);
    }

    registerLoops(classes) {

        for (const [name, instance] of Object.entries(classes))
        {

            //
            // Setup AnimationLoop
            //
            //
            //

            this.addLoop(name, instance);
        }
    }
}
