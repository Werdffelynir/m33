
// depricated block
window.PI = Math.PI;
window.PI2 = Math.PI * 2;
window.cos = (v) => Math.cos(v);
window.sin =  (v) => Math.sin(v);
window.atan2 = (y, x) => Math.atan2(y, x);

/**
 * ```
 * direction: "rtl" | "ltr" | "inherit"
 * font: "bold 14px/1 sans, sans-serif, Ubuntu" | "italic small-caps bold 16px/2 cursive" | "bold italic large serif" | "caption" | "120% sans-serif"
 * textAlign: "center" | "end" | "left" | "right" | "start"
 * textBaseline: "alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top"
 * lineCap: "round" | "butt" | "square"
 * lineJoin: "round" | "bevel" | "miter"
 * lineWidth: 1 | 5
 * lineDashOffset: 0
 * letterSpacing: "0px" | "20px"
 * wordSpacing: "0px" | "20px"
 * miterLimit: 10
 * fillStyle: "orange" | "#000000" | "rgb(255, 0, 110)" | "rgba(255, 0, 110, 0.4)"
 * strokeStyle: "orange" | "#000000" | "rgb(255, 0, 110)" | "rgba(255, 0, 110, 0.4)"
 * shadowColor: "orange" | "#000000" | "rgb(255, 0, 110)" | "rgba(255, 0, 110, 0.4)"
 * shadowOffsetX: 0
 * shadowOffsetY: 0
 *
 * ```
 *
 * @param {{GraphicContextStyles}} params
 */
export class Graphic {

    /**@type {CanvasRenderingContext2D|null} */
    ctx = null;

    /**
     *
     * @param ctx {CanvasRenderingContext2D}
     * @param styleParams {any} Graphic.StyleEbby
     */
    constructor(ctx, styleParams = {}) {
        this.ctx = ctx; // ctx instanceof HTMLCanvasElement ? ctx.getContext('2d') : ctx; ctx instanceof HTMLCanvasElement ? ctx :
        this.canvas = ctx.canvas;
        this.contextState = {};
        this.mixContextParams(GraphicContextState);

        if(styleParams)
            this.mixContextParams(styleParams);
    }

    width() {
        return this.canvas.width;
    }

    height() {
        return this.canvas.height;
    }

    image(img, x = 0, y = 0) {
        this.ctx.drawImage.apply(this.ctx, arguments.length === 1 ? [img, x, y] : arguments)
        return this;
    }

    pattern(img, repetition = "no-repeat") {
        return this.ctx.createPattern(img, repetition)
    }

    /**
     * ```
     * gfx.filter( 'blur(3)' )
     * gfx.filter( 'brightness(90)' )
     * gfx.filter( 'contrast(90)' )
     * gfx.filter( 'saturate(90)' )
     * gfx.filter( 'sepia(90)' )
     * gfx.filter( 'grayscale(90)' )
     * gfx.filter( 'invert(50)' )
     * ```
     * ```
     * none
     * url()
     * blur() <length> 0
     * brightness() <percentage> 100%
     * contrast() <percentage> 100%
     * drop-shadow() <offset-x> <offset-y> <blur-radius> <color> '2 2 4 red'
     * grayscale() <percentage> 100%
     * hue-rotate() <angle> 0deg
     * invert() <percentage> 100%
     * opacity() <percentage> 100%
     * saturate() <percentage> 100%
     * sepia() <percentage> 100%
     * ```
     * @returns {string}
     */
    filter(filterString) {
        const _fus = ['none', 'blur', 'brightness', 'contrast', 'drop', 'grayscale', 'hue',
            'invert', 'opacity', 'saturate', 'sepia',];

        return this.ctx.filter = filterString;
    }

    shadow(x, y, blur, color) {
        this.ctx.shadowOffsetX = x;
        this.ctx.shadowOffsetY = y;
        this.ctx.shadowBlur = blur;
        this.ctx.shadowColor = color;
        return this;
    }

    clearShadow() {
        this.ctx.shadowOffsetX = this.ctx.shadowOffsetY = this.ctx.shadowBlur = 0;
        return this;
    }

    ellipse(x, y, radiusX, radiusY, rotation = 0, startAngle = 0, endAngle = 2 * Math.PI, anticlockwise = false, closePath = false) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.scale(radiusX / radiusY, 1);
        this.ctx.arc(0, 0, radiusY, startAngle, endAngle, this.anticlockwise = anticlockwise);
        this.ctx.restore();
        if (closePath)
            this.ctx.closePath();

        return this;
    }

    /**
     * ```
     * gfx.circle(300, 300, 50);
     * gfx.stroke()
     * gfx.stroke('#cc4422')
     * gfx.fill()
     * ```
     * @param x
     * @param y
     * @param radius
     * @returns {Graphic}
     */
    circle(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        return this;
    }

    /**
     * ```
     * roundRect(x, y, width, height, radius)
     * gfx.roundRect(10, 20, 150, 100, 0);
     * gfx.roundRect(10, 20, 150, 100, [40]);
     * gfx.roundRect(10, 150, 150, 100, [10, 40]);
     * gfx.roundRect(400, 20, 200, 100, [0, 30, 50, 60]);
     * gfx.roundRect(400, 150, -200, 100, [0, 30, 50, 60]);
     * ```
     * @param x
     * @param y
     * @param width
     * @param height
     * @param radius
     */
    rectRound(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, radius);
        return this;
    }

    /**
     * ```
     * rect(x, y, width, height, '#fa3cc2');        // draw fill rect
     * rect(x, y, width, height, '#fa3cc2', true);  // draw stroke rectangle
     * ```
     * @param x
     * @param y
     * @param width
     * @param height
     * @param style
     * @param asStroke
     * @returns {Graphic}
     */
    rect(x, y, width, height, style = null, asStroke = false) {
        if (style !== null) {
            if (asStroke) this.ctx.strokeStyle = style;
            else this.ctx.fillStyle = style;
        }

        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);

        if (style !== null) {
            if (asStroke) this.ctx.stroke();
            else this.ctx.fill();
        }
        return this;
    }

    line(x1, y1, x2, y2) {
        // this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        return this;
    }

    // todo
    _ctxStack = new Map();

    /**
     * ```
     * const g = new Graphic(ctx);
     *
     * g.ctxDo('fillStyle', 'red');
     * ctx.fillRect(0, 0, 100, 100);
     * g.ctxBack('fillStyle');
     *
     * // ctxWith (блоковий стиль)
     * g.ctxWith('strokeStyle', 'blue', () => {
     *     ctx.strokeRect(0, 0, 100, 100);
     * });
     *
     * // або скинути всі змінені властивості одразу
     * g.ctxBackAll();
     * ```
     * @param prop
     * @param value
     */
    ctxDo(prop, value) {
        if (!this._ctxStack.has(prop)) {
            this._ctxStack.set(prop, this.ctx[prop]); // зберігаємо тільки перше значення
        }
        if (this.ctx[prop] !== value) {
            this.ctx[prop] = value;
        }
    }
    ctxBack(prop) {
        if (this._ctxStack.has(prop) && this._ctxStack.get(prop) !== this.ctx[prop]) {
            this.ctx[prop] = this._ctxStack.get(prop);
            this._ctxStack.delete(prop);
        }
    }
    ctxWith(prop, value, fn) {
        const old = this.ctx[prop];
        this.ctx[prop] = value;
        fn(this.ctx, prop, value);
        this.ctx[prop] = old;
    }
    // якщо хочеш скинути все одразу (наприклад, після завершення малювання)
    ctxBackAll() {
        for (const [prop, oldValue] of this._ctxStack) {
            this.ctx[prop] = oldValue;
        }
        this._ctxStack.clear();
    }
    // graphic.ctxPush({ fillStyle: 'red', font: '20px sans-serif' });
    ctxPush(props) {
        for (const [prop, value] of Object.entries(props)) {
            this.ctxDo(prop, value);
        }
    }
    // graphic.ctxPop({ fillStyle: true, font: true });
    ctxPop(props) {
        for (const prop of Object.keys(props)) {
            this.ctxBack(prop);
        }
    }

    /**
     * Line thickness `lineWidth`
     */
    bold(n = 4) {
        this.ctx.lineWidth = n
        return this;
    }

    // todo
    fill(color) {
        if (color) this.ctxDo('fillStyle', color);   // if(color) this.fillStyle = color;
        this.ctx.fill();
        if (color) this.ctxBack('fillStyle');
        return this;
    }

    stroke(strokeStyle, lineWidth = null) {
        if (strokeStyle) this.ctxDo('strokeStyle', strokeStyle);
        if (lineWidth !== null) this.ctxDo('lineWidth', lineWidth);

        this.ctx.stroke();

        if (strokeStyle) this.ctxBack('strokeStyle');
        if (lineWidth !== null) this.ctxBack('lineWidth');

        return this;
    }

/*
    strokeOld(strokeStyle, lineWidth) {
        const ctx = this.ctx;
        if (strokeStyle) ctx.strokeStyle = strokeStyle;
        if (lineWidth) ctx.lineWidth = lineWidth;
        ctx.stroke();
        return this;
    }
*/

    /**
     * todo: changed
     * ```
     *  .shape( [ x1, y1, x2, y2, ... ] )
     *
     *  .shape( [ x1, y1, x2, y2, ... ], x, y )
     *
     *  .shape( [ x1, y1, x2, y2, ... ], x, y, angle )
     * ```
     * @param points {[]}
     * @param x {number}
     * @param y {number}
     * @param rotate {number}
     * @returns {Graphic}
     */
    shape(points, x, y, rotate) {
        const len = points.length;
        const trans = x !== undefined && y !== undefined;

        if (len < 4)
            throw new Error('Minimum 2 point (x1, y1, x2, y2)');

        const ctx = this.ctx;

        if (trans) {
            ctx.save();
            ctx.translate(x, y);
        }

        if (rotate !== undefined) ctx.rotate(rotate);

        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);

        for (let i = 2; i < len; i += 2) {
            ctx.lineTo(points[i], points[i + 1]);
        }

        if (trans) {
            ctx.restore();
        }

        return this;
    }

    shapeSmooth(pointsArray, smoothing = 0.2) {
        const len = pointsArray.length;
        if (len < 4) return; // Мінімум дві точки

        const ctx = this.ctx;

        const getPoint = (i) => [pointsArray[i], pointsArray[i + 1]];

        ctx.beginPath();

        let [x0, y0] = getPoint(0);
        ctx.moveTo(x0, y0);

        for (let i = 2; i < len - 2; i += 2) {
            let [x1, y1] = getPoint(i);
            let [x2, y2] = getPoint(i + 2);

            // Обчислюємо контрольну точку між x1 і x2
            const ctrlX = x1 + (x2 - x0) * smoothing;
            const ctrlY = y1 + (y2 - y0) * smoothing;

            ctx.quadraticCurveTo(x1, y1, ctrlX, ctrlY);

            x0 = x1;
            y0 = y1;
        }

        // Малюємо останній відрізок як лінію
        const [xLast, yLast] = getPoint(len - 2);
        ctx.lineTo(xLast, yLast);

        // ctx.closePath(); // Якщо потрібно замикати форму
    }

    begin() {
        this.ctx.beginPath();
        return this;
    }

    close() {
        this.ctx.closePath();
        return this;
    }

    /**
     * ```
     * styles = {
     *  lineWidth: 0.1,
     *  fillStyle: colors.cc5,
     *  font: Graphic.TEXT_FONT.NORMAL,
     *  wordSpacing: '10px',
     *  shadowColor: 'orange',
     *  shadowOffsetX: 1,
     *  shadowOffsetY: 1,
     * }
     * ```
     * @returns {Graphic}
     */
    text(text, x, y, styles = null, asStroke = false) {
        if (styles && typeof styles === 'object') {
            this.mixContextParams(styles);
        }

        if (asStroke) {
            this.ctx.strokeText(text, x, y);
        } else {
            this.ctx.fillText(text, x, y);
        }

        return this;
    }

    /**
     * @param fontCaps {string} - small-caps all-small-caps petite-caps all-petite-caps unicase titling-caps
     */
    fontCaps(fontCaps= 'petite-caps'){
        this.ctx.fontVariantCaps = fontCaps ?? 'normal';
    }

    clear(x = 0, y = 0, width = this.width(), height = this.height()) {
        this.ctx.clearRect(x, y, width, height);
    }

    save() {
        // this.memory.
        this.ctx.save();
    }

    restore() {
        this.ctx.restore();
        this.ctx.resetTransform();
    }

    rotate(angle) {
        this.ctx.rotate(angle);
    }

    reset() {
        this.ctx.reset();
    }

    getPixelColor(x, y) {
        if (arguments.length === 1 && x.x !== undefined && x.y !== undefined) {
            y = x.y;
            x = x.x;
        }

        const imageData = this.ctx.getImageData(x, y, 1, 1);

        return {
            red: imageData.data[0],
            green: imageData.data[1],
            blue: imageData.data[2],
            alpha: imageData.data[3],
            isTransparent() {
                return imageData.data[3] === 0
            },
            toRGB() {
                return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`
            },
            toHEX() {
                return this.convertRGBtoHEX(imageData.data[0], imageData.data[1], imageData.data[2])
            },
        }
    }

    area(callback, x = 0, y = 0, r = null) {
        this.ctx.save();
        this.ctx.translate(x, y);
        if (r !== null) this.ctx.rotate(r);
        callback.call(this, this.ctx);
        this.ctx.restore();
    }

    region(callback, tX = null, tY = null, a = null, sX = null, sY = null) {
        this.ctx.save();
        if (tX !== null && tY !== null) this.ctx.translate(tX, tY);
        if (a !== null) this.ctx.rotate(a);
        if (sX !== null && sY !== null) this.ctx.scale(sX, sY);
        callback(this, this.ctx);
        this.ctx.restore();
    }

    onClick(callback) {
        this.mouse.watched = true;
        this.mouse.callback = callback;
        this.canvas.addEventListener('click', this.mouse.mouseevent);
    }

    mouse = {
        gfx: this,
        watched: false,
        callback: null,
        mouseevent: (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = Math.round(e.clientX - rect.left);
            this.mouse.y = Math.round(e.clientY - rect.top);
            if (this.mouse.callback) this.mouse.callback(this.mouse.x, this.mouse.y);
        },
        set watch(value) {
            if (!!value) {
                this.gfx.onClick();
            } else {
                this.gfx.canvas.removeEventListener('click', this.mouseevent);
            }
        },
        x: 0,
        y: 0,
    }

    /**
     *
     * .clip({ x:0, y:0 }, function (graphic, context) {});
     * @param {function(Graphic: *, CanvasRenderingContext2D: context) | Object} that
     * @param {function(Graphic: *, CanvasRenderingContext2D: context)} callback
     * @returns {*&{clear(),draw()}}
     */
    clip(that, callback = (graphic, context) => {
    }) {
        if (arguments.length === 1) {
            callback = that;
            that = {};
        }

        that.clear = () => {
            this.ctx.clearRect(0, 0, 2000, 2000)
        }
        that.draw = (re_callback = undefined) => {
            if (re_callback && re_callback !== callback)
                callback = re_callback;

            this.ctx.save();
            callback.call(that, this, this.ctx);
            this.ctx.restore();
        }

        that.draw();

        return that;
    }

    /**
     * ```
     * .mixContextParams({
     *      lineWidth: ,
     *      fillStyle: ,
     *      strokeStyle: ,
     * })
     * .mixContextParams({
     *      lineWidth: ,
     *      fillStyle: ,
     *      font: ,
     *      textAlign: ,
     *      textBaseline: ,
     *      direction: ,
     * })
     * direction: "rtl" | "ltr" | "inherit"
     * font: "bold 14px/1 sans, sans-serif, Ubuntu" | "italic small-caps bold 16px/2 cursive" | "bold italic large serif" | "caption" | "120% sans-serif"
     * textAlign: "center" | "end" | "left" | "right" | "start"
     * textBaseline: "alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top"
     * lineCap: "round" | "butt" | "square"
     * lineJoin: "round" | "bevel" | "miter"
     * lineWidth: 1 | 5
     * lineDashOffset: 0
     * letterSpacing: "0px" | "20px"
     * wordSpacing: "0px" | "20px"
     * miterLimit: 10
     * fillStyle: "orange" | "#000000" | "rgb(255, 0, 110)" | "rgba(255, 0, 110, 0.4)"
     * strokeStyle: "orange" | "#000000" | "rgb(255, 0, 110)" | "rgba(255, 0, 110, 0.4)"
     * shadowColor: "orange" | "#000000" | "rgb(255, 0, 110)" | "rgba(255, 0, 110, 0.4)"
     * shadowOffsetX: 0
     * shadowOffsetY: 0
     * ```
     *
     * @param {{GraphicContextStyles}} params
     */
    mixContextParams(params) {
        const ctx = this.ctx;
        Object.keys(params).forEach((key) => {
            if (GraphicContextState.hasOwnProperty(key) && params[key] !== ctx[key]) {
                ctx[key] = this.contextState[key] = params[key];
            }
        });
    }

    // contextParams

    convertRGBtoHEX(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }


}


Graphic.LINE_CAPS = {BUTT: "butt", ROUND: "round", SQUARE: "square"};
Graphic.LINE_JOINS = {BEVEL: "bevel", ROUND: "round", MITER: "miter"};
Graphic.TEXT_ALIGN = {CENTER: "center", END: "end", LEFT: "left", RIGHT: "right", START: "start"};
Graphic.TEXT_BASELINE = {
    ALPHABETIC: "alphabetic",
    BOTTOM: "bottom",
    HANGING: "hanging",
    IDEOGRAPHIC: "ideographic",
    MIDDLE: "middle",
    TOP: "top"
};
Graphic.TEXT_FONT = {
    SMALL: "normal 11px sans, Ubuntu",
    NORMAL: "normal 14px sans, Ubuntu",
    BOLD: "bold 14px sans, Ubuntu",
    ITALIC: "italic 14px sans, Ubuntu",
    BOLD_ITALIC: "bold italic 14px sans, serif, sans-serif",
    SMALL_CAPS: "small-caps normal 14px cursive, serif, sans-serif",
    ITALIC_SMALL_CAPS: "italic small-caps bold 14px/2 cursive, serif, sans-serif",
    ITALIC_LARGE_CAPS: "italic small-caps bold 16px/2 cursive, serif, sans-serif",
    CAPTION: "caption",
    STATUSBAR: "status-bar",
};
Graphic.TEXT_DEFAULT = {
    x: 10,
    y: 10,
    text: '',
    fontFamily: 'sans-serif, sans, Ubuntu',
    font: 'normal 14px sans-serif',
    color: '#000000',
    align: 'left',
    baseline: 'top',
    thickness: false,
    alpha: false,
};
Graphic.StyleDefault = {
    fontFamily: 'sans, sans-serif, Ubuntu',
    lineWidth: 1,
    fillStyle: '#243342',   // var(--cc13)
    strokeStyle: '#516985', // var(--cc6)
};
Graphic.StyleMono = {
    fontFamily: 'monospace, "Roboto Mono", "FreeMono", "Consolas", "SF Mono"',
    font: 'normal 14px '+ 'monospace, "Roboto Mono", "FreeMono", "Consolas", "SF Mono"',
    textAlign: "start",
    textBaseline: "top",
    fontVariantCaps: "normal", // small-caps all-small-caps petite-caps all-petite-caps unicase titling-caps
    globalAlpha: 1,
    lineWidth: 1,
    fillStyle: '#243342',   // var(--cc13)
    strokeStyle: '#516985', // var(--cc6)
};
Graphic.StyleEbby = {
    fontFamily: '"DejaVu Sans", "Droid Sans Fallback", sans, sans-serif, Ubuntu',
    font: 'bold 14px/1 "DejaVu Sans", "Droid Sans Fallback", sans, sans-serif, Ubuntu' ,
    lineWidth: 4,
    textAlign: 'left',
    textBaseline: 'top',
    fillStyle: '#243342',   // var(--cc13)
    strokeStyle: '#516985', // var(--cc6)
}

const GraphicContextState = {
    direction: "ltr",
    fillStyle: "#000000",
    filter: "none",
    // none
    // url()
    // blur() <length> 0
    // brightness() <percentage> 100%
    // contrast() <percentage> 100%
    // drop-shadow() <offset-x> <offset-y> <blur-radius> <color> '2 2 4 red'
    // grayscale() <percentage> 100%
    // hue-rotate() <angle> 0deg
    // invert() <percentage> 100%
    // opacity() <percentage> 100%
    // saturate() <percentage> 100%
    // sepia() <percentage> 100%
    font: "14px sans-serif",                //  bold 48px serif, 12px/14px bold sans-serif
    fontKerning: "auto",
    fontStretch: "normal",                  // normal (default), ultra-condensed, extra-condensed, condensed, semi-condensed, semi-expanded, expanded, extra-expanded, ultra-expanded.
    fontVariantCaps: "normal",              // small-caps all-small-caps petite-caps all-petite-caps unicase titling-caps
    globalAlpha: 1,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "low",           // Setting image smoothing quality "high" "medium" "low". The default value is "low".
    letterSpacing: "0px",
    lineCap: "butt",
    lineDashOffset: 0,
    lineJoin: "miter",
    lineWidth: 1,
    miterLimit: 10,
    shadowBlur: 0,
    shadowColor: "rgba(0, 0, 0, 0)",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    strokeStyle: "#000000",
    textAlign: "start",                 // start (default) left right center end
    textBaseline: "alphabetic",         // alphabetic (default) top hanging middle ideographic bottom
    textRendering: "auto",              // optimizeSpeed optimizeLegibility geometricPrecision
    wordSpacing: "0px",
};
// const styleLine = ['wave', 'ridge', 'outset', 'inset', 'groove', 'double', 'dotted', 'dot-dot-dash', 'dot-dash', 'solid', 'dashed'];


/*
const GraphicContext2DPrototype = {
    canvas: 'canvas#canvas1',
    direction: "ltr",
    fillStyle: "#000000",
    filter: "none", 						   // none filter: "blur()"
// . . . . . . . . . . . . . . . . . . . . . . url()
// . . . . . . . . . . . . . . . . . . . . . . blur() <length> 0
// . . . . . . . . . . . . . . . . . . . . . . brightness() <percentage> 100%
// . . . . . . . . . . . . . . . . . . . . . . contrast() <percentage> 100%
// . . . . . . . . . . . . . . . . . . . . . . drop-shadow() <offset-x> <offset-y> <blur-radius> <color> '2 2 4 red'
// . . . . . . . . . . . . . . . . . . . . . . grayscale() <percentage> 100%
// . . . . . . . . . . . . . . . . . . . . . . hue-rotate() <angle> 0deg
// . . . . . . . . . . . . . . . . . . . . . . invert() <percentage> 100%
// . . . . . . . . . . . . . . . . . . . . . . opacity() <percentage> 100%
// . . . . . . . . . . . . . . . . . . . . . . saturate() <percentage> 100%
// . . . . . . . . . . . . . . . . . . . . . . sepia() <percentage> 100%
    font: "14px sans-serif",
// . . . . . . . . . . . . . . . . . . . . . . bold 48px serif, 12px/14px bold sans-serif
    fontKerning: "auto",
    fontStretch: "normal",
// . . . . . . . . . . . . . . . . . . . . . . normal (default), ultra-condensed, extra-condensed, condensed, semi-condensed, semi-expanded, expanded, extra-expanded, ultra-expanded.
    fontVariantCaps: "normal",
// . . . . . . . . . . . . . . . . . . . . . . small-caps all-small-caps petite-caps all-petite-caps unicase titling-caps
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
// . . . . . . . . . . . . . . . . . . . . . . use docs
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "low",
// . . . . . . . . . . . . . . . . . . . . . . low medium high
    letterSpacing: "0px",
    lineCap: "butt",
// . . . . . . . . . . . . . . . . . . . . . . butt round square
    lineDashOffset: 0,
    lineJoin: "miter",
// . . . . . . . . . . . . . . . . . . . . . . round bevel miter
    lineWidth: 1,
    miterLimit: 10,
    shadowBlur: 0,
    shadowColor: "rgba(0, 0, 0, 0)",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    strokeStyle: "#000000",
    textAlign: "start",
// . . . . . . . . . . . . . . . . . . . . . . start (default) left right center end
    textBaseline: "alphabetic",
// . . . . . . . . . . . . . . . . . . . . . . alphabetic (default) top hanging middle ideographic bottom
    textRendering: "auto",
// . . . . . . . . . . . . . . . . . . . . . . optimizeSpeed optimizeLegibility geometricPrecision
    wordSpacing: "0px",

// . . . . . . . . . . . . . . . . . . . . . . prototype
    arc: 'function',
    arcTo: 'function',
    beginPath: 'function',
    bezierCurveTo: 'function',
    clearRect: 'function',
    clip: 'function',
    closePath: 'function',
    createConicGradient: 'function',
    createImageData: 'function',
    createLinearGradient: 'function',
    createPattern: 'function',
    createRadialGradient: 'function',
    drawFocusIfNeeded: 'function',
    drawImage: 'function',
    ellipse: 'function',
    fill: 'function',
    fillRect: 'function',
    fillText: 'function',
// . . . . . . . . . . . . . . . . . . . . . . (text, x, y) (text, x, y, maxWidth)
    getContextAttributes: 'function',
    getImageData: 'function',
    getLineDash: 'function',
    getTransform: 'function',
    isContextLost: 'function',
    isPointInPath: 'function',
    isPointInStroke: 'function',
    lineTo: 'function',
    measureText: 'function',
    moveTo: 'function',
    putImageData: 'function',
    quadraticCurveTo: 'function',
    rect: 'function',
    reset: 'function',
    resetTransform: 'function',
    restore: 'function',
    rotate: 'function',
    roundRect: 'function',
    save: 'function',
    scale: 'function',
    setLineDash: 'function',
    setTransform: 'function',
// . . . . . . . . . . . . . . . . . . . . . . (a, b, c, d, e, f) (m11 m12 m21 m22 m41 m42) (matrix)
// . . . . . . . . . . . . . . . . . . . . . . (1, 0, 0, 1, 0, 0)
    stroke: 'function',
    strokeRect: 'function',
    strokeText: 'function',
    transform: 'function',
    translate: 'function',
};


    font: caption 14px "Roboto", "Liberation Sans Narrow",
    font: caption;
    font: full-width;
    font: ordinal;
    font: petite-caps;
    font: large;
    font: small;
    font: small-caps;
    font: small-caption;
    font: condensed;
    font: expanded;
    font: statusbar;
    font: sub;
    font: italic;
    font: traditional;

*/