import {Layer} from "./canvas2d/Layer.js";
import {IManager} from "./IManager.js";
import {Ut} from "./Ut.js";



// Layers
export const LAYER_BG = 'bg';
export const LAYER_GAME = 'game';
export const LAYER_UI = 'ui';

export class LayerManager extends IManager {

    /** @type {HTMLElement} */
    parent;

    /** @type {HTMLElement|HTMLCanvasElement} */
    frontCanvas;

    constructor(register) {
        super(register)

        this.props = {
            width: 100,
            height: 100,
            quality: true,
            canvases: [LAYER_BG, LAYER_GAME, LAYER_UI],
        };
    }

    /**
     *
     * `canvases`   - layer keys,
     * `config`     - general settings,
     * `parent`     - root element for all canvas layers
     *
     * ```
     * {
     *      canvases: ['game', 'ui', 'bg'],
     *      config: { width: 0, height: 0, quality: true },
     *      parent: HTMLElement,
     * }
     * ```
     * @param props {*}
     */
    configured(props) {

        if(props?.parent && props.parent?.nodeType === Node.ELEMENT_NODE )
            this.parent = props.parent;

        this.props = {...this.props, ...props, };

        this.props.canvases.forEach((key, i) => {

            let layer = new Layer({
                id: key,
                width: this.props.width,
                height: this.props.height,
            });

            layer.setQuality(this.props.quality);

            //todo
            layer.canvas.setAttribute('tabindex', `${i}`);
            layer.canvas.setAttribute('data-canvas', key);

            this.set(key, layer);
        });
    }

    async init() {

        /**
         * Attached CanvasLayers, its game, ui canvas elements
         */
         this.attach();
    }

    /**
     * isActiveFrontCanvas
     */
    isActiveFrontCanvas() {
        return this.frontCanvas && this.frontCanvas === document.activeElement
    }

    attach(parent) {
        if (parent && parent.nodeType === Node.ELEMENT_NODE) this.parent = parent
        if (!Ut.isNode(this.parent)) {
            return console.warn(`{LayerManager.attach} parent element not set, or ont type of Node, attachment is prohibited`)
        }

        this.stackmanager.forEach( (layer) => {
            layer.attachTo(this.parent);
        });

        return this.parent;
    }

    detach(parent) {
        if (parent && parent.nodeType === Node.ELEMENT_NODE) this.parent = parent

        this.stackmanager.forEach( (layer) => {
            // layer.canvas.parentElement.removeChild(layer.canvas);
            // parent.removeChild(layer.canvas);
            layer.detach(this.parent);
        });

    }

    /**
     * @param name
     * @param layer {Layer}
     */
    set(name, layer) {
        this.frontCanvas = layer.canvas;
        this.stackmanager.set(name, layer);
    }

    /** @returns {Layer} */
    get(name) {
        return this.stackmanager.get(name);
    }

    has(name) {
        return this.stackmanager.has(name);
    }

    each(callback) {
        if (Ut.isFunction(callback)) {
            this.stackmanager.forEach(callback)
            return;
        }
        return Object.fromEntries(this.stackmanager);
    }

    /** @returns {Map<string, Layer>} */
    get layers () {
        return this.getStack()
    }

    clear(name) {
        this.stackmanager.get(name).ctx.clearRect(0, 0, this.stackmanager.get(name).canvas.width, this.stackmanager.get(name).canvas.height);
    }

    clearAll() {
        for (const {name, layer} of this.stackmanager) {
            layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        }
    }
}

