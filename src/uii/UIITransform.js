import {Reactive} from "../Reactive.js";
import {UIIBlock} from "./UIIBlock.js";
import {Doom} from "../utils/Doom.js";


export class UIIViewport {

    constructor(uiie, props = {}) {
        this.uiie = uiie;
        this.uiie.classList.add('UIIViewport');
        /**@type {*} */
        this.reactive = new Reactive({
            originX: props?.originX ?? '50%',
            originY: props?.originY ?? '-50%',
            perspective: props?.perspective ?? '500px',
            cx: 0, cy: 0, cz: 0, crx: 0, cry: 0, crz: 0, csx: 1, csy: 1, csz: 1,
        })
        /**@type {*} */
        this.state = this.reactive.state;

        this.elementCamera = document.createElement("div");
        this.elementCamera.style.position = "absolute";
        this.elementCamera.style.left = "0";
        this.elementCamera.style.top = "0";
        this.elementCamera.style.width = "100%";
        this.elementCamera.style.height = "100%";
        this.elementCamera.style.transformStyle = "preserve-3d";

        this.uiie.element.appendChild(this.elementCamera);
        this.children = new Set();
        //

        this.uiie.css({
            perspective: props?.perspective || `500px`,
            perspectiveOrigin: props?.origin || `${this.state.originX} ${this.state.originY}`,
        });

        if (props?.nodes && props?.nodes.length) {
            props.nodes.forEach((node) => this.append(node))
        }

        this.bindEvent()
    }

    resetCamera(){
        this.state.cx = 0;this.state.cy = 0;this.state.cz = 0;
        this.state.crx = 0;this.state.cry = 0;this.state.crz = 0;
        this.state.csx = 1;this.state.csy = 1;this.state.csz = 1;
    }

    /**
     * child - UIIBlock or already inst of UIITransform|UIITransform3D
     * type - 2d || 3d
     *
     * @param child {UIIBlock|UIITransform|UIITransform3D}
     * @param type
     * @returns {UIIViewport}
     */
    append(child, {type = '3d'} = {}) {
        if (child instanceof UIIBlock) {
            if (type === '3d') child = new UIITransform3D()
            else child = new UIITransform3D()
        }

        if (child instanceof UIITransform || child instanceof UIITransform3D) {
            child.viewport = this;
            // child.uiie.viewport = this;
            this.children.add(child)
            this.elementCamera.appendChild(child.uiie.element);
        }
        else
            console.warn(`Type error. \n
            \tThe parameter "child" must have type of {UIIBlock} {UIITransform} {UIITransform3D}.`)

        return this;
    }

    bindEvent() {
        this.reactive.on('originX', (value, prev) => this.updateCSS());
        this.reactive.on('originY', (value, prev) => this.updateCSS());
        this.reactive.on('perspective', (value, prev) => this.updateCSS());
    }

    updateCSS() {
        if (this.uiie.element.style.perspective !== this.state.perspective)
            this.uiie.element.style.perspective = this.state.perspective;

        const origin = `${this.state.originX} ${this.state.originY}`

        if (this.uiie.element.style.perspectiveOrigin !== origin)
            this.uiie.element.style.perspectiveOrigin = origin;

        this.elementCamera.style.transform = `
            scale3d(${this.state.csx}, ${this.state.csy}, ${this.state.csz})
            rotateX(${-this.state.crx}deg)
            rotateY(${-this.state.cry}deg)
            rotateZ(${-this.state.crz}deg)
            translate3d(${-this.state.cx}px, ${-this.state.cy}px, ${-this.state.cz}px)
        `;

        this.children.forEach(uiiTransform =>
            uiiTransform.updateCSS())

    }

    get camera(){
        const state = this.reactive.state;
        return {
            moveTo: (x, y) => {state.cx = x; state.cy = y},
            scale: (v) => {state.csx = state.csy = v},
            get x() { return state.cx; },
            get y() { return state.cy; },
            get z() { return state.cz; },
            set x(v) { return state.cx = v; },
            set y(v) { return state.cy = v; },
            set z(v) { return state.cz = v; },
            get scaleX() { return state.csx; },
            get scaleY() { return state.csy; },
            get scaleZ() { return state.csz; },
            set scaleX(v) { return state.csx = v; },
            set scaleY(v) { return state.csy = v; },
            set scaleZ(v) { return state.csz = v; },
            get rotateX() { return state.crx; },
            get rotateY() { return state.cry; },
            get rotateZ() { return state.crz; },
            set rotateX(v) { return state.crx = v; },
            set rotateY(v) { return state.cry = v; },
            set rotateZ(v) { return state.crz = v; },
        }
    }

    get x(){ return this.uiie.x }
    get y(){ return this.uiie.y }
    get width(){ return this.uiie.width }
    get height(){ return this.uiie.height }
    get originX() {return this.state.originX }
    get originY() {return this.state.originY }
    get perspective() {return this.state.perspective }

    set x(v){ return this.uiie.x = v }
    set y(v){ return this.uiie.y = v }
    set width(v){ return this.uiie.width = v }
    set height(v){ return this.uiie.height = v }
    set originX(v) {this.state.originX = v}
    set originY(v) {this.state.originY = v}
    set perspective(v) {this.state.perspective = v}
}


/**
 * ```
 *          skewX
 *       skewY  |     translate(x, y)
 *           |  |     |  |
 * matrix(1, 0, 0, 1, 0, 0);
 *        |        |
 *   scaleX   scaleY
 *        a, b, c, d, e, f
 * ```
 * Transform (element,  { x:0, y:0, sx:1, sy:1, ax:0, ay:0 })
 * Transform (element,  { x:0, y:0, scaleX:1, scaleY:1, skewX:0, skewY:0 })
 */
export class UIITransform {
    constructor(element, props = {}) {
        this.element = element;

        if (props?.style)
            Doom.css(this.element, props.style)

        this.reactive = new Reactive({
            // a, b, c, d, e, f
            e: props?.x ?? 0,
            f: props?.y ?? 0,
            a: props?.sx ?? props?.scaleX ?? 1,
            d: props?.sy ?? props?.scaleY ?? 1,
            c: props?.ax ?? props?.skewX  ?? 0,
            b: props?.ay ?? props?.skewY  ?? 0,

            r: props?.r ?? props?.rotate ?? 0,
        })
        this.state = this.reactive.state;

        this.bindEvent()
        this.updateCSS()
    }

    translate(x, y) {
        this.state.e = x;
        this.state.f = y
    }

    set x(v) {this.state.e = v}
    set y(v) {this.state.f = v}
    set rotate(v) {this.state.r = v}
    set scale(v) {this.state.a = this.state.d = v}
    set scaleX(v) {this.state.a = v}
    set scaleY(v) {this.state.d = v}
    set skew(v){this.state.c = this.state.b = v}
    set skewX(v) {this.state.c = v}
    set skewY(v) {this.state.b = v}

    get x() {return this.state.e }
    get y() {return this.state.f }
    get rotate() {return this.state.r }
    get scale() {return this.state.a / this.state.d }
    get scaleX() {return this.state.a }
    get scaleY() {return this.state.d }
    get skewX() {return this.state.c }
    get skewY() {return this.state.b }

    bindEvent() {
        // this.reactive.on('*', (value, prev) => {
        //     console.log('bindEvent: *')
        //     this.updateCSS()
        // });
        // this.reactive.on('y', (value, prev) => {
        //     this.updateCSS()
        // });
        // this.reactive.on('z', (value, prev) => {
        //     this.updateCSS()
        // });
    }

    updateCSS() {
        /*        const str = `
                    scaleX(${this.state.scaleX})
                    scaleY(${this.state.scaleY})
                    rotate(${this.state.rotate}deg)
                    rotateX(${this.state.rotateX}deg)
                    rotateY(${this.state.rotateY}deg)
                    translate(${this.state.x}px, ${this.state.y}px)
                `;*/

        let transform = ``
        transform += ` matrix(${this.state.a}, tan(${this.state.b}deg), tan(${this.state.c}deg), ${this.state.d}, ${this.state.e}, ${this.state.f})`
        transform += ` rotate(${this.reactive.state.r}deg)`;

        return this.element.style.transform = transform;
    }
}


export class UIITransform3D {

    constructor(uiie, props = {}) {
        this.uiie = uiie;
        this.uiie.classList.add('UIITransform');
        this.uiie.css({
            transformStyle: 'preserve-3d',
        })
        this.viewport = props?.viewport;
        this.reactive = new Reactive({
            x: props?.x ?? 0,
            y: props?.y ?? 0,
            z: props?.z ?? 0,
            rx: props?.rx ?? 0,
            ry: props?.ry ?? 0,
            rz: props?.rz ?? 0,
            sx: props?.sx ?? 1,
            sy: props?.sy ?? 1,
            sz: props?.sz ?? 1,
        })
        this.state = this.reactive.state;
        this.bindEvent()
        this.updateCSS();
    }

    moveTo (x, y) {this.reactive.state.x = x; this.reactive.state.y = y}

    scale (v) {this.reactive.state.sx = this.reactive.state.sy = v}

    get x() { return this.reactive.state.x; }
    get y() { return this.reactive.state.y; }
    get z() { return this.reactive.state.z; }
    set x(v) { return this.reactive.state.x = v; }
    set y(v) { return this.reactive.state.y = v; }
    set z(v) { return this.reactive.state.z = v; }
    get scaleX() { return this.reactive.state.sx; }
    get scaleY() { return this.reactive.state.sy; }
    get scaleZ() { return this.reactive.state.sz; }
    set scaleX(v) { return this.reactive.state.sx = v; }
    set scaleY(v) { return this.reactive.state.sy = v; }
    set scaleZ(v) { return this.reactive.state.sz = v; }
    get rotateX() { return this.reactive.state.rx; }
    get rotateY() { return this.reactive.state.ry; }
    get rotateZ() { return this.reactive.state.rz; }
    set rotateX(v) { return this.reactive.state.rx = v; }
    set rotateY(v) { return this.reactive.state.ry = v; }
    set rotateZ(v) { return this.reactive.state.rz = v; }

    bindEvent() {
        // this.reactive.on('x', (value, prev) => this.updateCSS());
        // this.reactive.on('y', (value, prev) => this.updateCSS());
        // this.reactive.on('z', (value, prev) => this.updateCSS());
    }

    updateCSS() {
        this.uiie.element.style.transform = `
            translate3d(${this.reactive.state.x}px, ${this.reactive.state.y}px, ${this.reactive.state.z}px)
            rotateX(${this.reactive.state.rx}deg)
            rotateY(${this.reactive.state.ry}deg)
            rotateZ(${this.reactive.state.rz}deg)
            scale3d(${this.reactive.state.sx}, ${this.reactive.state.sy}, ${this.reactive.state.sz})
        `;
       // const str = `rotateX(${this.state.x}deg) rotateY(${this.state.y}deg) translateZ(${this.state.z}px)`;
       // this.uiie.element.style.transform = str;
       // return str
    }
}