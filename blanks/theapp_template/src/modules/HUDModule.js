import {Reactive} from "../../engine/Reactive.js";
import {Module} from "../../engine/Module.js";

export class HUDModule extends Module {

    /**
     * @property {Register} register
     * @property {Reactive} react
     * @property {Reactive._proxy | any | {set, off, on}} state
     */
    constructor(register, params = {}) {
        super(register, {
            type: 'hud',
        })
        this.reactive = new Reactive(params?.state ?? {})
        this.state = this.reactive.state
        delete this.props.state
    }

    exportData() {
        return {
            className: this.constructor.name,
            state: {...this.state},
        }
    }
}

