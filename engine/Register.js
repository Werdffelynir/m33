import {Reactive} from "./Reactive.js";
import {EventBus} from "./EventBus.js";
import {SeedGenerator} from "./SeedGenerator.js";
import {ControllerManager} from "./ControllerManager.js";
import {ModuleManager} from "./ModuleManager.js";
import {ScreenManager} from "./ScreenManager.js";
import {UIManager} from "./UIManager.js";
import {PluginManager} from "./PluginManager.js";
import {ReactiveTemplate} from "./ReactiveTemplate.js";
import {Ut} from "./Ut.js";
import {ComponentManager} from "./ComponentManager.js";
import {AssetLoader} from "./AssetLoader.js";
import {SoundManager} from "./SoundManager.js";
import {InputControlManager} from "./InputControlManager.js";



/**
 *
 * - 0-2 core level
 * - 3-4 app low level
 * - 5 app high level
 * - 6-7 game low level
 * - 8-9 game high level
 * ```
 * // use
 * window.GLogLevel = 4;
 *
 *
 *
 *
 * GLog(6, Data1 , Data2 , Data3)
 * ```
 * @param args
 * @constructor
 */


window.GLevelCoreLow = 0;
window.GLevelCoreMiddle = 1;
window.GLevelCoreHegh = 2;
window.GLevelAppLow = 3;
window.GLevelAppMiddle = 4;
window.GLevelAppHegh = 5;
window.GLevelGameLow = 6;
window.GLevelGameMiddle = 7;
window.GLevelGameHegh = 8;
window.GLevelGame = 9;
window.GLog = (...args) => {

    if (args.length < 2)
        return console.log(...args)

    let level = args.shift();

    if (Ut.isNumeric(level) && parseInt(level) >= window.GLogLevel) {
        args.unshift('[DBG] ')

        // log warn trace
        console.log.apply(console.context(), args);
    }
}
window.GLogLevel = window.GLogLevel ?? 3;



export const STATUSES = {
    VOID: 'void',
    ERROR: 'error',
    LOADING: 'loading',
    LOADED: 'loaded',
    READY: 'ready',
    PLAYING: 'playing',
    PAUSED: 'paused',
    DEADEND: 'deadend',
};


const RegisterConfig = {
    viewsPath: null,
    pluginsPath: null,
    pluginsList: null,
    seed: 'special_phrase',
};


const RootTemplateString = `
main#root[data-id=root]:
  container#screen[data-id=screen]: "Default Register Screens"
  container#ui[data-id=ui]: "Default Register UI Elements"
`;

export class Register {

    static version = '0.0.0.4'
    static instance;

    /**
     * ```
     * config = {
     *     pluginsPath: '../../plugins',
     *     pluginsList: [],
     * }
     *
     * class RegisterState = new IState({
     *  title: "The Title",
     *  started: false,
     * })
     *
     * register = Register( {config = {}, state = {IState | {}} } )
     * await register.setup()
     *
     * // Props
     * eventBus
     * config
     *
     * // Getters:
     * rootScreenElement: Element
     * rootUIElement: Element
     * elements: { [dataset.id]: Element, ... }
     * reactive: Reactive
     * state: IState
     *
     * // Managers Getters:
     * assets: AssetLoader
     * inputs: InputControlManager
     * modules: ModuleManager
     * components: ComponentManager
     * controllers: ControllerManager
     * uis: UIManager
     * screens: ScreenManager
     * plugins: PluginManager
     *
     * ```
     * @param config {Object|any}
     * @param state {Object|IState}
     */
    constructor({config = {}, state}) {

        Register.instance = this;

        this.config = {...RegisterConfig, ...config};

        this.pluginData = {};
        this.eventBus = new EventBus();

        //
        //
        // Reactive used IState for mutation of IState class and source
        //
        //
        this.reactiveTemplate = new ReactiveTemplate({
            template: RootTemplateString,
            state,
            props: {
                register: this,
            }
        });

        this.assetsLoader = new AssetLoader(this)
        this.inputControlManager = new InputControlManager(this)
        this.uiManager = new UIManager(this)
        this.moduleManager = new ModuleManager(this)
        this.controllerManager = new ControllerManager(this)
        this.screenManager = new ScreenManager(this)
        this.pluginManager = new PluginManager(this)
        this.componentManager = new ComponentManager(this)

        this.createSeedGenerator(this.config?.seed);
        this.setupTemplate();
    }

    get rootScreenElement () {return this.reactiveTemplate.elements.screen}
    get rootUIElement () {return this.reactiveTemplate.elements.ui}

    /** @type {any} */                       get elements () {return this.reactiveTemplate.elements}
    /** @type {Reactive|*}*/                 get reactive () {return this.reactiveTemplate.reactive}
    /** @type {IState|*}*/                   get state () {return this.reactiveTemplate.state}
    /** @type {ModuleManager}*/              get modules() {return this.moduleManager}
    /** @type {ComponentManager}*/           get components() {return this.componentManager}
    /** @type {ControllerManager}*/          get controllers() {return this.controllerManager}
    /** @type {UIManager}*/                  get uis() {return this.uiManager}
    /** @type {ScreenManager}*/              get screens() {return this.screenManager}
    /** @type {PluginManager}*/              get plugins() {return this.pluginManager}
    /** @type {InputControlManager}*/        get inputs () {return this.inputControlManager}
    /** @type {AssetLoader}*/                get assets () {return this.assetsLoader}

    async setup( params ) {

        if (params && Object.keys(params).length > 0) {
            this.config = {...this.config, ...params}
        }




        if (this.config?.preload && Array.isArray(this.config.preload)) {
            this.assets.configured({preload: this.config.preload, soundManager: new SoundManager()})
            await this.assets.init()
        }




        if (this.config?.keymap) {
            this.inputControlManager.configured({
                keymap: this.config.keymap,
            });
        }




        this.screenManager.configured({
            parent: this.reactiveTemplate.elements.screen,
        });




        this.uiManager.configured({
            parent: this.reactiveTemplate.elements.ui,
            eventBus: this.eventBus,
            viewsPath: this.config.viewsPath,
        });




        this.pluginManager.configured({
            pluginsPath: this.config.pluginsPath,
            pluginsList: this.config.pluginsList,
        });




        this.controllerManager.configured({});


        //
        // setup plugins
        //
        await this.pluginManager.setupConfigured();
    }

    async switchController(name, params = {}) {
        if (this._lastController === name) return console.warn(`{${this.constructor.name}.switchController} 
        Multiple call. process was interrupted!`, name);
        this._lastController = name;

        return await this.controllerManager.switch(name, params);
    }

    async registerControllers(classes = {}) {
        for (const [name, instance] of Object.entries(classes)) {
            await this.controllerManager.add(name, instance);

            this.eventBus.publish(`register:controller:${name}:`, {name, data: instance})
        }
    }

    registerScreens(classes = {}) {
        for (const [name, instance] of Object.entries(classes)) {
            this.screenManager.add(name, instance);

            this.eventBus.publish(`register:screen:${name}:`, {name, data: instance})
        }
    }

    /**
     * ```
     * registerModules({
     *      RerenderModule: new RerenderModule(register))
     * })
     *
     * register.modules.get('Theater3D')
     * ```
     * @param classes
     */
    registerModules(classes = {}) {
        for (const [name, instance] of Object.entries(classes)) {
            if (this.moduleManager.has(name)) {
                return console.warn(`Module ${name} is registered!`);
            }

            this.moduleManager.add(name, instance);

            this.eventBus.publish(`register:module:${name}:`, {name, data: instance})
        }
    }

    registerComponents(classes = {}) {
        for (const [name, instance] of Object.entries(classes)) {

            if (this.componentManager.has(name)) {
                return console.warn(`Component ${name} is registered!`)
            }

            this.componentManager.add(name, instance);
            this.eventBus.publish(`register:component:${name}:`, {name, data: instance})
        }
    }

    registerUIs(classes = {}) {
        for (const [name, instance] of Object.entries(classes)) {

            if (this.uiManager.has(name)) {
                console.warn(`UI View "${name}" is registered!`)
            }

            this.uiManager.registerView(name, instance);
            this.eventBus.publish(`register:view:${name}:`, {name:name, data: instance})
        }
    }

    setupTemplate() {
        //
        // Basic template, tree
        //
        // root
        //    screen
        //    ui
        this.reactiveTemplate.render();

        document.body.textContent =
            this.reactiveTemplate.elements.ui.textContent =
                this.reactiveTemplate.elements.screen.textContent = '';

        document.body.appendChild(this.reactiveTemplate.template);
    }

    createSeedGenerator(seed) {
        this.seed = new SeedGenerator(seed);
    }

    /** @type {Module} */
    module(name) {
        return this.moduleManager.get(name)
    }

    /** @type {any} */
    component(name) {
        return this.componentManager.get(name)
    }

    setState(path, value) {
        this.reactive.set(path, value)
    }

    getState(path) {
        if (!path) return this.reactive.state
        return this.reactive.get(path)
    }

    hasState(path) {return this.reactive.has(path)}

    onState(path, callback) {
        this.reactive.on(path, callback)
    }

    offState(path, callback) {
        this.reactive.off(path, callback)
    }
}
