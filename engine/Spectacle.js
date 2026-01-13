import {ICommander} from "./ICommander.js";
import {Camera} from "./canvas2d/Camera.js";
import {LayerManager} from "./LayerManager.js";
import {Doom} from "./utils/Doom.js";
import {Actor} from "./canvas2d/Actor.js";
import {Graphic} from "./canvas2d/Graphic.js";
import {Ut} from "./Ut.js";
import {TheaterManager} from "./TheaterManager.js";
import {SpectacleFocusMouseManager} from "./SpectacleFocusMouseManager.js";


const SpectacleState = {
    zoom: 1,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    quality: false,
    running: false,
    time: 0,
    quadrantX: 0,
    quadrantY: 0,
    sectorX: 0,
    sectorY: 0,
    localX: 0,
    localY: 0,
    actors: 0,
    // wheel: 0,
    mouse: {}, // todo ?
};


/**
 * Events published in CockpitSpectaclesConfigure:
 *  `spectacle:focusin`
 *  `spectacle:focusin:${payload.name}`
 *  `spectacle:focusout`
 *  `spectacle:focusout:${payload.name}`
 *
 * Events:
 *  `spectacle:created`
 *  `spectacle:added:${name}`
 *
 *
 * register.eventBus.subscribe(`spectacle:created`, ({spectacle}) => {} );
 *
 * this.register.eventBus.subscribe(`spectacle:created`, (payload) => {
 *     console.log(`spectacle:created`, payload)
 * })
 * this.register.eventBus.subscribe(`spectacle:added:${SCENE_DN7_MAP}`, (payload) => {
 *     console.log(`spectacle:added:${SCENE_DN7_MAP}`, payload)
 * })
 *
 * Important State mutations:
 *
 *
 * ```
 * spectacle = new DemoSpectacle(register, {
 *      name: 'uniqueKeyName',
 *      width: 1000,
 *      height: 1000,
 *      width: 1000,
 *
 *      eventsOn: true,
 *      onlyfocus: false,
 *      draggableOn: true,
 *      scalingOn: true,
 * })
 * theater
 *
 * // access to Canvas 2D Context
 * spectacle.layerman.ui.ctx
 * spectacle.layerman.game.ctx
 * spectacle.layerman.bg.ctx
 *
 * // work with actors
 * spectacle.addActor(actor)
 * spectacle.removeActor(actor)
 * spectacle.clear()
 * each(callback)
 * getByEid(id)
 *
 *
 * ```
 */
export class Spectacle extends ICommander {

    constructor(register, props = {}) {
        super(register)
        this.props = props;

        this.name = props?.name || this.name || this.constructor.name;
        this.updatable = props?.updatable ?? true;
        this.drawable = props?.drawable ?? true;
        this.skipFrame = props?.skipFrame ?? 0;
        // this.detailLevel = 0; // todo ?
        this.character = null; // todo ?
        this.actors = new Set();
        this.unregistered = new Set();
        this.unregisteredDraw = new Set();
        this.eventBus = props?.eventBus ?? register.eventBus;
        this.camera = new Camera();
        this.layerman = new LayerManager(register);

        // this.sectorSize = props?.sectorSize ?? 1000;
        // this.quadrantSize = props?.quadrantSize ?? 1000;
        //
        this.mouseman = new SpectacleFocusMouseManager(register);

        this._config = {
            ...{
                x: props?.x || 0,
                y: props?.y || 0,
                sectorSize: props?.sectorSize ?? 1000,
                quadrantSize: props?.quadrantSize ?? 1000,

                eventsOn: props?.eventsOn ?? true,
                draggableOn: props?.draggableOn ?? true,
                scalingOn: props?.scalingOn ?? true,
                onlyfocus: props?.onlyfocus ?? false,

                quality: register.config?.quality || false,
                width: register.config?.width || window.innerWidth,
                height: register.config?.height || window.innerHeight,
                fieldHeight: register.config.fieldHeight || 10000,
                fieldWidth: register.config.fieldWidth || 10000,
                margin: register.config.cameraMargin || 1000,
                cameraSpeed: register.config.cameraSpeed || 10,
                timeScale: register.config?.timeScale || 1,
                zoom: register.config.zoom || 1,
                zoomMin: register.config.zoomMin || 0.1,
                zoomMax: register.config.zoomMax || 3,
            }, ...props
        };

        if (!(this.register?.theater instanceof TheaterManager)) {
            return console.warn(`Dependence Error.{register.theater} is not of type TheaterManager. "register.theater" Required type {TheaterManager}`);
        }

        //
        // append to TheaterManager
        //
        this.register.theater.spectacles.set(this.name, this);

        this.eventBus.publish(`spectacle:created`, {name: this.name, data: this, spectacle: this});
    }

    get theater() {
        return this.register.theater;
    }

    /**
     * ```
     * this.register.theater.globalSpectacle.getByEid(eid);
     * ```
     * @param eid
     * @returns {*|null}
     */

    getByEid(eid) {
        if (this._cacheid && this._cacheid.eid === eid) return this._cacheid;
        let act = Array.from(this.actors).filter(obj=>obj.eid === eid);
        this._cacheid = act ? act[0] : null;
        return this._cacheid;
    }

    onupdate(callback){
        if (typeof callback !== 'function')
            return console.warn(`Error: accepts type "function" for parameter "callback".`);

        this.unregistered.add(callback);
    }

    ondraw(callback){
        if (typeof callback !== 'function')
            return console.warn(`Error: accepts type "function" for parameter "callback".`);

        this.unregisteredDraw.add(callback);
    }

    /**
     * register.state.theater.spectacles[NAME] === this.stateSpectacle
     * ```
     * this.stateSpectacle.running = ture
     * // ro:
     * this.register.state.theater.spectacles[this.name].running = ture
     * // listener:
     * this.register.state.on(`theater.spectacles.${this.name}`, () => {});
     * // or:
     * this.onStateSpectacle(`running`, (value) => {});
     * ```
     */
    get stateSpectacle() {
        return this.register.state.theater.spectacles[this.name]
    }

    /**
     * ```
     * this.onStateSpectacle(`running`, (value) => {});
     * ```
     */
    onStateSpectacle(path, cb) {
        return this.register.state.on(`theater.spectacles.${this.name}.${path}`, (v) => cb(v));
    }

    /**
     * Complex configured for
     *   LayerManager
     *   Camera
     *   SpectacleFocusMouseManager
     *
     * Method created Layers ['bg', 'game', 'ui'] and configured LayerManager. Global `register.layerman`
     *
     * ```
     * this.configured({
     *      width: config.width,
     *      height: config.height,
     *      quality: config.quality,
     *      parent: parent,
     *      onlyfocus: true,
     * });
     * ```
     */
    configured(config = {}) {
        if (!this.name) {
            console.warn(`{GameSpectacle} {ERROR} "props.name" has a required "String" type`)
            return;
        }

        if (this.isConfigured) {
            console.warn(`{Error} repeat method call "GameSpectacle.configured" `);
            return;
        }

        this.parent = config?.parent;

        const register = this.register;
        const layerman = this.layerman;
        const camera = this.camera;

        // todo make save to state
        const comconfig = this._config = {...this._config, ...config};

        this.width = comconfig.width;
        this.height = comconfig.height;

        layerman.configured({
            parent: Doom.create('span'),
            width: comconfig.width,
            height: comconfig.height,
            quality: comconfig.quality,
            canvases: ['bg', 'game', 'ui'],
        });

        layerman.game = layerman.get('game');
        layerman.ui = layerman.get('ui');
        layerman.bg = layerman.get('bg');

        this._gamectx = layerman.get('game').ctx;
        this._uictx = layerman.get('ui').ctx;
        this._bgctx = layerman.get('bg').ctx;

        this.gfxStyle = Ut.clone(Graphic.StyleDefault);
        this.gfxStyle.imageSmoothingEnabled = this._gamectx.imageSmoothingEnabled

        this._gamectxGraphic = layerman.game.gfx =  new Graphic(this._gamectx , this.gfxStyle);
        this._uictxGraphic = layerman.ui.gfx =  new Graphic(this._uictx , this.gfxStyle);
        this._bgctxGraphic = layerman.bg.gfx =  new Graphic(this._bgctx , this.gfxStyle);

        //
        // {Camera}
        // camera state stateSpectacle consist
        //
        //
        camera.configured({
            x: comconfig.x,
            y: comconfig.y,
            width: comconfig.width,
            height: comconfig.height,
            zoom: comconfig.zoom,
            fieldHeight: comconfig.fieldHeight,
            fieldWidth: comconfig.fieldWidth,
            margin: comconfig.margin,
            cameraSpeed: comconfig.cameraSpeed,
            zoomMin: comconfig.zoomMin,
            zoomMax: comconfig.zoomMax,
            draggable: true,
        });

        //
        // {MouseManager}
        // eventsOn scalingOn draggableOn
        //
        this.mouseman.configured({
            spectacle: this,
            eventsOn: comconfig.eventsOn,
            onlyfocus: comconfig.onlyfocus,
            scalingOn: comconfig.scalingOn,
            draggableOn: comconfig.draggableOn,
            draggableButton: 'right',
            // infocus: null,
            // outfocus: null,
        })
        this.mouseman.setup()


        //
        // added Spectacles properties to `register.state.theater.spectacles[SCENE_NAME]`
        //
        //
        //
        if (!this.register.state?.theater?.spectacles)
            this.register.state.theater.spectacles = {};

        this.register.state.theater.spectacles[this.name] = {
            ...SpectacleState, ...{
                zoom: comconfig.zoom,
                x: comconfig.x,
                y: comconfig.y,
                width: comconfig.width,
                height: comconfig.height,
            }
        };

        this.isConfigured = true;
        this.register.theater.spectacles.set(this.name, this);

        this.eventBus.publish(`spectacle:added:${this.name}`, {name: this.name, data: this, spectacle: this});
        this.eventBus.publish(`spectacle:added:${this.constructor.name}`, {name: this.name, data: this, spectacle: this});
    }

    addActor(value) {
        if (!(value instanceof Actor)) {
            console.warn(`addActor "value" is not type of Actor`)
            return;
        }
        value.spectacle = this;

        this.actors.add(value);
        this.actors = new Set([...this.actors].sort((a, b) => a.deep - b.deep));

        this.stateSpectacle.actors = this.actors.size;

        if (!this.register.state.theater.actors) this.register.state.theater.actors = 1;
        else this.register.state.theater.actors ++;
    }

    removeActor(key) {
        if (this.actors.has(key))
            return this.actors.delete(key);
    }
    clear() {
        return this.actors.clear()
    }

    destroy() {
        this.register.theater.spectacles.delete(this.name);
        this.register.theater.spectacles.delete(this.constructor.name);
        this.actors = new Set();
        super.destroy();
    }

    each(callback) {
        this.actors.forEach(callback);
    }

    update(delta, iterator) {

        if (this.skipFrame && iterator % this.skipFrame !== 0) return;  // todo for tests

        const camera = this.camera;

        this.actors.forEach((actor) => {
            if (!actor.updatable) return;
            actor.update(delta, camera, iterator);
        });

        this.unregistered.forEach((cb) => cb(delta, camera, iterator));  // todo for tests
    }

    draw(delta, iterator) {

        if (this.skipFrame && iterator % this.skipFrame !== 0) return;  // todo for tests

        const gamectx = this._gamectx;
        const gamectxGraphic = this._gamectxGraphic;
        const camera = this.camera;

        gamectx.clearRect(0, 0, this.width, this.height);

        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - Transform
        camera.applyTransform(gamectx);

        this.actors.forEach((actor) => {
            if (!actor.drawable) return;
            actor.draw(gamectx, camera, iterator, gamectxGraphic);
        });

        this.unregisteredDraw.forEach((cb) => cb(gamectx, camera, iterator, gamectxGraphic));  // todo for tests


        camera.resetTransform(gamectx);
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - End Transform

        if (!this._rendered) {
            this._rendered = true;
            this.eventBus.publish(`spectacle:rendered:${this.name}`, {name: this.name, data: this, spectacle: this});
        }
    }

    resume() {
        this.updatable = true;
        this.drawable = true;
        this.stateSpectacle.running = true;
    }

    pause() {
        this.updatable = false;
        this.drawable = false;
        this.stateSpectacle.running = false;
    }

    detach(parent) {
        parent = parent || this.parent;
        this.layerman.detach(parent)
    }

    attach(parent) {
        parent = parent || this.parent;
        parent.style.position = 'absolute';
        this.layerman.attach(parent)
    }

    setZoom(zoom) {
        this.stateSpectacle.zoom = this.camera.setZoom(zoom);
    }

    zoomIn(factor = 1.05) {
        this.stateSpectacle.zoom = this.camera.zoomIn(factor);
    }

    zoomOut(factor = 1.05) {
        this.stateSpectacle.zoom = this.camera.zoomOut(factor);
    }

    cameraTo(x, y) {
        this.camera.moveTo(x, y);

        this.stateSpectacle.x = x;
        this.stateSpectacle.y = y;

        const coord = this.toSectorCoords(x, y);

        Object.keys(coord).forEach(ck => {
            if (this.stateSpectacle[ck] !== coord[ck]) this.stateSpectacle[ck] = coord[ck]
        });
    }

    // Use in time event mousewheel
    // Dynamic re-calc camera margin, requiring for zoom
    cameraMargin(dist = 1000) {
        const marginZoomed = dist /  this.camera.zoom;
        if ( this.camera.margin !== marginZoomed) {
            this.camera.margin = marginZoomed
        }
    }

    /**
     * Converts local coordinates in a sector back to global coordinates
     *
     * @param {Object} coords - sector coordinates and local coordinates
     * @param {number} coords.sectorX - sector coordinate by X
     * @param {number} coords.sectorY - Y coordinate of the sector
     * @param {number} coords.localX - local coordinate in the sector along the X axis
     * @param {number} coords.localY - local coordinate in the sector along the Y axis
     * @returns {Object} глобальні координати { x, y }
     */
    fromSectorCoords(coords) {
        const { sectorX, sectorY, localX, localY } = coords;

        const x = sectorX * this._config.sectorSize + localX;
        const y = sectorY * this._config.sectorSize + localY;

        return { x, y };
    }

    /**
     * Converts global coordinates to:
     *
     * - sector coordinates (sectorX, sectorY),
     * - local coordinates in a sector (localX, localY),
     * - supra-sector coordinates of a quadrant (quadrantX, quadrantY)
     *
     * this._config.sectorSize
     * this._config.quadrantSize
     */
    toSectorCoords(globalX, globalY) {
        const sectorSize = this._config.sectorSize;
        const quadrantSize = this._config.quadrantSize;

        // 1. calculate the coordinates of the sector
        const sectorX = Math.floor(globalX / sectorSize);
        const sectorY = Math.floor(globalY / sectorSize);

        // 2. calculate the local coordinates in the middle of the sector
        // (add SECTOR_SIZE to avoid negative values, then take the modulus)
        const localX = ((globalX % sectorSize) + sectorSize) % sectorSize;
        const localY = ((globalY % sectorSize) + sectorSize) % sectorSize;

        // 3. calculate the quadrant coordinates
        const quadrantX = Math.floor(sectorX / quadrantSize);
        const quadrantY = Math.floor(sectorY / quadrantSize);

        return {
            quadrantX,
            quadrantY,
            sectorX,
            sectorY,
            localX,
            localY
        };
    }
}

