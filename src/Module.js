import {Register} from "./Register.js";


export const MODULE_TYPE = {
    none: 'none',
    dev: 'dev',
    ui: 'ui',
    game: 'game',
    engine: 'engine',
    view: 'view',
}

export class Module {

    /** @type {boolean} */
    updatable;

    /** @type {string} */
    type;

    /** @type {Register|any} */
    register;

    /**
     * ### Static modules
     * set configuration in file index.js
     *
     * ```
     * const register = new Register()
     * register.registerModules({
     *      statistic: new Module(register),
     *  });
     * ```
     *
     * ### Dynamic modules
     * ```
     * statisticModule = new Module(register, {
     *      updatable: true,
     *      type: 'statistic',
     *      update: (delta, cam, i) => {
     *          if (i % 10 !== 0) return;
     *          console.log(102)
     *      },
     *  });
     *
     *  register.registerModules({
     *      statistic: statisticModule,
     *  });
     *
     *  register.moduleManager.add('statistic', statisticModule);
     * ```
     * @param register {Register}
     * @param params
     */

    constructor(register, params = {}) {
        if (!(register instanceof Register)) throw new Error(`first parameter is not Class instance {Game}`);
        this.register = register;

        this.type = params?.type || MODULE_TYPE.none;
        this.updatable = params?.updatable || false;

        if (params?.setup && typeof params.setup === 'function') this.setup = params.setup;
        if (params?.update && typeof params.update === 'function') this.update = params.update;
        if (params?.install && typeof params.install === 'function') this.install = params.install;
        if (params?.uninstall && typeof params.uninstall === 'function') this.uninstall = params.uninstall;

        this.props = params;
    }

    /**
     * Auto-Executed in Register.registerModules
     * Reserved and Overwrite that method. Alternative sync configured module
     * Synchronous version of `async init` method. Use one of these
     */
    setup() {

    }

    /**
     * Reserved. Auto-Used in ModuleManager.install(name, params). Executed only once
     * @param params
     */
    install(params) {

    }
    uninstall(params) {

    }

    /**
     * Overwrite that method. Setup, with custom setting
     * @param params
     */
    async init(params) {

    }

    /**
     * Called automatically after the program loads data
     */
    reload() {

    }

    /**
     * Called automatically in the basic loop. Class {AnimationLoop}
     * if this.updatable = true
     * @param delta
     * param camera
     * @param iterator
     */
    update(delta, iterator) {

    }

    exportData() {
        return {}
    }
}
