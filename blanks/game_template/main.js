import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

import {ReaComponent} from "engine/ReaComponent.js";
import {Register} from "engine/Register.js";
import {Doom} from "engine/utils/Doom.js";

import {Theater3DModule} from "./modules/Theater3DModule.js";
import {StateGame} from "./system/states/StateGame.js";
import {SelectTransformTarget} from "./system/utils.js";
import {PayerControls_SceneRay} from "./modules/PayerControls_SceneRay.js";





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

        this.theater = new Theater3DModule(this)
        this.registerModules({theater: this.theater })


        // ini WebGLRenderer. that create basic objects as scene, camera, renderer
        this.initRerender()

        // after creating basic rendering installations
        //
        //


        this.controlManager.mouseManager.setup({target:this.theater.renderer.domElement})

        this.initEnvironment()



        this.controlsCamera = initControlsCameraDev(this)

        // OR other controller
        //
        // this.controlsCamera = new PayerControls_SceneRay(this)
        // const highlightInteract = new THREE.BoxHelper()
        // this.controlsCamera.setup({
        //     camera: this.theater.camera,
        //     renderer: this.theater.renderer,
        //     scene: this.theater.scene,
        //     // speed,
        //     // gravity,
        //     // radius,
        //     // height,
        //     // body,
        //     // face,
        //     // onUpdate
        //     onInteract: (obj3d => {
        //         if (obj3d) {
        //
        //             highlightInteract.setFromObject(obj3d)
        //
        //             this.theater.scene.add(highlightInteract)
        //
        //         } else {
        //             highlightInteract.removeFromParent()
        //         }
        //     })
        // })
        // const sceneObjects = await initWorld(this)
        // sceneObjects => this.controlsCamera.addInteract()
        // sceneObjects => this.controlsCamera.addCollider()




        this.modalUpscreen.unmount()
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

    initRerender () {
        const theater = this.theater
        const scene = new THREE.Scene()
        scene.name = 'MainScene'

        theater.createWebGLRenderer({
            alpha: true,
            pixelRatio: 1,
        })

        // theater.setCameraPerspective()
        // custom
        theater.setCamera(new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.01,
            1000
        ))
        theater.setScene(scene)

        theater.loopKeeper.onUpdate((delta) => {

            theater.update(delta)

            // only required if controls.enableDamping = true, or if controls.autoRotate = true
            if (this.controlsCamera?.enabled)
                this.controlsCamera?.update?.(delta)
        })
    }

    initEnvironment( ultra = false) {

        const scene = this.scene
        const renderer = this.renderer

        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap

        renderer.outputColorSpace = THREE.SRGBColorSpace

        // NoToneMapping CustomToneMapping LinearToneMapping ACESFilmicToneMapping NeutralToneMapping ReinhardToneMapping CineonToneMapping AgXToneMapping
        renderer.toneMapping = THREE.LinearToneMapping;
        renderer.toneMappingExposure = 1;

        // Enable shadow mapping
        register.renderer.shadowMap.enabled = true;
        // Optional: for softer edges
        register.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        renderer.setSize(window.innerWidth, window.innerHeight)

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


        // FOG
        //
        //
        // scene.fog = new THREE.FogExp2( 0xcccccc, 0.020 );
        // scene.fog = new THREE.Fog( color('#333333') )
        // scene.fog = new THREE.FogExp2( color('#000000'), 0.1250 );
        // scene.fog.near = 0.25


        // Texture for background
        // scene.background = new THREE.Color( '#000000' );


        const gridHelper = new THREE.GridHelper( 1, 10 );
        gridHelper.scale.setScalar( 100 );
        scene.add( gridHelper );


        const axesHelper = new THREE.AxesHelper( 1 );
        scene.add( axesHelper );


        const them = {
            a: [ new THREE.Color('#ffffff'), new THREE.Color('#222222')],
            o: [ new THREE.Color('#c9fdc1'), new THREE.Color('#528f11')],
            c: [ new THREE.Color('#3a889b'), new THREE.Color('#36383d')]
        }

        const c1 = them.a[0];
        const c2 = them.a[1];
        const hemisphereLight = new THREE.HemisphereLight(c1, c2, 1)
        hemisphereLight.position.y = 1
        scene.add( hemisphereLight );


        const ambientLight = new THREE.AmbientLight( color('#ffffff'), 0.25)
        scene.add( ambientLight );


        // ----------- OR
        // scene.add(new THREE.AmbientLight(0xffffff, 0.15))

        // scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 0.6))

        // const sun = new THREE.DirectionalLight(0xffffff, 1)
        // sun.position.set(50, 80, 30)
        // sun.scale.set(10,10,10)
        // sun.castShadow = true
        // scene.add(sun)
    }


}


function initControlsCameraDev(register)
{
    const controlsCamera = new OrbitControls(register.camera, register.renderer.domElement);
    controlsCamera .name = "CameraDevControl"
    controlsCamera .enabled = true;
    controlsCamera .enableDamping = false;
    controlsCamera .screenSpacePanning = true;
    controlsCamera .dampingFactor = 0.01;
    controlsCamera .keys = {
        LEFT: 'KeyA',
        RIGHT: 'KeyD',
        UP: 'KeyW',
        BOTTOM: 'KeyS'
    }
    // controlsCamera .listenToKeyEvents(window)

    register.camera.position.set(0, 5, 20);
    controlsCamera .target.set(new THREE.Vector3(0,0,0))

    controlsCamera .update()

    controlsCamera .addEventListener( 'change', () => {
        if (controlsCamera .enabled)
            register.theater.update()
    } );

    const selectTransformTarget = new SelectTransformTarget()

    selectTransformTarget.setup({
        renderer: register.renderer,
        scene: register.scene,
        camera: register.camera,
        enabled: true,
        onSelect: (event, intersectedObject) => {
            register.theater.render()
        },
        onChange: (event, intersectedObject) => {
            register.theater.render()
            if (!intersectedObject) {
                selectTransformTarget?.transformControls?.detach?.();
            }

        },
        onDragging: (event, intersectedObject) => {
            controlsCamera .enabled = !event.value;
        }
    })

    return controlsCamera
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







await game.setup()

game.theater.render()

game.controlManager.keyboardManager.onKeyJust("Escape", () => {
    game.theater.loopKeeper.togglePause()
    if (game.theater.loopKeeper.isPlayed) {
        console.log("Theater3D START")
        game.modalUpscreen.unmount()
    } else {
        console.log("Theater3D PAUSED")
        game.modalUpscreen.state.text = "PAUSED"
        game.modalUpscreen.mount()

    }
})


console.log(game)
