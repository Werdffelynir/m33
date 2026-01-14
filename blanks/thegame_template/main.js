import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

import {ReaComponent} from "engine/ReaComponent.js";
import {Register, STATUSES} from "engine/Register.js";
import {Doom} from "engine/utils/Doom.js";

import {Theater3DModule} from "./modules/Theater3DModule.js";
import {StateGame} from "./system/states/StateGame.js";
import {SelectTransformTarget} from "./system/utils.js";
import {PayerControls_SceneRay} from "./modules/PayerControls_SceneRay.js";
import {EscMenuComponent} from "./components/EscMenuComponent.js";
import {Theater3DComponent} from "./components/theater3D/Theater3DComponent.js";
import {IndexController} from "./controllers/IndexController.js";
import {Theater2DController} from "./controllers/Theater2DController.js";
import {Theater3DController} from "./controllers/Theater3DController.js";
import {Theater3DScreen} from "./screens/Theater3DScreen.js";
import {IndexScreen} from "./screens/IndexScreen.js";
import {NotifyComponent} from "./components/NotifyComponent.js";
import {SettingsComponent} from "./components/index/SettingsComponent.js";



class GameRegister extends Register {

    async setup(params) {

        this.modalUpscreen = new ReaComponent({}, {
            name: "LoadingPage",
            template:`div.absolute.top.fx-center-center.fill.bg-goldenrod.tan.opacity08.text-center.fontsize-500: "{{text}}"`,
            state: {
                text: "void" 
            }
        })
        this.modalUpscreen.state.text = "Loading..."
        this.modalUpscreen.mount(document.body)

        await super.setup(params)


        //
        //
        //
        // keep a close eye on the global state object, keep it clean and tidy, this ensures simplicity, stability and performance
        //
        this.setState('status', STATUSES.LOADED);


        //
        //
        //
        // Handler manager. Create Events listeners on special managers? for keyboard and mouse inputs
        //
        this.inputControlManager.setup()


        //
        //
        //
        // Registered Components
        //
        this.setupComponents()


        //
        //
        //
        // Startup all registered and configured plugins
        //
        await this.plugins.setupConfigured();


        //
        //
        //
        // Start main controller (IndexController, Theater3DController)
        //
        await this.switchController('IndexController', {});


        //
        //
        //
        // Run trigger after setup
        //
        this.eventBus.publish('app:setup:after')
        this.setState('status', STATUSES.READY);

        this.modalUpscreen.unmount()
    }

    setupComponents () {

    }

    /** @type { THREE.Object3D | THREE.Camera | THREE.PerspectiveCamera } */
    get camera () {
        return this.theater.camera
    }
    /** @type { THREE.Scene} */
    get scene () {
        return this.theater.scene
    }
    /** @type { THREE.WebGLRenderer} */
    get renderer () {
        return this.theater.renderer
    }

}


const game = new GameRegister({
    config: {
        fps: 80,
        width: window.innerWidth,
        height: window.innerHeight,
        preload: [
            // {type: 'image', name: 'picture', url: '/resources/images/picture.png'},
            // {type: 'audio', name: 'click1', url: '/resources/sounds/click5.mp3'},
            // {type: 'json',  name: 'place_scene', url: '/resources/scenes/place.scene.json'},
        ],
        keymap: {
            up: {pressed: false, codes: ['ArrowUp'], callbacks: []},
            down: {pressed: false, codes: ['ArrowDown'], callbacks: []},
            forward: {pressed: false, codes: ['ArrowUp','KeyW'], callbacks: []},
            backward: {pressed: false, codes: ['ArrowDown','KeyS'], callbacks: []},
            left: {pressed: false, codes: ['ArrowLeft','KeyA'], callbacks: []},
            right: {pressed: false, codes: ['ArrowRight','KeyD'], callbacks: []},
            jump: {pressed: false, codes: ['Space'], callbacks: []},

            space: {pressed: false, codes: ['Space'], callbacks: []},
            shift: {pressed: false, codes: ['ShiftLeft'], callbacks: []},
            ctrl: {pressed: false, codes: ['CtrlLeft'], callbacks: []},
            alt: {pressed: false, codes: ['AltLeft'], callbacks: []},

            q: {pressed: false, codes: ['KeyQ'], callbacks: []},
            e: {pressed: false, codes: ['KeyE'], callbacks: []},
            f: {pressed: false, codes: ['KeyF'], callbacks: []},
            r: {pressed: false, codes: ['KeyR'], callbacks: []},

            dig1: {pressed: false, codes: ['Digit1',], callbacks: []},
            dig2: {pressed: false, codes: ['Digit2',], callbacks: []},
        },
    },
    state: new StateGame(),
})




game.registerModules({
    Theater3DModule: new Theater3DModule(game),
});

game.registerComponents({
    NotifyComponent: new NotifyComponent(game),
    EscMenuComponent: new EscMenuComponent(game),
    Theater3DComponent: new Theater3DComponent(game),
    SettingsComponent: new SettingsComponent(game),
});

game.registerControllers({
    IndexController: new IndexController(game),
    Theater2DController: new Theater2DController(game),
    Theater3DController: new Theater3DController(game),
});

game.registerScreens({
    IndexScreen: new IndexScreen(game),
    Theater2DScreen: new Theater3DScreen(game),
    Theater3DScreen: new Theater3DScreen(game),
});




await game.setup()

