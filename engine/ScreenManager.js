import {Screen} from "./Screen.js";
import {IManager} from "./IManager.js";
import {Ut} from "./Ut.js";


/**
 * only one active screen in the DOM
 * `change()` is called on the active screen
 * `attach()` screen
 * automatic destruction of the previous screen and `detach()` root view
 * safe instantiation and caching
 *
 */
export class ScreenManager extends IManager {

    constructor(register) {
        super(register)

        this.parent = null;
        this._activeName = null;
        this._installed = new Set();
    }

    configured({parent}) {
        if (!Ut.isNode(parent))
            throw new Error(`{${this.constructor.name}.configured} requires a valid HTMLElement as parent`);

        this.parent = parent;
    }

    add(name, instance) {
        if (!(instance instanceof Screen))
            throw new Error(`{${this.constructor.name}.add} "${name}" value is not type {Screen}`);

        this.stackmanager.set(name, instance);

        this.register.eventBus.publish(`screen:registered:${name}`, {name, data: instance});

        return instance
    }

    get current() {
        return this.get(this._activeName) || null;
    }

    isCurrent(name) {
        return this._activeName === name
    }

    async change(name, params = {}) {
        if (this._activeName === name)
            return console.warn(`{${this.constructor.name}.change} Screen ${name} is already active! change screen request braked!`);

        if (!this.has(name))
            throw new Error(`{${this.constructor.name}.change} Screen with name "${name}" is not registered!`);

        const screen = this.get(name);
        const eventBus = this.register.eventBus;

        //
        // destroy and detach previous screen
        //
        if (this._activeName && this._activeName !== name) {
            const screenPrev = this.get(this._activeName);
            screenPrev?.destroy();

            eventBus.publish(`screen:destroyed:${name}`, {name, data: screenPrev});
        }
        //
        //
        //
        screen.attach(this.parent);

        //
        // Research update template elements
        // app separate to
        //      ui eventBused
        // and current
        //      screen eventBused
        //
        this.register.reactiveTemplate.research();

        GLog(1, `{${this.constructor.name}.change}`);
        //
        //
        //

        if (!this._installed.has(name)) {
            await screen.setup(params);
            this._installed.add(name)
        }

        this.register.uiManager.eventBused(this.register.reactiveTemplate.elements.screen);
        await screen.change(params);

        this._activeName = name;

        eventBus.publish(`screen:changed:${name}`, {name, data: screen});
        eventBus.publish(`screen:changed`, {name, data: screen});
    }

}
