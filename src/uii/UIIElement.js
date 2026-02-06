import {UIIBlock} from "./UIIBlock.js";
import {UIIDraggable} from "./UIIDraggable.js";
import {UIIHint} from "./UIIHint.js";
import {UIILabel} from "./UIILabel.js";
import {Doom} from "../utils/Doom.js";
import {UII_ATTR} from "./UII.js";
import {Ut} from "../Ut.js";
import {UIITransform, UIITransform3D, UIIViewport} from "./UIITransform.js";

/**
 * ```
 * create(UIIElement, {
 *      x: 0,
 *      y: 0,
 *      z: 0,
 *      width: 30,
 *      height: 30,
 *      fixed: true,
 *      content: true,
 *      style: {},
 *      cssClasses: ['UII', 'UIIBlock'],
 *      // if in uii instance sets events
 *      onclick: (event, target) => {},
 *      ondblclick: (event, target) => {},
 *      oncontextmenu: (event, target) => {},
 *      onmousemove: (event, target) => {},
 *      onmousedown: (event, target) => {},
 *      onmouseup: (event, target) => {},
 *
 *      draggable: true,
 *      savePosition: true,
 *      ondrag: () => {},  // called when element moved
 *      drag: NodeElement, // element drag holder
 * })
 *
 *
 * const holder = Doom.create('div', {},  '▸ Block 3D')
 * create(UIIElement, {
 *      draggable: true,
 *      content: holder,
 *      drag: holder, // element drag holder
 * }
 *
 * ```
 * todo: make new props
 *             rotateX: 0,
 *             rotateY: 0,
 *             draggableX: 200,
 *             draggableY: 0,
 *             draggableRect: {x: 0, y: 0, width: 100,  height: 100},
 */
export class UIIElement extends UIIBlock {


    constructor(uii, key, props) {
        super(uii, key, props);

        /** @type {UIIDraggable}*/
        this.draggableInstance = null;
        this.props.savePosition = props?.savePosition || false; // todo
        this.props.draggable = props?.draggable || false;
        this.props.ondrag = props?.ondrag || false; // called when element moved
        this.props.drag = props?.drag || null;      // element drag holder
        this.props.hint = props?.hint || null;

        if (this.props.draggable) {
            this.draggable = true;
        }
    }

    /**
     * ```
     * .createViewport({
     *      perspective: '600px',
     *      origin: '50% 50%',
     *      nodes: [UIITransform3D, UIITransform3D, UIITransform3D, ],
     *      nodes: [UIIBlock, UIIBlock, UIIBlock, ],
     * })
     * ```
     * @param props { * }
     * @returns {UIIViewport}
     */
    createViewport(props = {}) {
        if (this._viewport) return this._viewport;
        this._viewport = new UIIViewport(this, props)
        return this._viewport;
    }
    createTransform(props = {}) {
        if (this._transform) return this._transform;
        this._transform = new UIITransform(this, {...{
                x: this.x,
                y: this.y,
            }, ...props})
        return this._transform;
    }
    createTransform3D(props = {}) {
        if (this._transform3D) return this._transform3D;
        this._transform3D = new UIITransform3D(this, {...{
            x: this.x,
            y: this.y,
            }, ...props})
        return this._transform3D;
    }

    get draggable() {
        return this.draggableInstance?.draggable || false;
    }

    set draggable(value) {
        if (!this.draggableInstance) {
            this.draggableInstance = new UIIDraggable(this);
            if (Ut.isNode(this.props?.drag)) {
                this.draggableInstance.draggableElement = this.props.drag;
            }
        }

        this.draggableInstance.draggable = !!value;
    }

    drag(element, callback) {
        if (this.draggableInstance) {
            this.draggableInstance.drag(element, callback);
        }
    }

    /**
     * ```
     *  hint('content for element', {
     *      x: 0,
     *      y: 0,
     *      width: 200,
     *      delay: 1800,
     *      corner: 'top', // left right bottom down ?
     *  })
     * ```
     * @param content
     * @param props
     */
    hint(content, props = {}) {
        if (Ut.isString(content) && !Ut.isHTMLString(content)) {
            content = content.replaceAll('\n', '<br>')
        }
        if (!this.hintInstance) {
            let _props = {
                ...{
                    width: 200,
                    parent: this.element,
                    content: content,
                    delay: 800,
                    corner: 'top',
                },
                ...props
            };
            this.hintInstance = new UIIHint(this.uii, this.key + '_hint', _props);
        } else {
            this.hintInstance.html = content;
        }

        return this.hintInstance;
    }

    /**
     * ```
     * label(text, {
     *      corner: 'top', bottom left right
     *      width: 200,
     * })
     * ```
     * @param text
     * @param props {corner, style, width, fixed, content}
     * @returns {UIILabel}
     */
    label(text, props = {}) {
        if (!this.labelInstance)  {
            let labelProps = {
                ...{
                    x: 0,
                    y: 0,
                    width: 380,
                    style: null,
                    parent: this.parent,
                    fixed: this.props.fixed,
                    content: text,
                },
                ...props
            };

            if (!this.props.fixed){

                //todo tested not fixed label
                const selector = `[data-${UII_ATTR}=${this.element.dataset.uii}].` + [...this.element.classList].join('.')
                console.warn(`{element.label} tested not fixed label. css selector '${selector}'`);

                Doom.Styles.remove(`uii-${this.key}`)
                const fixedCss = `
${selector} :before {
    position: relative;
    top: ${labelProps.y||0}px;
    left: ${labelProps.x||0}px;
    position: absolute;
    display: block;
    right: calc(100% - ${labelProps.width+this.width}px);
    width: ${labelProps.width}px;
    content: '${text}'
}
`
                const relativeCss = `
${selector} :after {
    position: relative;
    display: block;
    top: 0;
    left: 0;
    margin: 0px 0 0 ${this.width+15}px;
    width: ${labelProps.width}px;
    content: '${text}'
}
`
                Doom.Styles.addStyleElement(`uii-${this.key}`, labelProps.fixed
                    ? fixedCss
                    : relativeCss)
                // if (labelProps.style) Doom.css(selector + ':after', labelProps.style)

                return ;
            }

            const parentRect = {width: 30, height: 30}
            const corner = props?.corner || 'top';
            this.labelInstance = new UIILabel(this.uii, this.key + '_label', labelProps);

            switch (corner) {
                case 'top':
                    this.labelInstance.x = this.x + (props?.x || 0)
                    this.labelInstance.y += this.y - parentRect.height + (props?.y || 0)
                    break;
                case 'bottom':
                    this.labelInstance.x = this.x + (props?.x || 0)
                    this.labelInstance.y += this.y + parentRect.height + (props?.y || 0)
                    break;
                case 'left':
                    this.labelInstance.x += this.x - this.labelInstance.width+ (props?.x || 0)
                    this.labelInstance.y = this.y + (props?.y || 0)
                    break;
                case 'right':
                    this.labelInstance.x += this.x + this.width + (props?.x || 0)
                    this.labelInstance.y = this.y + (props?.y || 0)
                    break;
            }
        } else {
            this.labelInstance.html = text;
        }

        return this.labelInstance;
    }

    destroy() {
        super.destroy();
    }
}
