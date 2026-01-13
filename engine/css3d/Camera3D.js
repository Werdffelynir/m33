import {Matrix3D} from "./Matrix3D.js";

import {Node3D} from "./Node3D.js";


const def = (v, d) => v !== undefined ? v : d;


/**
 * ```
 * camera = new Camera3D( {
 *      // ... Node3D props
 *      inverted: true,
 *      top: 0,
 *      left: 0,
 *      width: 0,
 *      height: 0,
 *      parent: null,
 * } )
 * ```
 */
export class Camera3D extends Node3D {

    constructor(props) {
        super(props);
        this.inverted = def(props?.inverted, true)
        this.offsetX = def(props?.offsetX, null)
        this.offsetY = def(props?.offsetY, null)
        this.order = props?.order ?? "srt";
        this.rotateOrder = props?.rotateOrder ?? "xyz";

        /**@type {Scene3D|Node3D} */
        this.parentId = def(props?.parentId, null)
        this.parent = def(props?.parent, null)

        this.element.style.transformStyle = 'preserve-3d';
        this.element.style.willChange = 'transform';
        this.element.style.position = 'absolute'
        this.element.style.overflow = 'visible'; // hidden or visible
        this.element.style.position = 'relative'; // relative or absolute
        this.element.style.left = '1%';
        this.element.style.top = '1%';
        this.element.style.width = '98%';
        this.element.style.height = '98%';


        this._needsUpdate = true;
        // this.updateCameraStyle()
        this.updateStyle()
    }
    addChild(node) {
        return this.addNode(node)
    }

    addNode(node) {
        if (!(node instanceof Node3D)) {
            return console.warn(`Node3D ${JSON.stringify(node)} is not supported`);
        }
        node.element.classList.add('Node3D')
        node.parent = this;
        node.parentId = this.id;
        super.addChild(node)
        this._needsUpdate = true;
    }
    // updateCameraStyle() {
    //     this.updateStyle();
    //     // if (this.offsetX !== null) this.element.style.left = this.offsetX + "px";
    //     // if (this.offsetY !== null) this.element.style.top = this.offsetY + "px";
    //     // if (this.width !== null) this.element.style.width = this.width + "px";
    //     // if (this.height !== null) this.element.style.height = this.height + "px";
    //     this._needsUpdate = true;
    // }

    reset33() {
        this.x = 0
        this.y = 0
        this.z = 0
        this.rx = 0
        this.ry = 0
        this.rz = 0
        this.sx = 1
        this.sy = 1
        this.sz = 1
        this.vx = 0
        this.vy = 0
        this.vz = 0
        this.vrx = 0
        this.vry = 0
        this.vrz = 0
        this.vsx = 0
        this.vsy = 0
        this.vsz = 0
    }
    reset() {
        super.reset()
    }

    update() {
        this.updateCamera()
    }

    toCSS1() {

        if (this.centred) {
            this._transformCSS = `
            translate3d(${-this.x}px, ${-this.y}px, ${-this.z}px)
            rotateX(${-this.rx}deg)
            rotateY(${-this.ry}deg)
            rotateZ(${-this.rz}deg)
            scale3d(${this.sx}, ${this.sy}, ${this.sz})
            `;
        } else
        if (this.inverted) {
            this._transformCSS = `
            scale3d(${this.sx}, ${this.sy}, ${this.sz})
            rotateX(${-this.rx}rad)
            rotateY(${-this.ry}rad)
            rotateZ(${-this.rz}rad)
            translate3d(${-this.x}px, ${-this.y}px, ${-this.z}px)
            `;
        } else {
            this._transformCSS = `
            scale3d(${this.sx}, ${this.sy}, ${this.sz})
            rotateX(${this.rx}rad)
            rotateY(${this.ry}rad)
            rotateZ(${this.rz}rad)
            translate3d(${this.x}px, ${this.y}px, ${this.z}px)
        `
        }

        return this._transformCSS
    }

    toCSS2() {
        const classic = {
            translate: `translate3d(${this.x}px, ${this.y}px, ${this.z}px) `,
            rotate: `
            rotateX(${this.rx}deg)
            rotateY(${this.ry}deg)
            rotateZ(${this.rz}deg)
            `,
            scale:  `scale3d(${this.sx}, ${this.sy}, ${this.sz}) `,
        }
        const invert = {
            translate: `translate3d(${-this.x}px, ${-this.y}px, ${-this.z}px) `,
            rotate: `
            rotateX(${-this.rx}deg)
            rotateY(${-this.ry}deg)
            rotateZ(${-this.rz}deg)
            `,
            scale:  `scale3d(${this.sx}, ${this.sy}, ${this.sz}) `,
        }

        const transMap = {
            direct: classic.scale + classic.rotate + classic.translate,
            centred: classic.translate + classic.rotate + classic.scale,
            directInverted: invert.scale + invert.rotate + invert.translate,
            centredInverted: invert.translate + invert.rotate + invert.scale,
        }


        if(this.inverted) {
            return `
            translate3d(${-this.x}px, ${-this.y}px, ${-this.z}px)
            rotateX(${-this.rx}deg)
            rotateY(${-this.ry}deg)
            rotateZ(${-this.rz}deg)
            scale3d(${this.sx}, ${this.sy}, ${this.sz})
        `;
        }

        return `
            scale3d(${this.sx}, ${this.sy}, ${this.sz})
            rotateX(${this.rx}deg)
            rotateY(${this.ry}deg)
            rotateZ(${this.rz}deg)
            translate3d(${this.x}px, ${this.y}px, ${this.z}px)
        `;
    }

    updateCamera() {
        if (!this._needsUpdate) return

        this.element.style.transform = this.toCSS();
        super.update();

        this._needsUpdate = false;
    }

    lookAt(target) {

        // target can be a Node3D or any object with position {x, y, z}
        const tx = target.x;
        const ty = target.y;
        const tz = target.z;

        // Direction vector from camera to target
        const dx = tx - this.x;
        const dy = ty - this.y;
        const dz = tz - this.z;

        // Calc yaw (rot axis Y) and pitch (rot axis around X)
        this.ry = Math.atan2(-dx, -dz);                // yaw
        const distanceXZ = Math.sqrt(dx * dx + dz * dz);
        this.rx = Math.atan2(dy, distanceXZ);      // pitch
        this.rz = 0;                               // roll to 0

        this._needsUpdate = true;

        return this;
    }


    // The camera is fixed on the object
    lookAtTarget(target) {
        const tx = target.x;
        const ty = target.y;
        const tz = target.z;

        const dx = tx - this.x;
        const dy = ty - this.y;
        const dz = tz - this.z;

        const distXZ = Math.hypot(dx, dz);

        // yaw — горизонтальний поворот (навколо Y)
        this.ry = Math.atan2(dx, dz);

        // pitch — вертикальний нахил (навколо X)
        this.rx = Math.atan2(-dy, distXZ);

        this.rz = 0;

        if (!isFinite(this.rx)) this.rx = 0;
        if (!isFinite(this.ry)) this.ry = 0;

        this._needsUpdate = true;
        if (typeof this.updateCamera === "function") this.updateCamera();

        return this;
    }


// Object is always facing the camera
    targetLookAtCamera(camera) {
        const cx = camera.x;
        const cy = camera.y;
        const cz = camera.z;

        const dx = cx - this.x;
        const dy = cy - this.y;
        const dz = cz - this.z;

        const distXZ = Math.hypot(dx, dz);

        // yaw — оберт навколо Y, щоб "обличчя" дивилось на камеру
        this.ry = Math.atan2(-dx, -dz);

        // pitch — нахил вгору/вниз до камери
        this.rx = Math.atan2(dy, distXZ);

        this.rz = 0;

        if (!isFinite(this.rx)) this.rx = 0;
        if (!isFinite(this.ry)) this.ry = 0;

        this._needsUpdate = true;
        if (typeof this._updateTransform === "function") this._updateTransform();

        return this;
    }


    _animateTo(params, duration){}
    _attachOrbitControls(domElement){}
    _enableParallax(depth){}
}






/**
 * | Категорія       | Приклад методу            | Призначення                     |
 * | --------------- | ------------------------- | ------------------------------- |
 * | **Позиція**     | `setPosition(x, y, z)`    | Рух у просторі                  |
 * | **Орієнтація**  | `setRotation(rx, ry, rz)` | Обертання                       |
 * | **Перспектива** | `setPerspective(800)`     | Глибина сцени                   |
 * | **Походження**  | `setOrigin('40%', '60%')` | Точка зору                      |
 * | **Зум**         | `setZoom(1.2)`            | Масштаб                         |
 * | **Фокусування** | `lookAt(node)`            | Погляд на об’єкт                |
 * | **Анімація**    | `animateTo({...}, 500)`   | Плавна зміна параметрів         |
 * | **Паралакс**    | `enableParallax(depth)`   | Ілюзія глибини при русі курсора |
 *
 */
export class Camera3DMatrix {
    constructor(element) {
        this.element = element;
        this.matrix = new Matrix3D();
        this.overflow = true;
        this.absolute = true;
        this.rotation = {x: 0, y: 0, z: 0};
        this.position = {x: 0, y: 0, z: 0};
        this.scale = {x: 1, y: 1, z: 1};

        this._needsUpdate = true;
        this._updateStyle();
    }

    _updateStyle() {
        const {x, y, z} = this.position;
        const {x: rx, y: ry, z: rz} = this.rotation;
        const {x: sx, y: sy, z: sz} = this.scale;

        this.element.style.overflow = this.overflow ? 'visible' : 'hidden';
        this.element.style.willChange = 'transform';
        this.element.style.position = this.absolute ? 'absolute' : 'relative';

        this.element.style.transform = `
          translate3d(${x}px, ${y}px, ${z}px)
          rotateX(${rx}deg)
          rotateY(${ry}deg)
          rotateZ(${rz}deg)
          scale3d(${sx}, ${sy}, ${sz})
        `;
        this.element.style.transformStyle = "preserve-3d";

        this._needsUpdate = true;
    }

    setPosition(x, y, z) {
        Object.assign(this.position, {x, y, z});

        this._needsUpdate = true;
        this._updateTransform();
        return this;
    }

    setRotation(rx, ry, rz) {
        Object.assign(this.rotation, {x: rx, y: ry, z: rz});

        this._needsUpdate = true;
        this._updateTransform();
        return this;
    }

    setScale(sx, sy, sz) {
        Object.assign(this.scale, {x: sx, y: sy, z: sz});

        this._needsUpdate = true;
        this._updateTransform();
        return this;
    }

    setZoom(zoom) {
        Object.assign(this.scale, {x: zoom, y: zoom, z: zoom});

        this._needsUpdate = true;
        this._updateTransform();
        return this;
    }

    update(dirtyUpdate = false) {
        if (dirtyUpdate)
            this._needsUpdate = true;

        this._updateTransform();
    }

    _updateTransform() {
        if (!this._needsUpdate) return;
        const {x, y, z} = this.position;
        const {x: rx, y: ry, z: rz} = this.rotation;
        const {x: sx, y: sy, z: sz} = this.scale;

        this.matrix.identity()
            .rotateY(ry)
            .rotateX(-rx)
            .rotateZ(rz)
            .translate(-x, -y, -z)
            .scale(sx, sy, sz);

        this.element.style.transform = this.matrix.toCSS();

        this._needsUpdate = false;
    }

    reset() {
        this.rotation = {x: 0, y: 0, z: 0};
        this.position = {x: 0, y: 0, z: 0};
        this.scale = {x: 1, y: 1, z: 1};
        this._updateTransform();
        return this;
    }


    moveTo(x, y, z) {
        this.matrix.identity().translate(x, y, z);
        this.position = {x, y, z};
        return this;
    }

    get x() {
        return this.position.x;
    }

    set x(v) {
        this.moveTo(v, this.y, this.z);
    }

    get y() {
        return this.position.y;
    }

    set y(v) {
        this.moveTo(this.x, v, this.z);
    }

    get z() {
        return this.position.z;
    }

    set z(v) {
        this.moveTo(this.x, this.y, v);
    }

    rotateTo(rx, ry, rz) {
        this.matrix.identity();
        this.matrix.rotateX(rx * Math.PI / 180);
        this.matrix.rotateY(ry * Math.PI / 180);
        this.matrix.rotateZ(rz * Math.PI / 180);
        this.rotation = {x: rx, y: ry, z: rz};
        return this;
    }

    get rx() {
        return this.rotation.x;
    }

    set rx(v) {
        this.rotateTo(v, this.rotation.y, this.rotation.z);
    }

    get ry() {
        return this.rotation.y;
    }

    set ry(v) {
        this.rotateTo(this.rotation.x, v, this.rotation.z);
    }

    get rz() {
        return this.rotation.z;
    }

    set rz(v) {
        this.rotateTo(this.rotation.x, this.rotation.y, v);
    }

    scaleTo(sx, sy, sz) {
        this.scale = {x: sx, y: sy, z: sz};
        this.matrix.scale(sx, sy, sz);
        return this;
    }

    get sx() {
        return this.scale.x;
    }

    set sx(v) {
        this.scaleTo(v, this.scale.y, this.scale.z);
    }

    get sy() {
        return this.scale.y;
    }

    set sy(v) {
        this.scaleTo(this.scale.x, v, this.scale.z);
    }

    get sz() {
        return this.scale.z;
    }

    set sz(v) {
        this.scaleTo(this.scale.x, this.scale.y, v);
    }

    lookAt(target) {
        // target can be a Node3D or any object with position {x, y, z}
        const tx = target.position?.x ?? target.x;
        const ty = target.position?.y ?? target.y;
        const tz = target.position?.z ?? target.z;

        //Direction vector from camera to target
        const dx = tx - this.position.x;
        const dy = ty - this.position.y;
        const dz = tz - this.position.z;

        // Обчислюємо yaw (поворот навколо Y) і pitch (поворот навколо X)
        this.rotation.y = Math.atan2(dx, dz);                // yaw
        const distanceXZ = Math.sqrt(dx * dx + dz * dz);
        this.rotation.x = Math.atan2(-dy, distanceXZ);      // pitch
        this.rotation.z = 0;                                // roll to 0

        // Updating the camera matrix
        this.update();

        return this;
    }

    animateTo(params, duration){}
    attachOrbitControls(domElement){}
    enableParallax(depth){}
}



