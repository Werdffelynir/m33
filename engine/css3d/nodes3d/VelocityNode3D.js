import {Node3D} from "../Node3D.js";

export class VelocityNode3D extends Node3D {
    constructor(props) {
        super(props);
        this.vx =  0;
        this.vy =  0;
        this.vz =  0;
        this.vrx = 0;
        this.vry = 0;
        this.vrz = 0;
        this.vsx = 0;
        this.vsy = 0;
        this.vsz = 0;

        if (props?.parent) this.parent.addChild(this);
        if (props?.nodes && props.nodes.length > 0) props.nodes.forEach(node => {this.addChild(node)});
    }

    scale(sx, sy = sx, sz = 1) {
        this.vsx = sx;
        this.vsy = sy;
        this.vsz = sz;
        this._needsUpdate = true;
    }
    scaleTo(sx, sy = sx, sz = 1) {
        this.vsx = this.vsy = this.vsz = 0;
        this.sx = sx
        this.sy = sy
        this.sz = sz
        this._needsUpdate = true;
    }

    transform(x = null, y = null, z = null) {
        if (x !== null) this.vx = x;
        if (y !== null) this.vy = y;
        if (z !== null) this.vz = z;
        this._needsUpdate = true;
    }
    transformTo(x = null, y = null, z = null) {
        this.vx = this.vy = this.vz = 0;
        this.x = x
        this.y = y
        this.z = z
        this._needsUpdate = true;
    }

    rotate(rx = null, ry = null, rz = null) {
        if (rx !== null) this.vrx = rx;
        if (ry !== null) this.vry = ry;
        if (rz !== null) this.vrz = rz;
        this._needsUpdate = true;
    }
    rotateTo(rx = null, ry = null, rz = null) {
        this.vrx = this.vry = this.vrz = 0;
        this.rx = rx
        this.ry = ry
        this.rz = rz
        this._needsUpdate = true;
    }

    reset() {
        this.vx = 0;  // translate3d x y z
        this.vy = 0;  //
        this.vz = 0;  //
        this.vrx = 0; // rotateX
        this.vry = 0; // rotateY
        this.vrz = 0; // rotateZ
        this.vsx = 0; // scaleX
        this.vsy = 0; // scaleY
        this.vsz = 0; // scaleZ
        super.reset();
        this._needsUpdate = true;
        console.log('{VelocityNode3D.reset}',this)
        // this.update();
    }

    update(dirty = false) {
        this.x  += this.vx;
        this.y  += this.vy;
        this.z  += this.vz;
        this.rx += this.vrx;
        this.ry += this.vry;
        this.rz += this.vrz;
        this.sx += this.vsx;
        this.sy += this.vsy;
        this.sz += this.vsz;

        super.update(dirty);
    }

}