/**
 *
 * chain:
 *      - setup(params) <- exec once
 *      - init(params) <- call register.switchController()
 *      - destroy() <- exec if changed to other controller
 *
 * ```
 *
 * await .changeScreen()
 * .getScreen()
 * .setup(params)
 * .init(params)
 * .reload(params)
 * .destroy(params)
 * .exportData(params)
 *
 *
 * export class DemoController extends Controller {
 *
 *     constructor(register) {
 *         super(register);
 *     }
 *
 *     async setup(params) {}
 *
 *     async init(params) {
 *         await this.changeScreen( DemoScreen.name, {
 *             controller: this,
 *         })
 *     }
 *
 * }
 * ```
 */
export class Controller {

    constructor(register) {
        /** @type {any|Register} */
        this.register = register;
        /** @type {any|EventBus} */
        this.eventBus = register.eventBus;

        /** @deprecated */
        this.ui = register.uiManager;

        this._installed = false;
    }

    async changeScreen(name, params) {
        this.currentScreen = name;
        await this.register.screenManager.change(name, params);
    }

    getScreen(name) {
        return this.register.screenManager.get(name ?? this.currentScreen);
    }

    // be called only once when instance is added/registered
    async preload() {
        GLog(1, `[${this.constructor.name}.preload]`)
    }

    // should be called only once.
    // if switch Controller is called, "setup" is applied first, then "init"
    setup(params) {
        if (this._installed) return;
        this._installed = true;

        GLog(1, `[${this.constructor.name}.setup]`)
    }

    // called every time they are initialized.
    // auto-call chain
    // ControllerManager.switch
    // Register.switchController
    async init(params) {
        GLog(1, `[${this.constructor.name}.init]`)
    }

    // Called if explicitly reloaded
    async reload(params) {
        GLog(1, `[${this.constructor.name}.reload]`)
    }

    // Called before switching away
    destroy() {
        GLog(1, `[${this.constructor.name}.destroy]`)
    }

    // Optional data export
    exportData() {
    }
}

