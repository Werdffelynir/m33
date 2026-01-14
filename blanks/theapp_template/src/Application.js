import {Register, STATUSES} from "../engine/Register.js";
import {AssetLoader} from "../engine/AssetLoader.js";
import {SoundManager} from "../engine/SoundManager.js";
import {LoopManager} from "../engine/LoopManager.js";
import {KeyboardManager} from "../engine/KeyboardManager.js";
import {Keybro} from "./systems/Keybro.js";
import {NotifyComponent} from "./components/NotifyComponent.js";
import {EscMenuComponent} from "./components/EscMenuComponent.js";
import {MouseManager} from "../engine/MouseManager.js";
import {State} from "./states/State.js";
import {
    FPS, TIME_SCALE,
    CAMERA_MARGIN, CAMERA_SPEED,
    MAP_HEIGHT, MAP_WIDTH,
    ZOOM, ZOOM_MAX, ZOOM_MIN
} from "./constants.js";
import {config} from "./config.js";
import {InputControlManager} from "../engine/InputControlManager.js";
import {GlobalInputControl} from "./systems/controls/GlobalInputControl.js";
import {SidebarInputControl} from "./systems/controls/SidebarInputControl.js";



export class Application extends Register{

    constructor() {

        super({
            config: {...{
                    fps: FPS,
                    timeScale: TIME_SCALE,
                    zoom: ZOOM,
                    zoomMin: ZOOM_MIN,
                    zoomMax: ZOOM_MAX,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    fieldWidth: MAP_WIDTH,
                    fieldHeight: MAP_HEIGHT,
                    cameraMargin: CAMERA_MARGIN,
                    cameraSpeed: CAMERA_SPEED,
                }, ...config},
            state: new State({}),
        });

        this.assetLoader = new AssetLoader(this);
        this.soundManager = new SoundManager();
        this.inputsManager = new InputControlManager(this)
        this.loopManager = new LoopManager(this);

        // theater and loopman configured into controller
        // this.theater = new TheaterManager(this)
        // this.theater3d = new Theater3DManager(this)






        // Add root for UI parts
        this.uiManager.configured({
            parent: this.rootUIElement,
        });








        // Added payloads and handler for audio
        this.assetLoader.configured({
            soundManager: this.soundManager,
        });
    }

    async setup() {

        await super.setup();

        // Init internal events triggers
        //
        //
        //
        this.eventBus.publish('app:setup:before')
        this.setState('status', STATUSES.LOADING);

        // Preload assets
        await this.assetLoader.init({
            preload: this.config?.preload || [],
        });

        this.setState('status', STATUSES.LOADED);

        // Setup App State
        //
        //
        //
        //
        this.state.setup({register: this})

        // Setup all registered and configured plugins
        //
        //
        //
        //
        await this.pluginManager.setupConfigured();

        // Init keyboard events manager
        //
        //
        //
        //
        this.inputsManager.configured({
            target: null,
            onlyfocus: false,
        })

        // Registered Components
        //
        //
        //
        //
        this.setupComponents()

        // IndexController
        //
        // TheaterController
        // Theater3DController
        // Start main controller
        await this.switchController('IndexController', {});

        // Run trigger after setup
        //
        //
        //
        //
        this.eventBus.publish('app:setup:after')


    }


    setupComponents() {
        this.componentManager.get('NotifyComponent').setup();
        this.componentManager.get('EscMenuComponent').setup();

        this.inputsManager.addControl('general', new GlobalInputControl())
        this.inputsManager.addControl('sidebar', new SidebarInputControl())
        this.inputsManager.setup()
        this.inputsManager.switchControl('general')
    }

}
