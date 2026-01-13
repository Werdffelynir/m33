import {Module} from "./../../engine/Module.js";
import {Reactive} from "../../engine/Reactive.js";


export class DefaultModule extends Module {

    constructor(register, params = {}) {
        super(register, {
            type: 'hud',
        })
        this.reactive = new Reactive(params?.state ?? {})
        this.state = this.reactive.state
        delete this.props.state
        this.updatable = false
    }

    // called when setup via register.registerModules
    setup() {
        this.register.onState('status', (status) => { })
    }

    install(params) {
        // Overwrite
    }

    uninstall(params) {
        // Overwrite
    }

    async init(params) {
        // Overwrite
    }

    reload() {
        // Overwrite
    }

    update(delta, iterator) {
        // Overwrite
    }

    // to saves exportData toGameData
    exportData() {
        return {
            className: this.constructor.name,
            state: {...this.state},
        }
    }
}

