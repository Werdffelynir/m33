import {Module} from "../../engine/Module.js";
import {Reactive} from "../../engine/Reactive.js";
import * as THREE from "three";
import {
    ArcballControls,
    FirstPersonControls,
    FlyControls,
    OrbitControls,
    TransformControls,
    TransformControlsGizmo,
    TransformControlsPlane
} from "three/addons";
import {MOUSE_EVENT} from "../../engine/MouseManager.js";
import {
    CAMERA_FAR,
    CAMERA_FOV, CAMERA_NEAR,
    CONTROLS_LOOK_SPEED,
    CONTROLS_MAX_DISTANCE,
    CONTROLS_MIN_DISTANCE,
    CONTROLS_MOVEMENT_SPEED,
    CONTROLS_ROLL_SPEED
} from "../constants.js";

// import Stats from "three/addons/libs/stats.module.js";
import Stats from "three/libs/stats";
import {Metric} from "../../engine/utils/Metric.js";
import {Dateme} from "../../engine/utils/Dateme.js";



export class SelectRaycaster {
    constructor(renderedModule) {
        this.renderedModule = renderedModule;
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        this.mouseSpeed = 2

        /**@type {THREE.Object3D} */
        this.selectObject3D = null;
        this.arrowsObject3D = new THREE.Object3D();
        this.arrowsObject3D.isHidden = true
        this.arrowsVectorsHeads = {
            x: new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(), 3, 0xff0000, 0.4, 0.25),
            y: new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(), 3, 0x00ff00, 0.4, 0.25),
            z: new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(), 3, 0x0000ff, 0.4, 0.25),
        };
        this.arrowsVectors = {
            x: new THREE.AxesHelper(2),
            y: new THREE.AxesHelper(2),
            z: new THREE.AxesHelper(2),
        };
        Object.values(this.arrowsVectors).forEach(a => this.arrowsObject3D.add(a));
    }
    listen({event, scene, camera, renderer}, onIntersect){
        this.renderer = renderer
        /** @type {THREE.Scene}*/
        this.scene = scene
        /** @type {Camera|THREE.Camera|THREE.Object3D} */
        this.camera = camera

        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        if (intersects.length > 0) {
            const object = intersects[0].object;
            onIntersect?.(object, this.mouse)
        } else {
            onIntersect?.(null, this.mouse)
        }
    }
    _mouse(event){
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * this.mouseSpeed - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height)  * this.mouseSpeed + 1
    }
    attach(object3D){
        this.selectObject3D = object3D
        this.selectObject3D.add(this.arrowsObject3D)
    }
    detach(){
        if (this.selectObject3D) {
            this.selectObject3D.remove(this.arrowsObject3D);
            this.selectObject3D = null
        }
    }
}

export class RenderedRender {

}

export class RenderedCamera {
    constructor() {
        /** @type {THREE.Camera} */
        this.camera = null;
    }


}

export class RenderedScenes {
    constructor() {
        this.scenes = new Map();
        this.activeSceneId = null;
    }
    add (sceneId, scene) {
        this.scenes.set(sceneId, {
            sceneId,
            scene,
            objects: [],
        });
        if (!this.activeSceneId) this.activeSceneId = sceneId
    }
    get scene () {
        this.scenes.get(this.activeSceneId)
    }
}

export class RenderedController {
    constructor(renderedModule) {
        this.loader = new THREE.ObjectLoader();
        this.renderedScenes = new RenderedScenes();

        /** @type {THREE.WebGLRenderer}*/
        this.renderer = null
        /** @type {THREE.Scene}*/
        this.scene = null
        /** @type {THREE.Camera|THREE.PerspectiveCamera|THREE.OrthographicCamera}*/
        this.camera = null
        this.project = null
        this.environment = null
        this.history = null
        this.metadata = null
        this.scripts = null
        this.configuration = {}

        // Basic Controls Cameras
        const conf = {
            fov: CAMERA_FOV,
            aspect: window.innerWidth / window.innerHeight,
            near: CAMERA_NEAR,
            far: CAMERA_FAR,
            frustumSize: 5,
        }
        this.cameraPerspective = new THREE.PerspectiveCamera( conf.fov, conf.aspect,  conf.near,  conf.far );
        this.cameraOrthographic = new THREE.OrthographicCamera( - conf.frustumSize * conf.aspect, conf.frustumSize * conf.aspect, conf.frustumSize, - conf.frustumSize,  conf.near,  conf.far);

        this.cameraOrthographic.position.set(0, 0, 20);

    }
    getRendererParameters(){
        const r = this.renderer
        const ud = this.rendererParameters ?? {}
        let data = {
            alpha: ud.alpha,
            premultipliedAlpha: ud.premultipliedAlpha,
            antialias: ud.antialias,
            stencil: ud.stencil,
            preserveDrawingBuffer: ud.preserveDrawingBuffer,
            failIfMajorPerformanceCaveat: ud.failIfMajorPerformanceCaveat,
            depth: ud.depth,
            logarithmicDepthBuffer: ud.logarithmicDepthBuffer,
            reversedDepthBuffer: ud.reversedDepthBuffer,
            precision: ud.precision,
            powerPreference: ud.powerPreference,
            autoClear: r.autoClear,
            shadowMapEnabled: r.shadowMap.enabled,
            shadowMapType: r.shadowMap.type,
            toneMapping: r.toneMapping,
            toneMappingExposure: r.toneMappingExposure,
            transmissionResolutionScale: r.transmissionResolutionScale,
            pixelRatio: r.getPixelRatio(),

        }
        return data;
    }
    mousemoveHandler(param, event){}
    mousedownHandler(param, event){}
    mouseupHandler(param, event){}

    windowResizeHandler() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.aspect = aspect;
        if (this.camera.type === "CameraOrthographic") {
            this.camera.left = this.camera.bottom * aspect;
            this.camera.right = this.camera.top * aspect;
        }
        this.camera .updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    parse(json) {return this.loader.parse(json)}
    createWebGLRenderer (project) {

        const _createRenderer = (params = {}) => {
            let parameters = {
                sizeWidth: params?.sizeWidth ?? window.innerWidth,
                sizeHeight: params?.sizeHeight ?? window.innerHeight,
                alpha: params?.alpha ?? false,
                premultipliedAlpha: params?.premultipliedAlpha ?? true,
                antialias: params?.antialias ?? true,
                stencil: params?.stencil ?? true,
                preserveDrawingBuffer: params?.preserveDrawingBuffer ?? true,
                failIfMajorPerformanceCaveat: params?.failIfMajorPerformanceCaveat ?? true,
                depth: params?.depth ?? true,
                logarithmicDepthBuffer: params?.logarithmicDepthBuffer ?? false,
                reversedDepthBuffer: params?.reversedDepthBuffer ?? true,
                precision: params?.precision ?? "lowp",
                powerPreference: params?.powerPreference ?? "default",
            }

            this.rendererParameters = {...parameters}

            if (params?.canvas) parameters.canvas = params.canvas;
            if (params?.context) parameters.context = params.context;

            /**
             *
             *
             */
            const renderer = new THREE.WebGLRenderer(parameters);

            renderer.setSize(parameters.sizeWidth, parameters.sizeHeight);
            renderer.setPixelRatio(params?.pixelRatio ?? window.devicePixelRatio);
            renderer.autoClear = parameters?.autoClear ?? true
            renderer.shadowMap.enabled = params?.shadowMapEnabled ?? true
            renderer.shadowMap.type = params?.shadowMapType ?? THREE.PCFShadowMap;
            renderer.toneMapping = params?.toneMapping ?? THREE.NoToneMapping ;
            renderer.toneMappingExposure = params?.toneMappingExposure ?? 1;
            renderer.sortObjects = params?.sortObjects ??  false;

            return renderer;
        }
        /** @type {THREE.WebGLRenderer}*/
        this.renderer = _createRenderer(project);

        console.dir('{WebGLRenderer}', this.renderer)
        return this.renderer
    }
    setCamera (/**@type {THREE.Camera} */ camera) {
        if (!(camera instanceof THREE.Camera)) return console.warn(`Error setCamera (camera). parameter not is "THREE.Camera" instance`)

        if (camera !== this.camera) {


            this.camera = camera;
            camera.updateMatrixWorld()
        }

        return this.camera
    }
    setScene (/**@type {THREE.Scene} */ scene) {
        if (!(scene instanceof THREE.Scene)) return console.warn(`Error setScene (scene). parameter not is "THREE.Scene" instance`)
        if (!scene?.name || scene.name.trim().length < 2) {
            return console.warn(`RenderedScenes: ${scene.name} not found`);
        }

        if (scene !== this.scene) {
            this.renderedScenes.add(scene.name, scene)
            this.renderedScenes.activeSceneId = scene.name
            this.scene = scene;
        }
        return this.scene
    }

    removeObject(obj) {
        if (!obj) return;
        if (obj.parent) {
            obj.parent.remove(obj);
            obj.removeFromParent()
        }

        obj.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => this.disposeMaterial(m));
                } else {
                    this.disposeMaterial(child.material);
                }
            }
        });
    }
    disposeMaterial(material) {
        for (let k in material) {
            const v = material[k];
            if (v && v.isTexture) v.dispose();
        }
        material.dispose();
    }

}

export class RenderedModule extends Module {

    setup() {
        this.updatable = true;
        this.type = 'renderer'
        this.reactive = new Reactive({
            updated: 0,
            loaded: null,
            selected: null,
            cameraChanged: 0,
        })
        this.state = this.reactive.state;

        this.controller = new RenderedController(this);
        this.selectRaycaster = new SelectRaycaster(this)

        /**@type {Camera|OrbitControls|FlyControls|FirstPersonControls|ArcballControls} */
        this.controls = null;
        this.renderer = null;
        this.lastSelectObject3D = null;

        this.cachedObjects = new Set();
        this.keyboardManager = this.register.inputControlManager.keyboardManager;
        /** @type {MouseManager} */
        this.mouseManager = this.register.inputControlManager.mouseManager

        this.root = this.props?.root;
        /** @type {LoopMain} */
        this.loop = this.register.loopman.get('main');
        this.loop.animation.fixedDelta = 1/120


        const stats = new Stats();
        stats.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom
        // Append the stats panel to your HTML body
        document.body.appendChild(stats.dom);
        stats.dom.style.width = '100px'
        stats.dom.style.height = '50px'
        stats.dom.style.position = 'absolute'
        stats.dom.style.top = 'auto'
        stats.dom.style.bottom = '0'
        window.RR = this

        this._onupdate = (delta, iterator, requestRender) => {
            stats.begin();

            this.update(delta, iterator)

            stats.end();
        }
        this._onrender = (delta, iterator) => {}

        this.loop.onUpdate( this._onupdate )
        this.loop.onRender( this._onrender )

        this._bindEvents ()
    }

    _bindEvents () {

        this.mouseManager.addListener(MOUSE_EVENT.MOUSEMOVE, (param, event)=>{
            if (event.target !== this.renderer.domElement) return ;
        })
        this.mouseManager.addListener(MOUSE_EVENT.MOUSEDOWN, (param, event)=>{
            if (event.target !== this.renderer.domElement) return ;
            if (param.left) {

            }

        })
        this.mouseManager.addListener(MOUSE_EVENT.MOUSEUP, (param, event)=>{
            if (event.target !== this.renderer.domElement) return ;

        })
        this.mouseManager.addListener(MOUSE_EVENT.DBLCLICK, (param, event)=>{
            if (event.target !== this.renderer.domElement) return ;
            if (!this._transformMode) return ;

            this.selectRaycaster.listen({
                event: event,
                scene: this.scene,
                camera: this.camera,
                renderer: this.renderer,
            }, (object3D, mouse) => {

                console.log('selectRaycaster', object3D)
                if (object3D && object3D.parentId)
                    this.setSelectedObject(object3D)
                else this.clearSelectedObject()

                this.rerender()
            })
        })

        window.onresize = () => {
            if (this.camera) {
                this.controller.windowResizeHandler()
                this.rerender()
            }
        };
    }
    _recursiveScan(object3d) {
        if (!(object3d instanceof THREE.Object3D)) return;

        if (object3d.children.length) {
            object3d.children.forEach(child => {
                if (child.uuid === object3d.uuid) return;

                child.parentId = object3d.id
                this._recursiveScan(child)
            })
        }

        this.cachedObjects.add(object3d)
    }

    replaceObject (targetObject3D, parentObject3D) {
        targetObject3D.removeFromParent()
        parentObject3D.add(targetObject3D)

        targetObject3D.parentId = parentObject3D.id

        this.updateCache();
    }
    removeObject (targetObject3D) {
        if (!targetObject3D?.isObject3D) return console.warn(`Parameters is not types of Object3D. Deprecated append to root`)

        this.controller.removeObject(targetObject3D)
        this.updateCache()
        this.state.updated = (new Date).getTime()
    }
    appendTo (targetObject3D, parentObject3D) {
        if (!parentObject3D?.isObject3D || !targetObject3D?.isObject3D) return console.warn(`Parameters is not types of Object3D. Deprecated append to root`)

        parentObject3D.add(targetObject3D)
        targetObject3D.parentId = parentObject3D.id

        this.updateCache()
        this.state.updated = (new Date).getTime()
    }

    animationToggle(){
        this.loop.togglePause()
        this.state.played = this.loop.animation.played;
    }
    animationStart(){
        if (this.loop.animation.running) this.loop.resume()
        this.loop.start()
        this.state.played = true;
    }
    animationStop(){
        this.loop.pause()
        this.state.played = false;
    }

    rerender () { this.renderer.render(this.scene, this.camera) }
    update (delta, iter) {
        if (!this.renderer || !this.scene || !this.camera) return;

        const keymap =  this.keyboardManager.keymap
        const mouse =  this.mouseManager.mouse
        const input = {
            forward: keymap.UP.pressed,
            backward: keymap.DOWN.pressed,
            left: keymap.LEFT.pressed,
            right: keymap.RIGHT.pressed,
            up: keymap.r.pressed,
            down: keymap.f.pressed,
            pitchUp: keymap.x.pressed,
            pitchDown: keymap.z.pressed,
            rollLeft: keymap.c.pressed,
            rollRight: keymap.v.pressed,
            yawLeft: keymap.q.pressed,
            yawRight: keymap.e.pressed,
        }
        const hasAction = !!Object.values(input).filter(Boolean).length
        if (hasAction || mouse.left || mouse.right || mouse.wheeled) {
            this.controls?.update(delta)
            this.rerender()
        } else {

        }
    }

    onLoaded(cb) {this.reactive.on('loaded', cb)}
    onUpdated(cb) {this.reactive.on('updated', cb)}
    onSelected(cb) {this.reactive.on('selected', (val, prev) => cb( val, prev ))}

    setupJSON({scene, camera, environment, history, metadata, project, scripts}) {
        /** @type {THREE.WebGLRenderer}*/ this.renderer = this.controller.createWebGLRenderer({...{
                alpha: true,
            }, ...project})
        this.root.textContent = ''
        this.root.appendChild( this.renderer.domElement );

        this.controller.setScene((scene?.isObject3D && scene instanceof THREE.Scene) ? scene : this.controller.parse(scene))

        this.controller.cameraPerspective = this.controller.parse(camera)
        this.controller.setCamera(this.controller.cameraPerspective)

        this.updateCache()
        this.state.loaded =  (new Date).getTime()
        this.state.updated =  (new Date).getTime()

        this.rerender()
    }

    cloneObject(object) {
        if (this.lastSelectObject3D === object)
            this.clearSelectedObject()

        object.children.forEach(ch => { if(ch.isHidden) ch.removeFromParent() })

        let clone = object.clone()
        return clone
    }
    
    setSelectedObject(object3D) {
        if (!object3D.parentId || ["TransformControlsPlane", "Scene"].includes(object3D.type))
            return;

        this.lastSelectObject3D = object3D
        this.state.selected = {id: object3D.id, uuid: object3D.uuid, name: object3D.name};

        this.selectRaycaster?.detach?.()
        this.transformControls?.detach?.()

        switch (this._transformMode) {
            case "select":
                this.selectRaycaster.attach(object3D)
                break;

            default:
                if (object3D?.parentId && this.scene && this.transformControls) {
                    this.scene.add( this.transformControls.gizmo );
                    this.transformControls.attach(object3D);
                }
                break;
        }
    }
    clearSelectedObject() {
        this.selectRaycaster?.detach?.()
        this.transformControls?.detach?.()

        if (this.transformControls?.gizmo )
            this.transformControls.gizmo.removeFromParent()

        if (this.state.selected) this.state.selected = null
        this.lastSelectObject3D = null
    }

    //
    //
    // "Perspective" | "Orthographic"
    setCameraType(type = "perspective") {
        this._cameraType = type;

        switch (type) {
            case "perspective":
                this.controller.setCamera(this.controller.cameraPerspective)

                if (!this.controls) this.setCameraControl("orbit")
                this.controls.enableRotate = true
                break;
            case "orthographic":
                this.controller.setCamera(this.controller.cameraOrthographic)

                if (!this.controls) this.setCameraControl("orbit")
                this.controls.enableRotate = false
                break;
        }

        this.rerender()
        this.state.cameraChanged =  (new Date).getTime()
        this.state.updated =  (new Date).getTime()
    }
    setTransformMode(type = "select") {
        this._transformMode = type;
        this._transformModeSpace =  this.lastSelectObject3D?.parentId ? "local" : "world"

        if (type === 'select') {
            return;
        }

        if (this.transformControls) {
            if (["translate", "rotate", "scale"].includes(type))
                this.transformControls.setMode(type);
        } else {

            this.transformControls = new TransformControls( this.camera, this.renderer.domElement );
            this.transformControls.addEventListener( 'change',  this._on_rerender);
            this.transformControls.addEventListener( 'dragging-changed',  this._dragging_changed_transform);
            this.transformControls.size = 0.5

            if (["translate", "rotate", "scale"].includes(type))
                this.transformControls.setMode(type);

            this.transformControls.gizmo  = this.transformControls.getHelper();
            this.transformControls.gizmo.isHidden = true;

            this.transformControls.setSpace(this._transformModeSpace);
        }
        this.rerender()
    }
    cameraReset(type) {
        // reset | x y z
        const cam = this.camera

        const resetAll = () => {
            cam.rotation.reorder("XYZ")
            cam.position.set(0,0,0)
            cam.rotation.set(0,0,0)
            cam.scale.set(1,1,1)
        }

        resetAll()
        switch (type) {
            case "reset":
                break;
            case "x":
                cam.translateX(20)
                cam.rotateY(-Metric.RADDEG_90)
                break;
            case "y":
                cam.translateY(20)
                cam.rotateX(-Metric.RADDEG_90)
                break;
            case "z":
                cam.translateZ(20)
                cam.rotateY(0)
                break;
        }

        cam.updateMatrixWorld()
        if (this.controls) {
            this.controls.target.set(0,0,0);
            this.controls.update();
        }
        this.rerender()
    }
    setCameraControl(type = "orbit") {
        this._cameraControl = type;

        if( this.controls ) {
            this.controls.removeEventListener( 'change', this._on_rerender );
            this.controls.dispose()
        }

        if (type ===  "arcball") {
            this.controls = new ArcballControls(this.camera, this.renderer.domElement);
            this.controls.movementSpeed = CONTROLS_MOVEMENT_SPEED
            this.controls.rollSpeed =  CONTROLS_ROLL_SPEED
            this.controls.minDistance = CONTROLS_MIN_DISTANCE
            this.controls.maxDistance = CONTROLS_MAX_DISTANCE
        }
        if (type ===  "firstPerson") {
            this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
            this.controls.movementSpeed = CONTROLS_MOVEMENT_SPEED
            this.controls.rollSpeed =  CONTROLS_ROLL_SPEED
            this.controls.lookSpeed = CONTROLS_LOOK_SPEED
            this.controls.minDistance = CONTROLS_MIN_DISTANCE
            this.controls.maxDistance = CONTROLS_MAX_DISTANCE
            this.controls.autoForward = false
            this.controls.dragToLook = true
            this.controls.heightMin = 0.025
        }
        if (type ===  "fly") {
            this.controls = new FlyControls(this.camera, this.renderer.domElement);
            this.controls.movementSpeed = CONTROLS_MOVEMENT_SPEED
            this.controls.rollSpeed =  CONTROLS_ROLL_SPEED
            this.controls.minDistance = CONTROLS_MIN_DISTANCE
            this.controls.maxDistance = CONTROLS_MAX_DISTANCE
        }
        if (type ===  "orbit") {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.movementSpeed = CONTROLS_MOVEMENT_SPEED
            this.controls.rollSpeed =  CONTROLS_ROLL_SPEED
            this.controls.minDistance = CONTROLS_MIN_DISTANCE
            this.controls.maxDistance = CONTROLS_MAX_DISTANCE
        }

        this.controls.addEventListener( 'change', this._on_rerender );

        this.rerender()
    }
    _on_rerender = () => {
        if (!this.loop.animation.played)
            this.rerender()
    }
    _dragging_changed_transform = (event) => {
        this.controls.enabled = ! event.value;
    }

    updateCache() {
        this.cachedObjects.clear()

        this._recursiveScan(this.camera)
        this._recursiveScan(this.scene)
        const project = {
            autoClear: null,
            sizeWidth: null,
            sizeHeight: null,
            alpha: null,
            premultipliedAlpha: null,
            antialias: null,
            stencil: null,
            preserveDrawingBuffer: null,
            failIfMajorPerformanceCaveat: null,
            depth: null,
            logarithmicDepthBuffer: null,
            reversedDepthBuffer: null,
            precision: null,
            powerPreference: null,
        }
    }

    get camera () {return this.controller.camera}
    get scene () {return this.controller.scene}
    get objects () {return [...this.cachedObjects]}

    toJSON () {
        this.updateCache()
        const project = this.controller?.project?.toJSON?.() ?? {}
        project.renders = this.controller.getRendererParameters()
        project.name = this.controller.scene?.name?.length > 0 ? this.controller.scene.name : `Scene (${Dateme.formatDate('yy.m.d hh-ii-ss')})`
        return {
            scene: this.controller.scene.toJSON(),
            camera: this.controller.camera.toJSON(),
            environment: this.controller?.environment?.toJSON?.(),
            history: this.controller?.history?.toJSON?.(),
            metadata: this.controller?.metadata?.toJSON?.(),
            scripts: this.controller?.scripts?.toJSON?.(),
            project: project,
        };
    }
    each (cb){this.objects.forEach(node => cb(node))}
    find (cb){ return this.objects.find(node => cb(node))}
    findBy (propertyName, propertyValue){return this.find(item => item[propertyName] === propertyValue)}

}