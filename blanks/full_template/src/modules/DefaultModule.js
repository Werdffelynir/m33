import {Module} from "../../engine/Module.js";

export class DefaultModule extends Module {

    constructor(register, params = {}) {
        super(register, params);

        this.type = 'default';
        this.updatable = false;
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

    // to saves
    toGameData() {
        return {
            className: this.constructor.name,
        }
    }
}

