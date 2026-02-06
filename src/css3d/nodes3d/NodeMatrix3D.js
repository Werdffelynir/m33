import {Matrix3D} from "../Matrix3D.js";

export class NodeMatrix3D {

    constructor(element) {
        this.element = element;
        this.matrix = new Matrix3D();
        this.children = new Set();
        this.parent = null;
        this.rotateUnit = CSS.rad;
        this.transformUnit = CSS.px;

        this.position = {x: 0, y: 0, z: 0};
        this.rotation = {x: 0, y: 0, z: 0};
        this.scale = {x: 1, y: 1, z: 1};

        this.inverted = false;
        this.order = "trs";
        this.rotateOrder = "xyz";

        this._needsUpdate = true;
    }

    get x () {return this.position.x;}
    set x (v) {this.position.x = v; this._needsUpdate = true;}
    get y () {return this.position.y}
    set y (v) {this.position.y = v; this._needsUpdate = true;}
    get z () {return this.position.z}
    set z (v) {this.position.z = v; this._needsUpdate = true;}

    get rx () {return this.rotation.x}
    set rx (v) {this.rotation.x = v; this._needsUpdate = true;}
    get ry () {return this.rotation.y}
    set ry (v) {this.rotation.y = v; this._needsUpdate = true;}
    get rz () {return this.rotation.z}
    set rz (v) {this.rotation.z = v; this._needsUpdate = true;}

    get sx () {return this.scale.x}
    set sx (v) {this.scale.x = v; this._needsUpdate = true;}
    get sy () {return this.scale.y}
    set sy (v) {this.scale.y = v; this._needsUpdate = true;}
    get sz () {return this.scale.z}
    set sz (v) {this.scale.z = v; this._needsUpdate = true;}

    toCSS() {
        this.matrix.translate( this.position.x, this.position.y, this.position.z );
        this.matrix.rotate( this.rotation.x, this.rotation.y, this.rotation.z );
        this.matrix.scale( this.scale.x, this.scale.y, this.scale.z );

        return this.matrix.toCSS()
    }



    get needsUpdate() {return this._needsUpdate}
    set needsUpdate(v) {this._needsUpdate = !!v}

    update() {
        if (!this._needsUpdate) return;

        this.element.style.transform = this.toCSS();

        for (const child of this.children) {
            child.update(true);
        }

        this._needsUpdate = false;
    }

}



export class CSSNode3D {

    constructor(element) {
        this.element = element;
        this.rotateUnit = CSS.rad;
        this.transformUnit = CSS.px;
        this.children = new Set();
        this.parent = null;

        this.position = {x: 0, y: 0, z: 0};
        this.rotation = {x: 0, y: 0, z: 0};
        this.scale = {x: 1, y: 1, z: 1};

        this.inverted = false;
        this.order = "trs";
        this.rotateOrder = "xyz";

        this._needsUpdate = true;
    }

    get x () {return this.position.x;}
    set x (v) {this.position.x = v; this._needsUpdate = true;}
    get y () {return this.position.y}
    set y (v) {this.position.y = v; this._needsUpdate = true;}
    get z () {return this.position.z}
    set z (v) {this.position.z = v; this._needsUpdate = true;}

    get rx () {return this.rotation.x}
    set rx (v) {this.rotation.x = v; this._needsUpdate = true;}
    get ry () {return this.rotation.y}
    set ry (v) {this.rotation.y = v; this._needsUpdate = true;}
    get rz () {return this.rotation.z}
    set rz (v) {this.rotation.z = v; this._needsUpdate = true;}

    get sx () {return this.scale.x}
    set sx (v) {this.scale.x = v; this._needsUpdate = true;}
    get sy () {return this.scale.y}
    set sy (v) {this.scale.y = v; this._needsUpdate = true;}
    get sz () {return this.scale.z}
    set sz (v) {this.scale.z = v; this._needsUpdate = true;}

    toCSS() {
        return this.getTransform().toString()
    }

    getTransform() {
        // Rotation values
        const { x: rx, y: ry, z: rz } = this.rotation;
        const rotationMap = {
            x: new CSSRotate(1, 0, 0, this.rotateUnit(rx)),
            y: new CSSRotate(0, 1, 0, this.rotateUnit(ry)),
            z: new CSSRotate(0, 0, 1, this.rotateUnit(rz)),
        };
        const rotateOrder = this.rotateOrder || "xyz";
        const rotations = [...rotateOrder].map(k => rotationMap[k]);

        // Basic transforms
        const T = new CSSTranslate(
            this.transformUnit(this.position.x),
            this.transformUnit(this.position.y),
            this.transformUnit(this.position.z)
        );
        const S = new CSSScale(this.scale.x, this.scale.y, this.scale.z);

        // Order composition
        const transformMap = { t: T, r: rotations, s: S };
        const order = this.order || "trs";

        const list = [];
        for (const k of order) {
            const val = transformMap[k];
            if (Array.isArray(val)) list.push(...val);
            else list.push(val);
        }

        return new CSSTransformValue(list);
    }



    get needsUpdate() {return this._needsUpdate}
    set needsUpdate(v) {this._needsUpdate = !!v}

    update() {
        if (!this._needsUpdate) return;

        this.element.attributeStyleMap.set('transform', this.getTransform());

        for (const child of this.children) {
            child.update(true);
        }

        this._needsUpdate = false;
    }

}