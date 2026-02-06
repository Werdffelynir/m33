import {Reactive} from "./Reactive.js";
import {Module} from "./Module.js";

export class ReactiveModule extends Module {
    /** @type {Reactive._proxy | any | {set, off, on}} */
    state = {};
    /** @type Reactive */
    react;
    constructor(register, props = {}) {
        super(register, props)
        this.react = new Reactive(props.state || {})
        this.state = this.react.state;
    }
}

