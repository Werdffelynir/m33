import {Controller} from "./Controller.js";
import {IManager} from "./IManager.js";


/**
 *
 * ```
 * ControllerManager.switch (ControllerName, params)
 * ```
 * ## Events:
 *  - controller:registered:${name}
 *  - controller:destroyed:${name}
 *  - controller:inited:${name}
 *
 */
export class ControllerManager extends IManager {

    /**
     * @property {Register} register
     *
     * @property {Map<string, Controller>}  stackmanager
     * @property {Controller} current
     * @property {HTMLElement} root
     **/

    constructor(register) {
        super(register);
        this._activeName = null;
        this._installed = new Set();
    }

    configured() {
    }

    get currentName() {
        return this._activeName;
    }
    get current() {
        return this.get(this._activeName) || null;
    }

    async add(name, instance) {
        if (!(instance instanceof Controller)) throw new Error(`{TypeError} "${name}" value is not type {Controller}`);

        //
        // Setup Controller
        //
        await instance.preload();

        //
        //
        //
        this.stackmanager.set(name, instance);

        //
        //
        //
        this.register.eventBus.publish(`controller:registered:${name}`, {name, data: instance});

        return instance
    }

    isInstalled(name) {return this._installed.has(name)}

    isCurrent(name) {return this._activeName === name}


    async switch (name, params) {

        if (!this.has(name)) {
            return console.warn(`{${this.constructor.name}.switch} controller "${name}" not registered!`);
        }
        if (this._activeName === name) {
            return console.warn(`{${this.constructor.name}.switch} "${name}" is equal to current controller. Switch request braked!`);
        }

        const inst = this.get(name)

        if (this._activeName) {

            const instPrev = this.get(this._activeName)

            instPrev.destroy();
        }

        if (!this._installed.has(name)) {

            await inst.setup(params);

            this._installed.add(name)

            this.register.eventBus.publish(`controller:installed:${name}`, {name, data: inst});
        }


        this.register.eventBus.publish(`controller:init`, {name, data: inst});

        await inst.init(params);

        this.register.eventBus.publish(`controller:init:${name}`, {name, data: inst});

        this._activeName = name;
    }
}



