

/**
 * ```
 * constructor ()
 * x
 * y
 * z
 * rx
 * ry
 * rz
 * sx
 * sy
 * sz
 * inverted
 * order
 * rotateOrder
 * toCSS
 * ```
 *
 * ```
 * // add new func
 * Transform3D.templates.skew = (t) => `skew(${t.skx}deg, ${t.sky}deg)`;
 * transform.order.push("skew");
 * ```
 */
export class Transform3D {
    constructor() {
        this.x = this.y = this.z = 0;
        this.rx = this.ry = this.rz = 0;
        this.sx = this.sy = this.sz = 1;

        this.inverted = false;
        this.order = "trs";
        this.rotateOrder = "xyz";
    }
    static compileCSS(t, order = 'trs', rotateOrder = 'xyz', invert = false) {

        const ops = {
            t: () => Transform3D.templates.translate(t, invert),
            r: () => Transform3D.templates.rotate(t, rotateOrder, invert),
            s: () => Transform3D.templates.scale(t),
        };

        const css = [...order].map(k => ops[k[0]]?.()).filter(Boolean).join(' ');

        return css
    }

    static templates = {
        translate(t, inverted = false) {
            return `translate3d(${inverted?-t.x:t.x}px, ${inverted?-t.y:t.y}px, ${inverted?-t.z:t.z}px)`;
        },
        rotate(t, order = 'xyz', inverted = false) {
            return inverted
                ? [...order].map(a => `rotate${a.toUpperCase()}(${-(t['r'+a])}rad)`).join(' ')
                : [...order].map(a => `rotate${a.toUpperCase()}(${t['r'+a]}rad)`).join(' ');
        },
        scale(t) {
            return `scale3d(${t.sx}, ${t.sy}, ${t.sz})`;
        },
    };

    toCSS() {
        const t = this;
        const {x,y,z,rx,ry,rz,sx,sy,sz} = this

        const css = Transform3D.compileCSS({x,y,z,rx,ry,rz,sx,sy,sz}, this.order, this.rotateOrder, this.inverted)
        return css
    }

}
