import {Camera3D} from "./Camera3D.js";
import {Node3D} from "./Node3D.js";


/**
 * Centered view and camera
 * ```
 * const scene3D = new Scene3D({
 *     left: HALF_WIDTH,
 *     top: HALF_HEIGHT,
 *     width: 10,
 *     height: 10,
 * })
 *
 * const camera3D1 = new Camera3D()
 * scene3D.addCamera(camera3D1)
 * ```
 */
export class Scene3D extends Node3D {
    constructor(props) {
        super(props);

        this.perspective = props?.perspective ?? 999;
        this.originX = props?.originX ?? "50%";
        this.originY = props?.originY ?? "50%";

        this.offsetX = this._toValue(props?.offsetX, 'px') ?? '0'
        this.offsetY = this._toValue(props?.offsetY, 'px') ?? '0'

        this.element.style.width = this._toValue(props?.width) ?? '100%';
        this.element.style.height = this._toValue(props?.height) ?? '100%';
        this.element.style.transformStyle = 'preserve-3d';
        this.element.style.overflow = 'visible';
        this.element.style.position = 'absolute';
        this.element.style.perspective = '999px';

        this.updateSceneStyle()
        this._needsUpdate = true;
    }
    updateSceneStyle() {
        super.updateStyle()
        this.element.style.perspective = this._toValue(this.perspective, 'px')
        this.element.style.perspectiveOrigin = `${this.originX} ${this.originY}`;

        // this.element.style.perspective =`${this.perspective}px`;
        // if (this.offsetX !== null) this.element.style.left = this.offsetX + "px";
        // if (this.offsetY !== null) this.element.style.top = this.offsetY + "px";
        this._needsUpdate = true;
    }
    addChild(node) {
        return this.addCamera(node)
    }
    addCamera(node) {
        if (!(node instanceof Camera3D)) {
            return console.warn(`Camera3D ${JSON.stringify(node)} is not supported`);
        }

        node.element.classList.add('Camera3D')
        node.parent = this;
        node.parentId = this.id;
        super.addChild(node)

        this._needsUpdate = true;
    }

    update(dirty = false){
        this._needsUpdate = dirty;
        this.updateScene()
    }
    updateScene() {
        if (!this._needsUpdate) return;

        super.update();

/*        for (const node of this.children) {
            if (!(node instanceof Camera3D)) {
                return console.warn(`Camera3D ${JSON.stringify(node)} is not supported`);
            }

            if (node instanceof Camera3D) {
                for (const node of this.children) {
                    if (this === node) return;
                    node.updateCamera();
                }
            } else {
                //node.update();
            }


        }*/

        this._needsUpdate = false;
    }


}

