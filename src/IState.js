import {Reactive} from "./Reactive.js";


export class IState {
    /**@type {Reactive}*/
    reactive;
    excluded = [];

    constructor(state = {}) {
        Object.keys(state).forEach(k => this[k] = state[k]);

        this.reactive = new Reactive(this);
        this.reactive.exclude(this.excluded || []);
    }

    // Rewrite me, if u you want
    setup(params = {}) {

    }

    /**
     * ```
     * this.on('task.title', (name, value, prevValue) => {
     *     console.log('{ task.title changed! } ', name, value, prevValue)
     * });
     * this.on('task.*', (name, value, prevValue) => {
     *     console.log('{ one fo task.* is changed! } ', name, value, prevValue)
     * });
     * ```
     */
    on(path, callback) {
        this.reactive.on(path, callback)
    }

    off(path, callback) {
        this.reactive.on(path, callback)
    }

    set(path, value) {
        this.reactive.set(path, value)
    }

    get(path) {
        return this.reactive.get(path)
    }

    has(path) {
        this.reactive.has(path)
    }

    mix(path) {
        this.reactive.mix(path)
    }
}
