import {Module} from "./Module.js";
import {IManager} from "./IManager.js";

/**
 * ```
 * this.moduleManager = new ModuleManager(register, gameModules);
 *
 * moduleManager.registerModules({
 *      name1: new Module,
 *      name2: new Module,
 * })
 *
 * moduleManager.configured(name, {params, params})
 *
 * update(delta) {
 *     this.moduleManager.update(delta);
 *     // update...
 * }
 * ```
 *
 * ## Events
 * - module:registered:
 * - module:setuped:
 *
 */
export class ModuleManager extends IManager {

    constructor(register) {
        super(register)
        /** @type {Register} */ this.register = register;

        /**
         *
         * @type {Map<string, Module>}
         */
        this.stackmanager = new Map();
        this._modulesInstalled = new Set();
    }

    configured(params) {
    }

    remove(name) {
        let module = this.get(name);
        module?.destroy?.();
        this.stackmanager.delete(name);
        this._modulesInstalled.delete(name);

        this.register.eventBus.publish(`module:deleted:${name}`, {name, data: {}});
    }


    add(name, module) {
        if (!(module instanceof Module))
            throw new Error(`ModuleClass is not instance of Module`);

        this.register.eventBus.publish(`module:registered:${name}`, {name, data: module});

        module?.setup();

        return this.stackmanager.set(name, module);
    }

    isInstalled(name) {
        return this._modulesInstalled.has(name) && this.get(name)._installed;
    }

    uninstall(name, params) {
        this.get(name)?.uninstall?.();
        this.get(name)?.destroy?.();
        this._modulesInstalled.delete(name);
    }

    /**
     *
     * @param name
     * @param params
     * @returns {Module|*}
     */
    install(name, params) {
        if (this._modulesInstalled.has(name)) return this.get(name);

        this._modulesInstalled.add(name);

        /**@type {Module}*/
        const instance = this.get(name);
        instance.install(params);
        instance.installed = true;

        this.register.eventBus.publish(`module:setup:${name}`, {name, data: instance});
        return instance;
    }

    tick(delta, iterator, paused) {
        for (const module of this.stackmanager.values()) {
            if (module?.tick) {
                module.tick(delta, iterator, paused);
            }
        }
    }

    update(delta, camera, iterator) {
        for (const module of this.stackmanager.values()) {
            if (module.updatable) {
                module.update(delta, camera, iterator);
            }
        }
    }

    reload() {
        for (const module of this.stackmanager.values()) {
            module.reload();
        }
    }
}

