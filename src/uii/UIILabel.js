import {UIIBlock} from "./UIIBlock.js";
import {Reactive} from "../Reactive.js";


/**
 * ```
 * UIILabel = new UIILabel ( uii, 'keyName', {
 *      x: 0,
 *      y: 0,
 *      z: 0,
 *      width: 30,
 *      height: 30,
 *      fixed: true,
 *      content: true,
 *      style: {},
 *      cssClasses: ['UII', 'UIIBlock'],
 *      userSelect: 'text',
 *
 *      // if in uii instance sets events
 *      onclick: (event, target) => {},
 *      ondblclick: (event, target) => {},
 *      oncontextmenu: (event, target) => {},
 *      onmousemove: (event, target) => {},
 *      onmousedown: (event, target) => {},
 *      onmouseup: (event, target) => {},
 *
 *      //
 *      transform: {x, y, rotate, rotateX, rotateY, rotateZ, translateX, translateY, translateZ, scaleX, scaleY, scaleZ, skewX, skewY}
 * })
 *
 * transform = UIILabel.transform
 * transformCamera = addTransformCamera();
 *
 * ```
 */
export class UIILabel extends UIIBlock {
    constructor(uii, key, props) {
        super(uii, key, props);

        this.type = 'label';
        this.props.cssClasses = [...['UII', 'UIILabel'], ...props?.cssClasses || []];
        this.element =  props?.element || super.create();

        if (props?.parent) this.parent = props?.parent;
        this.props.transform = props?.transform;

        /**
         * @type {{x, y, rotate, rotateX, rotateY, rotateZ, translateX, translateY, translateZ, scaleX, scaleY, scaleZ, skewX, skewY}}
         */
        this.transform = {};
        /**
         *
         * @type {{originX, originY, perspective}}
         */
        this.transformCamera = {};


        if (this.props.transform) {
            this.createTransform(this.props.transform)
        }
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
     *
     *
     *  createTransform( { x:0, y:0, sx:1, sy:1, ax:0, ay:0 } )
     *  createTransform( { x:0, y:0, scaleX:1, scaleY:1, skewX:0, skewY:0 } )
     *
     * ```
     * # transform3D
     *
     * ```
     * createTransform (
     *      transform3D: {
     *         rotateX: 16,
     *         rotateY: -16,
     *         translateZ: 48,
     *         translateX: 0,
     *         scaleX: 0.9,
     *     })
     * ```
     *
     */
    createTransform(props) {
        const ent = {
            x: props?.x ?? 0,
            y: props?.y ?? 0,
            rotate: props?.rotate ?? 0,
            rotateX: props?.rotateX ?? 0,
            rotateY: props?.rotateY ?? 0,
            rotateZ: props?.rotateZ ?? 0,
            translateX: props?.translateX ?? 0,
            translateY: props?.translateY ?? 0,
            translateZ: props?.translateZ ?? 0,
            scaleX: props?.scale ?? props?.scaleX ?? 1,
            scaleY: props?.scale ?? props?.scaleY ?? 1,
            scaleZ: props?.scaleZ ?? 1,
            skewX: props?.skewX ?? 0,
            skewY: props?.skewY ?? 0,
        }
        const react = new Reactive(ent);

        const updateCSS = () => {
            this.element.style.transform = `
            translate(${react.state.x}px, ${react.state.y}px)
            rotate(${react.state.rotate}deg) 
            rotateX(${react.state.rotateX}deg) 
            rotateY(${react.state.rotateY}deg) 
            rotateZ(${react.state.rotateZ}deg) 
            translateX(${react.state.translateX}px)
            translateY(${react.state.translateY}px)
            translateZ(${react.state.translateZ}px)
            scaleX(${react.state.scaleX})
            scaleY(${react.state.scaleY})
            scaleZ(${react.state.scaleZ})
            skewX(${react.state.skewX})
            skewY(${react.state.skewY})
        `}

        updateCSS()

        react.on('*', (path, value, prev) => {
            console. log(`Changed [${path}]: ${prev} → ${value}`);
            updateCSS();
        });

        this.transform = react.state;
        return react.state;
    }

    addTransformCamera(element, props) {
        const ent = {
            originX: props?.originX ?? '50%',
            originY: props?.originY ?? '-50%',
            perspective: props?.perspective ?? '800px',
            position: props?.position ?? 'relative',
            width: props?.width ?? '100%',
            height: props?.height ?? '100%',
        }
        const react = new Reactive(ent);

        const updateCSS = () => {
            element.style.perspective = react.state.perspective;
            element.style.perspectiveOrigin = `${react.state.originX} ${react.state.originY}`;
        }

        if (element.style.position !== 'absolute' && element.style.position !== 'relative') {
            element.style.position = react.state.position;
            element.style.width = react.state.width;
            element.style.height = react.state.height;
        }

        updateCSS();

        react.on('*', (path, value, prev) => {
            console. log(`Changed [${path}]: ${prev} → ${value}`);
            updateCSS();
        });

        this.transformCamera = react.state;
        return react.state;
    }

}

/*

const specialViewport = document.createElement('div');
specialViewport.style.position = 'absolute'
specialViewport.style.left = '10px'
specialViewport.style.top = '10px'
specialViewport.style.width = '100%'
specialViewport.style.height = '100%'
specialViewport.style.border = '2px solid var(--cr6)'
specialViewport.style.perspective = '300px'
specialViewport.style.perspectiveOrigin = '50% -50%'
const transformLabel = uii.create(UIILabel, toname('transformLabel'), {
    parent: specialViewport,
    content: 'rotateX(24deg)\nrotateY(-16deg)\ntranslateZ(48px) ',
    x: 200,
    y: 20,
    fixed: true,
    style: {fontSize: '16px'},
    transform3D: {
        rotateX: 16,
        rotateY: -16,
        translateZ: 48,
        translateX: 0,
        scaleX: 0.9,
    },
    width: 120,
})
view.element.appendChild(specialViewport);
*/
