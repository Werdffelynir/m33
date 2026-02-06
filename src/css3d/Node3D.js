import {Doom} from "../utils/Doom.js";
import {Ut} from "../Ut.js";
import {Transform3D} from "./Transform3D.js";


/*
id
element
x
y
z
rx
ry
rz
sx
sy
sz
width
height
opacity
centred
inverted
state
style

inverted
order
rotateOrder
*/
export function createNode3DElement({
                                        width = 100, height = 100,
                                        x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1,
                                        absolute = true,
                                        overflow = false,
                                        camera = false,
                                        border = false,
                                        outline = false,
                                    } = {}) {
    const style = {
        position: absolute ? 'absolute' : 'relative',
        left: "0",
        top: "0",
        overflow: overflow ? 'visible' : 'hidden',
        width: Ut.isNumeric(width) ? width + 'px' : width,
        height: Ut.isNumeric(height) ? height + 'px' : height,
        willChange: 'transform', //, opacity',
        transform: `
          translate3d(${x}px, ${y}px, ${z}px)
          rotateX(${rx}deg)
          rotateY(${ry}deg)
          rotateZ(${rz}deg)
          scale3d(${sx}, ${sy}, ${sz})
        `,
    }
    if (camera) {
        style.transformOrigin = "center center";
        style.transformStyle = "preserve-3d";
    }
    if (outline) {
        style.outline = outline === true ? `1px dashed #ffffff` : outline;
    }
    if (border) {
        style.border = border === true ? `1px dashed #ffffff` : border;
    }

    return Doom.create('div', {style})
}




let _Node3DIndexCounter = 0
export class Node3D extends Transform3D {


    constructor({
                    id,
                    parentId,
                    element,
                    x = 0,
                    y = 0,
                    z = 0,
                    rx = 0,
                    ry = 0,
                    rz = 0,
                    sx = 1,
                    sy = 1,
                    sz = 1,
                    width = 1,
                    height = 1,
                    offsetX = 0,
                    offsetY = 0,
                    opacity = 1,
                    inverted = false,
                    overflow = true,
                    backface = true,
                    order,
                    rotateOrder,
                    state = {},
                    style = {}
                } = {}) {
        super()
        /**@type {HTMLElement} */
        this.element = element || createNode3DElement();

        // this.matrix = new Matrix3D();

        this.children = new Set();
        this.parent = null;
        this.parentId = parentId;
        this.id = id ?? this._generateId();
        this.x  = x; // translate3d x y z
        this.y  = y; //
        this.z  = z; //
        this.rx = rx; // rotateX
        this.ry = ry; // rotateY
        this.rz = rz; // rotateZ
        this.sx = sx; // scale3d x y z
        this.sy = sy;
        this.sz = sz;

        this.index = _Node3DIndexCounter ++;

        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;
        this.opacity = opacity;

        this.inverted = inverted;
        this.overflow = overflow;
        this.backface = backface;
        this.order = order ?? "trs";
        this.rotateOrder = rotateOrder ?? "xyz";

        this.style = style;
        this.state = state;
        this.element.style.top = '0';
        this.element.style.left = '0';

        // auto, scroll-position, contents, revert, transform, opacity, left, top
        this.element.style.willChange = 'transform';
        this.element.style.position = 'absolute'

        // hidden visible
        this.element.style.overflow = this.overflow ? 'visible' : 'hidden';
        this.element.style.backfaceVisibility = this.backface ? 'visible' : 'hidden';
        this.element.style.opacity = `${this.opacity}`;
        this.element.style.transformStyle = 'preserve-3d' // unset | preserve-3d
        this._needsUpdate = true;
        this.className = this.constructor.name;

        this.updateStyle()
    }


    _generateId(max = 8){
        let _id = crypto?.randomUUID?.() || `node_${Math.random().toString(36).slice(2, 9)}`
        return _id.slice(0, max).padStart(max, 'node')
    }

    updateStyle() {
        if (this.style && Object.keys(this.style).length > 0) {
            Object.keys(this.style).forEach(key => {
                if (this.element.style.hasOwnProperty(key))
                    this.element.style[key] = this.style[key]
            })
        }
        this.element.style.overflow = this.overflow ? 'visible' : 'hidden';
        this.element.style.backfaceVisibility = this.backface ? 'visible' : 'hidden';

        if (this.offsetX !== null) this.element.style.left = this.offsetX + "px";
        if (this.offsetY !== null) this.element.style.top = this.offsetY + "px";
        if (this.width !== null) this.element.style.width = this.width + 'px';
        if (this.height !== null) this.element.style.height = this.height + 'px';
        if (typeof this.opacity === 'number' && !isNaN(this.opacity)) this.element.style.opacity = this.opacity + '';

    }
    addChild(child) {
        this.children.add(child);
        this.element.appendChild(child.element);
        this.element.style.transformStyle = 'preserve-3d'
        child.update(true)
    }
    removeChild(child) {
        this.children.delete(child);
        if (child.parent) {
            child.parent.element.remove(child.element);
            child.parent = null;
        }
        this._needsUpdate = true;
    }
    scale(sx = null, sy = sx, sz = sy) {
        if (sx !== null) this.sx = sx;
        if (sy !== null) this.sy = sy;
        if (sz !== null) this.sz = sz;
        this._needsUpdate = true;
    }
    scaleBy(sx, sy = sx, sz = 1) {
        this.sx += sx;
        this.sy += sy;
        this.sz += sz;
        this._needsUpdate = true;
    }
    transform(x = null, y = null, z = null) {
        if (x !== null) this.x = x;
        if (y !== null) this.y = y;
        if (z !== null) this.z = z;
        this._needsUpdate = true;
    }
    transformBy(x = null, y = null, z = null) {
        if (x !== null) this.x += x;
        if (y !== null) this.y += y;
        if (z !== null) this.z += z;

        this._needsUpdate = true;
    }
    rotate(rx = null, ry = null, rz = null) {
        if (rx !== null) this.rx = rx;
        if (ry !== null) this.ry = ry;
        if (rz !== null) this.rz = rz;
        this._needsUpdate = true;
    }
    rotateBy(rx = null, ry = null, rz = null) {
        if (rx !== null) this.rx += rx;
        if (ry !== null) this.ry += ry;
        if (rz !== null) this.rz += rz;
        this._needsUpdate = true;
    }
    size(width = null, height = null) {
        if (width !== null) {
            this.width = width;
            this.element.style.width = width + "px";
        }
        if (height !== null) {
            this.height = height
            this.element.style.height = height + "px";
        }
    }
    position(left = null, top = null){
        if (left !== null) {
            this.left = left;
            this.element.style.left = left + "px";
        }
        if (top !== null) {
            this.top = top;
            this.element.style.top = top + "px";
        }
    }

    get needsUpdate() {return this._needsUpdate}
    set needsUpdate(v) {this._needsUpdate = !!v}

    update() {
        if (!this._needsUpdate) return;

        this.element.style.transform = this.toCSS();

        for (const child of this.children)
        {
            child.update(true);
        }

        this._needsUpdate = false;
    }

    reset() {
        this.x = 0; // translate3d x y z
        this.y = 0; //
        this.z = 0; //
        this.rx = 0; // rotateX
        this.ry = 0; // rotateY
        this.rz = 0; // rotateZ
        this.sx = 1; // scale3d x y z
        this.sy = 1;
        this.sz = 1;
    }

    import(data) {
        Object.keys(this.export()).forEach(key => {

            if (data.hasOwnProperty(key))
                this[key] = data[key]

        })

        this._needsUpdate = true;
        this.updateStyle();
        this.update()
    }

    export() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            rx: this.rx,
            ry: this.ry,
            rz: this.rz,
            sx: this.sx,
            sy: this.sy,
            sz: this.sz,
            id: this.id,
            parentId: this.parentId,
            state: JSON.parse(JSON.stringify(this.state)), //structuredClone(this.state),
            style: JSON.parse(JSON.stringify(this.style)), //structuredClone(this.style),
            inverted: this.inverted,
            order: this.order,
            rotateOrder: this.rotateOrder,
            className: this.constructor.name,
            width: this.width,
            height: this.height,
            opacity: this.opacity,
            overflow: this.overflow,
            backface: this.backface,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
        }
    }

    cloneNode() {
        const params = this.export();
        const node = new Node3D(params);
        node.element = this.element.cloneNode(true);
        node.id = this._generateId();
        node.parent = this.parent;
        return node
    }
    _toValue (val, units = 'px') {
        return (typeof val === 'number' && !isNaN(val)) ? `${val}${units}` : (typeof val === "string") ? val : "0"
    }
    _mergeArray = (base, ...arrs) => base.map((v, i) => arrs.find(a => a[i] != null)?.[i] ?? v)
    _isNumeric = (v) => !Array.isArray(v) && !isNaN(parseFloat(v)) && isFinite(v)
}









