import {Graphic} from "./Graphic.js";
import {Ut} from "../Ut.js";

/**
 * ```
 *
 * ```
 * tabindex="0"
 *
 *
 * ```
 * l = new Layer ({
 *      id: 'ui',
 *      width: window?.innerWidth,
 *      height: window?.innerHeight,
 * });
 * ```
 *
 */
export class Layer {
    constructor(params = {id: 'layer', width: 100, height: 100}) {
        this.id = params.id;
        this.width = params.width;
        this.height = params.height;
        this.canvas = document.createElement("canvas");
        this.canvas.style.background = 'transparent!important';
        this.canvas.style.position = 'absolute';
        this.canvas.style.display = 'block';
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.id = this.id;

        // todo:
        this.canvas.setAttribute('tabindex', '-1');

        this.ctx = this.canvas.getContext("2d", {
            willReadFrequently: true, // params?.willReadFrequently ?? false,
        });
    }

    /**
     * Setting image smoothing quality "low" "high" "medium".
     * The default value is "low".
     * Set false that use pixel art
     * ```
     * setQuality( "low" "medium" "high" )
     * ```
     *
     * @param quality {String|boolean} - "low" "medium" "high"
     */
    setQuality(quality = 'low') {
        if (quality === false) {
            this.ctx.imageSmoothingEnabled = false;
        } else {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = ["low", "medium", "high"].includes(quality) ? quality : 'low';
        }
    }

    attachTo(parent = document.body) {
        parent.appendChild(this.canvas);
    }

    detach(parent = document.body) {
        parent.removeChild(this.canvas);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    update(delta, camera, iterator) {

    }

    draw(ctx, camera) {

    }

    setGraphic(style = {}) {
        this.gfx = new Graphic(this.ctx, Graphic.StyleEbby);

        if (Ut.len(style))
            this.gfx.mixContextParams(style)

        return this.gfx ;
    }
}

