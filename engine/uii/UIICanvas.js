import {ReactiveTemplateYAML} from "../ReactiveTemplateYAML.js";
import {Graphic} from "../canvas2d/Graphic.js";
import {UIIButton} from "./UIIButton.js";
import {AnimationLoop} from "../AnimationLoop.js";


/**
 * ```
 * uii.create(UIICanvas, 'myCanvasUI', {
 *     parent: base.element,
 *     x: 70,
 *     y: 260,
 *     width: 100,
 *     height: 100,
 *     styleCanvas: {
 *         // border: 'none'
 *     },
 *     style: {
 *
 *     },
 *     ondblclick: (payload) => {
 *         console.log('ondblclick', payload)
 *     },
 *     onmousemove: (payload) => {
 *         console.log('onmousemove', payload)
 *     },
 * })
 * ```
 */
export class UIICanvas extends UIIButton {
    ctx;
    gfx;

    constructor(uii, key, props) {
        super(uii, key, props);

        this.type = 'canvas';
        this.props.cssClasses = ['UII'];
        this.props.enabled = props?.enabled || false;
        this.props.pointX = 0;
        this.props.pointY = 0;
        this.props.fps = props?.fps || 30
        this.elements = {canvas: {}};

        // if (props?.style) {
        //     this.styleCanvas = props.style;
        //     this.props.style = {};
        // }
        this.props.style = props?.style || {};
        this.styleCanvas = props?.styleCanvas || {};

        this.element = super.create();
        this.createContentElement();
        this._bindEvents();

        if (props?.draw && typeof props.draw === "function") {
            this.draw(props.draw)
        }

        if (props?.loop && typeof props.loop === "function") {
            this.loop(props.draw)
        }
    }

    _bindEvents() {
    }

    get movepoint() {
        return {x: this.props.pointX, y: this.props.pointY};
    }

    get canvas() {
        return this.elements.canvas
    }

    createContentElement() {
        const react
            = ReactiveTemplateYAML.renderStatic(`canvas.UIICanvas[data-id=canvas]`);
        this.element.textContent = '';
        this.element.appendChild(react.template);
        this.elements = react.elements;

        this.elements.canvas.width = this.props.width;
        this.elements.canvas.height = this.props.height;
        this.element.style.border = 'none!important';

        if (this.props.bg) this.element.style.backgroundColor = this.props.bg;

        if (this.styleCanvas) {
            Object.keys(this.styleCanvas).forEach(_prop => {
                this.elements.canvas.style[_prop] = this.styleCanvas[_prop];
            })
        }

        this.ctx = this.elements.canvas.getContext('2d');
        this.gfx = new Graphic(this.ctx);

        this.animator = new AnimationLoop({
            update: (delta, iteration,  renderRequest) => {
                renderRequest()
            },
            render: (delta, iteration) => {
                // {ctx: this.ctx, gfx: this.gfx, delta, iteration}
                this.animatorCallbacks.forEach(cb => cb (this.ctx, this.gfx, delta, iteration))
            },
            fixedDelta: 1 / this.props.fps,
            timeScale: 1
        });
        this.animatorCallbacks = new Set()
    }

    /**
     * ```
     *  draw((ctx, gfx) => {
     *      ctx.
     *  })
     * ```
     * @param callback
     */
    draw(callback) {
        callback(this.ctx, this.gfx);
    }

    /**
     * ```
     *  loop((ctx, gfx, delta, iteration) => {
     *      ctx.
     *  })
     * ```
     * @param callback
     */
    loop(callback) {
        this.animatorCallbacks.add(callback)
    }
    startLoop(callback) {
        this.animator.start()
    }
    stopLoop(callback) {
        this.animator.stop()
    }
    toggleLoop(callback) {
        this.animator.togglePause()
    }

    drawGrid(cellsX = 6, cellsY = 6, color, lineWidth) {
        /** @type {CanvasRenderingContext2D} */
        const ctx = this.ctx;
        const {width, height} = ctx.canvas;
        const cellWidth = width / cellsX;
        const cellHeight = height / cellsY;

        ctx.beginPath();

        for (let i = 0; i <= cellsX; i++) {
            const x = i * cellWidth;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }

        for (let j = 0; j <= cellsY; j++) {
            const y = j * cellHeight;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }

        ctx.strokeStyle = color ?? '#6d7fa4';
        ctx.lineWidth = lineWidth ??  0.5;
        ctx.stroke();
    };
}





