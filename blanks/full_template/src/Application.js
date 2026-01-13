import {Register, STATUSES} from "../engine/Register.js";
import {AssetLoader} from "../engine/AssetLoader.js";
import {SoundManager} from "../engine/SoundManager.js";
import {LoopManager} from "../engine/LoopManager.js";
import {InputControlManager} from "../engine/InputControlManager.js";
import {NotifyComponent} from "./components/NotifyComponent.js";
import {EscMenuComponent} from "./components/EscMenuComponent.js";
import {Keybro} from "./systems/controls/Keybro.js";
import {GlobalInputControl} from "./systems/controls/GlobalInputControl.js";
import {LOOP_MAIN, LoopMain} from "./systems/loops/LoopMain.js";
import {State} from "./states/State.js";
import {config} from "./config.js";
import {
    FPS, TIME_SCALE,
    CAMERA_MARGIN, CAMERA_CONTROL_SPEED,
    MAP_HEIGHT, MAP_WIDTH,
    ZOOM, ZOOM_MAX, ZOOM_MIN,
} from "./constants.js";



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
                    cameraSpeed: CAMERA_CONTROL_SPEED,
                }, ...config},
            state: new State({}),
        });

        this.assetLoader = new AssetLoader(this);
        this.soundManager = new SoundManager();

        this.loopman = new LoopManager(this);
        this.inputControlManager = new InputControlManager(this)


        // Add root for UI parts
        this.uiman.configured({
            parent: this.templateman.elements.ui,
        });





        // Keyboard events config for handlers
        this.inputControlManager.configured({
            keymap: Keybro,
        });
        this.inputControlManager.addControl('global', new GlobalInputControl())
        this.inputControlManager.switchControl('global')





        // Added payloads and handler for audio
        this.assetLoader.configured({
            soundManager: this.soundManager,
        });


    }

    async setup() {
        await super.setup();
        this.eventBus.publish('app:setup:before')
        this.setState('status', STATUSES.LOADING);






        // Preload assets
        await this.assetLoader.init({
            preload: this.config?.preload || [],
        });






        this.setState('status', STATUSES.LOADED);

        // Setup AppState
        this.state.setup({register: this})






        // Init keyboard and mouse events handler manager
        this.inputControlManager.setup()






        // Registered Components
        this.setupComponents()





        //
        // Startup all registered and configured plugins
        //
        await this.plugman.setupConfigured();




        // IndexController
        // Theater2DController
        // Start main controller
        await this.switchController('Theater2DController', {});

        // Run trigger after setup
        //
        //
        //
        //
        this.eventBus.publish('app:setup:after')
        this.setState('status', STATUSES.READY);

    }

    component (name) {
        return this.compoman.get(name);
    }

    setupComponents() {
        this.compoman.get(NotifyComponent.name).setup();
        this.compoman.get(EscMenuComponent.name).setup();

        /**
         * ```
         * loop = this.loopman.get('main');
         *
         * loop.stop()
         * loop.start()
         * loop.pause()
         * loop.resume()
         * loop.running
         * loop.played
         * loop.togglePause()
         * ```
         */
        this.loopman.configured({
            loops: {
                main: new LoopMain(this, {
                    onupdate: (delta, iterator, requestRender) => {
                        // this.loopman?.onupdate?.(delta, iterator, requestRender)
                    },
                    onrender: (delta, iterator) => {
                        // this.loopman?.onrender?.(delta, iterator)
                    },
                }),
            },
        })
    }

}
