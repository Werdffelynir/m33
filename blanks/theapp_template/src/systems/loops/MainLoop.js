import {AnimationLoop} from "../../../engine/AnimationLoop.js";

export const LOOP_MAIN = 'main'

/**
 *
 * @param register {Register|Application}
 * @returns {AnimationLoop}
 * @constructor
 */
export function MainLoop(register) {
    const {
        /** @type {State}*/
        state,
        /** @type {*}*/
        config,
        /** @type {TheaterManager}*/
        theater,
        /** @type {ModuleManager}*/
        modman

    } = register;

    const fps = config.fps;
    const skipFrame = config?.skipFrameRate || 0;

    return new AnimationLoop({

        fixedDelta: 1 / fps,

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

        //
        // Main Update loop
        //
        //
        //
        update(delta, iterator, requestRender) {
            if (skipFrame && iterator % skipFrame === 0) return;

            requestRender();

            modman?.update(delta, iterator);

            theater.update(delta, iterator);
        },

        //
        // Main Render loop
        //
        //
        //
        render: (delta, iterator) => {
            if (skipFrame && iterator % skipFrame === 0) return;

            theater.draw(delta, iterator);

        },
    })

}