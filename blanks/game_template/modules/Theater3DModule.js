import {Module} from "engine/Module.js";
import {Reactive} from "engine/Reactive.js";
import * as THREE from "three";
import {AnimationLoop} from "engine/AnimationLoop.js";
import {LoopKeeper} from "engine/LoopKeeper.js";
import {Dateme} from "engine/utils/Dateme.js";



export class SceneKeeper {
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


export class Theater3DModule extends Module {

    setup() {

        this.updatable = false;
        this.type = 'rerender'
        this.reactive = new Reactive({
            updated: null,
            loaded: null,
            selectedTargetId: null,
        })
        this.state = this.reactive.state;
        this.loader = new THREE.ObjectLoader();
        this.scenes = new SceneKeeper();

        /** @type {THREE.WebGLRenderer}*/
        this.renderer = null
        /** @type {THREE.Scene}*/
        this.scene = null
        /** @type {THREE.Object3D|THREE.Camera|THREE.PerspectiveCamera|THREE.OrthographicCamera}*/
        this.camera = null
        this.project = null
        this.environment = null
        this.history = null
        this.metadata = null
        this.scripts = null
        this.root = this.props?.root ?? this.register.rootScreenElement

        // Basic Controls Cameras
        const conf = {...{
            skipFrame: 0,
            fps: 60,
            fov: 50,
            aspect: window.innerWidth / window.innerHeight,
            near: 0.01,
            far: 1000,
            frustumSize: 5,
        }, ...this.register.config}

        this.cameraPerspective = new THREE.PerspectiveCamera( conf.fov, conf.aspect,  conf.near,  conf.far );
        this.cameraOrthographic = new THREE.OrthographicCamera( - conf.frustumSize * conf.aspect, conf.frustumSize * conf.aspect, conf.frustumSize, - conf.frustumSize,  conf.near,  conf.far);

        // alt Loop manager
        this.loopKeeper = new LoopKeeper(this.register, conf)

        if (this.props?.autoUpdate === true) {

            this.loopKeeper.onUpdate((delta) => {

                this.update(delta)

            })
        }
    }




    /**
     * ```
     *
     * renderer = createWebGLRenderer ({
     *     sizeWidth: window.innerWidth,
     *     sizeHeight: window.innerHeight,
     *     alpha: false,
     *     premultipliedAlpha: true,
     *     antialias: true,
     *     stencil: true,
     *     preserveDrawingBuffer: true,
     *     failIfMajorPerformanceCaveat: true,
     *     depth: true,
     *     logarithmicDepthBuffer: false,
     *     reversedDepthBuffer: true,
     *     precision: "lowp",
     *     powerPreference: "default",
     *
     *     canvas
     *     context
     *     pixelRatio
     *     sortObjects
     *     shadowMap.enabled
     *     shadowMap.type
     *     toneMappingExposure
     * })
     *
     *
     * renderer.setClearAlpha(0)
     *
     * ```
     */
    createWebGLRenderer (project) {
        let parameters = {
            sizeWidth: project?.sizeWidth ?? window.innerWidth,
            sizeHeight: project?.sizeHeight ?? window.innerHeight,
            alpha: project?.alpha ?? false,
            premultipliedAlpha: project?.premultipliedAlpha ?? true,
            antialias: project?.antialias ?? true,
            stencil: project?.stencil ?? true,
            preserveDrawingBuffer: project?.preserveDrawingBuffer ?? true,
            failIfMajorPerformanceCaveat: project?.failIfMajorPerformanceCaveat ?? true,
            depth: project?.depth ?? true,
            logarithmicDepthBuffer: project?.logarithmicDepthBuffer ?? false,
            reversedDepthBuffer: project?.reversedDepthBuffer ?? true,
            precision: project?.precision ?? "lowp",
            powerPreference: project?.powerPreference ?? "default",
        }

        if (project?.canvas) parameters.canvas = project.canvas;
        if (project?.context) parameters.context = project.context;
        /** @type {THREE.WebGLRenderer}*/
        this.renderer = new THREE.WebGLRenderer(parameters);
        this.rendererParameters = parameters

        this.renderer.setSize(parameters.sizeWidth, parameters.sizeHeight);
        this.renderer.setPixelRatio(project?.pixelRatio ?? window.devicePixelRatio);
        this.renderer.autoClear = parameters?.autoClear ?? true
        this.renderer.shadowMap.enabled = project?.shadowMap?.enabled ?? true
        this.renderer.shadowMap.type = project?.shadowMap?.type ?? THREE.PCFShadowMap;
        this.renderer.toneMapping = project?.toneMapping ?? THREE.NoToneMapping ;
        this.renderer.toneMappingExposure = project?.toneMappingExposure ?? 1;
        this.renderer.sortObjects = project?.sortObjects ??  false;

        this.root.textContent = ''
        this.root.appendChild( this.renderer.domElement );

        return this.renderer;
    }

    /** @return {void | THREE.Camera | THREE.PerspectiveCamera} */
    setCameraPerspective(){
        this.cameraPerspective.position.x = 0
        this.cameraPerspective.position.y = 0
        this.cameraPerspective.position.z = 0
        this.cameraPerspective.updateMatrixWorld()
        return this.setCamera(this.cameraPerspective)
    }
    /** @return {void | THREE.Camera | THREE.PerspectiveCamera} */
    setCamera (/**@type {THREE.Camera | THREE.PerspectiveCamera} */ camera) {
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

            if (!this.scenes.scenes.has(scene.name))
                this.scenes.add(scene.name, scene)

            this.scenes.activeSceneId = scene.name

            this.scene = scene;
        } else {
            console.warn(`Not changed! setScene (scene). is use current instance`)
        }

        this.cachedObjects = new Set()
        return this.scene
    }


    /** @return {AnimationLoop} */
    get animation () {
        return this.loopKeeper.animation
    }


    setupJSON({scene, camera, environment, history, metadata, project, scripts}) {
       this.createWebGLRenderer({...{
                alpha: true,
            }, ...project})

        this.setScene((scene?.isObject3D && scene instanceof THREE.Scene) ? scene : this.loader.parse(scene))

        this.cameraPerspective = this.loader.parse(camera)
        this.setCamera(this.cameraPerspective)

        this.updateCache()

        this.state.loaded =  (new Date).getTime()
        this.state.updated =  (new Date).getTime()

        this.render()
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

    updateCache() {
        this.cachedObjects.clear()
        this._recursiveScan(this.camera)
        this._recursiveScan(this.scene)
    }

    update () {
        if (!this.renderer || !this.scene || !this.camera) return;

        this.render()
    }

    render () {
        this.renderer.render(this.scene, this.camera)
    }






    append (targetObject3D) {
        this.appendTo(targetObject3D, this.scene);
    }

    /**
     *
     * @param targetObject3D {Object3D}
     * @param parentObject3D {Object3D}
     */
    appendTo (targetObject3D, parentObject3D) {
        if (!parentObject3D?.isObject3D || !targetObject3D?.isObject3D) return console.warn(`Parameters is not types of Object3D. Deprecated append to root`)

        if (parentObject3D.children.includes(targetObject3D)) return console.warn(`Parent Object3D is consists the target Object3D`)

        parentObject3D.add(targetObject3D)
        targetObject3D.parentId = parentObject3D.id
        targetObject3D.isHidden = false

        this.updateCache()
        this.state.updated = (new Date).getTime()
    }

    replaceObject (targetObject3D, parentObject3D) {

        targetObject3D.removeFromParent()

        parentObject3D.add(targetObject3D)

        targetObject3D.parentId = parentObject3D.id

        this.updateCache();

        this.state.updated =  (new Date).getTime()
    }


    selectTarget(object) {
        this.lastSelectedTargetObject3D = object
        this.state.selectedTargetId = object.id
    }
    clearTarget() {
        this.lastSelectedTargetObject3D = null
        this.state.selectedTargetId = null
    }
    lastSelectedTargetObject3D = null;



    cloneObject(object) {
        if (this.lastSelectedTargetObject3D === object)
            this.clearTarget()

        object.children.forEach(ch => { if(ch.isHidden) ch.removeFromParent() })

        return object.clone()
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

    get objects () {
        return [...this.cachedObjects];
    }

    toJSON() {
        this.updateCache()
        return {
            scene: this.scene?.toJSON?.(),
            camera: this.camera?.toJSON?.(),
            environment: this.environment?.toJSON?.(),
            history: this.history?.toJSON?.(),
            metadata: this.metadata?.toJSON?.(),
            project: this.project?.toJSON?.(),
            scripts: this.scripts?.toJSON?.(),
        }
    }

    each(cb) {
        this.updateCache();
        this.objects.forEach(node => cb(node))
    }

    find(cb) {
        this.updateCache();
        return this.objects.find(node => cb(node))
    }

    findBy(propertyName, propertyValue) {return this.find(item => item[propertyName] === propertyValue)}
}