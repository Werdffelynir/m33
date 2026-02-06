import createElement from "../../static/createElement";
import str2node from "../../static/str2node";
import typeOfStrict from "../../static/typeOfStrict";

class Tileset {
    #tile
    #tile_width
    #tile_height
    #sprite_width
    #sprite_height

    constructor(tile, sprite_width = 32, sprite_height = 32) {
        this.#tile = tile;
        this.#tile_width = tile.width;
        this.#tile_height = tile.height;
        this.#sprite_width = sprite_width;
        this.#sprite_height = sprite_height;
    }

    canvasCopy(canvas) {
        const tmp_canvas = document.createElement('canvas');
        tmp_canvas.width = canvas.width
        tmp_canvas.height = canvas.height
        tmp_canvas.getContext('2d').fillStyle = canvas.getContext('2d').createPattern(canvas, "no-repeat");
        tmp_canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
        return tmp_canvas;
    }

    /**
     *
     * <pre>
     * const sprite = tileset.index(1, {
     *     width: 48,
     *     height: 48,
     *     rotate: 45,
     *     scale: 0,
     *     flip_vertical: true,
     *     flip_horizontal: true,
     *     callback: // @param {CanvasRenderingContext2D} context // function (context) {},
     * });
     * <pre>
     * @param idx
     * @param options
     * @returns {HTMLCanvasElement}
     */
    index(idx, options = {}) {
        const width = options.width ?? this.#sprite_width;
        const height = options.height ?? this.#sprite_height;
        const rotate = options.rotate ?? 0;
        const scale = options.scale ?? 0;
        const flip_vertical = options.flip_vertical ?? false;
        const flip_horizontal = options.flip_horizontal ?? false;
        const callback = options.callback ?? null;
        const indexes = this.tilemap();
        idx = parseInt(idx);
        for (let i = 0; i < indexes.length; i++) {
            if (idx !== i) continue;
            return this.position(indexes[i].x, indexes[i].y, width, height, /**@param {CanvasRenderingContext2D} context*/(context) => {
                if (rotate) {
                    const tmp = this.canvasCopy(context.canvas);
                    context.save();
                    context.clearRect(0, 0, width, height);
                    context.translate(width / 2, height / 2);
                    context.rotate(rotate * Math.PI / 180);
                    context.drawImage(tmp, 0, 0, width, height, -width / 2, -height / 2, width, height);
                    context.restore();
                }
                if (scale) {
                    const scaleX = Array.isArray(scale) ? scale[0] : scale;
                    const scaleY = Array.isArray(scale) ? scale[1] : scale;
                    const patter = context.createPattern(context.canvas, "no-repeat");
                    context.canvas.width = scaleX * context.canvas.width;
                    context.canvas.height = scaleX * context.canvas.height;
                    context.save();
                    context.clearRect(0, 0, width, height);
                    context.scale(scaleX, scaleY);
                    context.fillStyle = patter;
                    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
                    context.restore();
                }
                if (flip_vertical) {
                    const tmp = this.canvasCopy(context.canvas);
                    context.clearRect(0, 0, width, height);
                    context.save();
                    context.scale(1, -1);
                    context.drawImage(tmp, 0, 0, width, height * -1);
                    context.restore();
                }
                if (flip_horizontal) {
                    const tmp = this.canvasCopy(context.canvas);
                    context.clearRect(0, 0, width, height);
                    context.save();
                    context.scale(-1, 1);
                    context.drawImage(tmp, 0, 0, width * -1, height);
                    context.restore();
                }
                if (callback) {
                    if (typeof callback === 'function') {
                        context.save();
                        callback.call(this, context);
                        context.restore();
                    }
                }
            })
        }
    }

    /**
     * @returns {*[]}
     */
    tilemap() {
        const result = [];
        const grid_width = this.#tile_width / this.#sprite_width;
        const grid_height = this.#tile_height / this.#sprite_height;
        let i = 0;
        let x = 0;
        let y = 0;
        let iw = 0;
        for (let ih = 0; ih < grid_height; ih++) {
            for (iw = 0; iw <= grid_width - 1; iw++, i++) {
                x = iw * this.#sprite_width;
                y = ih * this.#sprite_height;
                result[i] = {x: x, y: y, width: this.#sprite_width, height: this.#sprite_height, index: i};
            }
            iw = 0;
        }
        return result;
    }

    /**
     *
     * @param x
     * @param y
     * @param width
     * @param height
     * @param callback
     * @returns {HTMLCanvasElement}
     */
    position(x = 0, y = 0, width = this.#sprite_width, height = this.#sprite_height, callback = null) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(this.#tile, x, y, width, height, 0, 0, width, height);
        if (typeof callback === 'function') {
            context.save();
            callback.call(this, context);
            context.restore();
        }
        return canvas;
    }

    /**
     * await tileset.canvas2image(sprite_ach_2)
     * @param canvas
     * @returns {Promise<unknown>}
     */
    async canvas2image(canvas) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = canvas.toDataURL();
            image.width = this.#sprite_width;
            image.height = this.#sprite_height;
            image.onload = (event) => {
                resolve(image)
            }
            image.onerror = () => {
                reject({message: 'An error occurred while creating the image'});
                throw new Error("An error occurred while creating the image");
            }
        })
    }

    /**
     *
     * @param {HTMLCanvasElement | HTMLImageElement} source
     * @param width
     * @param height
     * @param {String} repeat       stretch | repeat | inherent
     * @returns {HTMLImageElement|HTMLCanvasElement}
     */
    resize(source, width, height, repeat = 'stretch') {
        if (source instanceof HTMLImageElement) {
            source.width = width;
            source.height = height;
            return source;
        }
        let x = 0;
        let y = 0;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        if (repeat === 'repeat') {
            context.fillStyle = context.createPattern(source, 'repeat');
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (repeat === 'stretch')
            context.drawImage(source, x, y, source.width, source.height, 0, 0, width, height);

        if (repeat === 'inherent')
            context.drawImage(source, x, y, width, height, 0, 0, width, height);

        return canvas;
    }

    /**
     * @deprecated
     * @returns {HTMLCanvasElement[]}
     */
    debug_sprite_list(withnumbers = true) {
        const sprites = [];
        const indexes = this.tilemap();
        for (let i = 0; i < indexes.length; i++) {
            const sprite = this.position(indexes[i].x, indexes[i].y);
            const ctx = sprite.getContext('2d');
            if (withnumbers) {
                ctx.fillStyle = 'rgba(255,255,255,0.4)'
                ctx.fillRect(2, 2, 20, 8)
                ctx.textBaseline = 'top'
                ctx.font = '10px'
                ctx.fillStyle = '#000'
                ctx.fillText(i, 2, 2);
            }
            indexes[i].sprite = sprite;
            sprite.details = indexes[i];
            sprites.push(sprite)
        }
        return sprites;
    }

    list(...args) {
        const sprites = [];
        const indexes = this.tilemap();
        for (let i = 0; i < indexes.length; i++) {
            if (args.length && !args.includes(i)) {
                continue;
            }
            const sprite = this.position(indexes[i].x, indexes[i].y);
            sprites.push(sprite)
        }
        return sprites;
    }


    tile() {
        return this.#tile;
    }

    /**
     * Decorator
     * <pre>
     * clip = tileset.moveclip( canvas, {
     *      x: 0,
     *      y: 0,
     *      width: 100,
     *      height: 100,
     *      styles: {color: 'white'},
     *      callback: () => {},
     * } )
     * clip.setStyle()
     * clip.setX()
     * clip.setY()
     * clip.setZ()
     * clip.move()
     * clip.serialize()
     * clip.resize()
     * </pre>
     * @param {Number, HTMLCanvasElement | HTMLImageElement | SVGSVGElement | HTMLElement} source
     * @param {{Number, Number, Number, Number, Number, callback}|null} options
     * @returns { Element | HTMLCanvasElement | HTMLImageElement | SVGSVGElement | HTMLElement | {setStyle(Object): setStyle, setX(Number): setX, setY(Number): setY, setZ(Number): setZ, move(Number, Number): move, serialize(): serialize, resize(Number, Number): resize, on(String, Function): on}}
     */
    moveclip(source, options = {}) {
        if (typeof source === 'number'){
            source = this.index(source);
        }
        return Tileset.createMoveclip(source, options);
    }

    static createMoveclip(source, options = {}) {
        const x = options.x ?? 0;
        const y = options.y ?? 0;
        const z = options.z ?? 0;
        const width = options.width ?? 0;
        const height = options.height ?? 0;

        // position: 'absolute'
        // position: 'relation'
        if (options.position) {
            source.style.position = options.position;
        }

        if (!source || source === 'canvas') {
            source = createElement('canvas', {width, height});
        }
        if (typeof source === 'string') {
            if(source === 'div') source = createElement('div');
            else source = str2node(source);
        }
        /**
         * @type {CSSStyleSheet|HTMLElement.style|CSSStyleDeclaration|*} styles
         */
        source.setStyle = function (styles) {
            Object.keys(styles).forEach((name) => {
                source.style[name] = styles[name];
            });
        }
        source.setX = function (n) {
            source.setStyle({marginLeft: n + 'px'});
        }
        source.setY = function (n) {
            source.setStyle({marginTop: n + 'px'});
        }
        source.setZ = source.deep = function (n) {
            source.setStyle({zIndex: n + ''});
        }
        source.move = function (x, y) {
            source.setX(x);
            source.setY(y);
        }
        source.on = function (event, callback) {
            source.addEventListener(event, callback);
        }

        source.serialize = function () {
            return (new XMLSerializer()).serializeToString(source);
        }

        source.resize = function (width, height) {
            const type = typeOfStrict(source);
            source.width = width;
            source.height = height;
            if (type === 'HTMLCanvasElement') {
                source.style.transform = `scale(${width / source.width}, ${height / source.height})`;
            }
            if (type === 'HTMLImageElement') {
                source.style.transform = `scale(${width / source.width}, ${height / source.height})`;
                source.style.width = width + 'px';
                source.style.height = height + 'px';
            }
            if (type === 'SVGSVGElement') {
                source.setAttribute('width', width + 'px');
                source.setAttribute('height', height + 'px');
            }
        }

        if ((width || height) && (width >= 0 || height >= 0) && (width !== source.width && height !== source.height )) {
            source.resize(width ? width : source.width, height ? height : source.height);
        }

        source.move(x, y);
        source.deep(z);

        if (options.styles) {
            source.setStyle(options.styles);
        }

        return source;
    }


    /**
     *
     * @param sprites
     * @param delay
     * @param once
     * @returns {{play(*=): void, stop(): void, loop(*): void, sprite: HTMLCanvasElement, getSprite(): HTMLCanvasElement}|HTMLCanvasElement}
     */
    animate(sprites, delay = 500, once = true) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = this.#sprite_width;
        canvas.height = this.#sprite_height;

        const imax = sprites.length - 1;
        let paused = false;
        let loop_callback = false;
        let loops = 0;
        let i = 0;
        const animation = () => {
            if (paused) return;

            const img = new Image();
            img.src = sprites[i].toDataURL();
            img.onload = () => {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0);
                if (typeof loop_callback === 'function')
                    loop_callback.call(context, canvas);
            }

            i++;
            if (i > imax) {
                loops ++;
                i = 0;
                if (once) {
                    paused = true;
                }
            }

            setTimeout(animation, delay)
        };

        return {
            canvas: canvas,
            sprite: canvas,
            play(loop = false) {
                paused = false;
                animation();
            },
            stop() { paused = true; },
            next() {
                this.play();
                this.stop();
            },
            getCanvas() { return canvas; },
            getSprite() {
                return canvas;
            },
            currentLootIteration() {
                return loops;
            },
            loop(callback) {
                loop_callback = callback;
            },
        }
    }

    create(tag, attrs, inner, styles) {
        return createElement(tag, attrs, inner, styles);
    }

}

export default Tileset;