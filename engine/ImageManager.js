import {Vector2} from "./canvas2d/Vector2.js";
import {ICommander} from "./ICommander.js";
import {Ut} from "./Ut.js";


export class Sprite {
    constructor({ image, x = 0, y = 0, angle = 0, scale = 1, frame = null }) {
        this.image = image;
        this.position = new Vector2(x, y);
        this.angle = angle;
        this.scale = scale;
        this.frame = frame; // Optional: Canvas or sub-image
    }

    draw(ctx) {
        const img = this.frame ?? this.image;
        if (!img) return;
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        ctx.scale(this.scale, this.scale);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();
    }
}


export class ImageManager extends ICommander {
    constructor(register, props = {}) {
        super(register)
        this.images = props?.images ?? new Map();
        this.cache = new Map();
    }

    configured(params) {
        this.props = params || {};
        this.images = params?.images && Ut.isObject(params?.images)
            ? new Map(params.images)
            : this.images;
    }

    async load(name, url) {
        const img = await this._loadImage(url);
        this.images.set(name, img);
        return img;
    }

    async loadMany(imagesMap) {
        const promises = Object.entries(imagesMap).map(([name, url]) =>
            this.load(name, url)
        );
        return Promise.all(promises);
    }

    get(name) {
        return this.cache.has(name) || this.images.has(name)  || null;
    }

    has(name) {
        return !!(this.images.has(name) || this.cache.has(name));
    }

    cacheTransformed(name, { scale = 1, rotate = 0 } = {}) {
        const key = `${name}:${scale}:${rotate}`;
        if (this.cache.has(name)) return this.cache.get(name);

        const source = this.images.get(name);
        if (!source) return null;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const w = source.width * scale;
        const h = source.height * scale;
        canvas.width = w;
        canvas.height = h;

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rotate);
        ctx.translate(-w / 2, -h / 2);
        ctx.drawImage(source, 0, 0, w, h);
        ctx.restore();

        this.cache.set(key, canvas)
        return canvas;
    }

    sliceGrid(name, cols, rows) {
        const key = `${name}@grid(${cols}x${rows})`;
        if (this.cache.has(key)) return this.cache.get(key);

        const img = this.images.get(name);
        if (!img) return [];

        const frames = [];
        const frameWidth = img.width / cols;
        const frameHeight = img.height / rows;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const canvas = document.createElement('canvas');
                canvas.width = frameWidth;
                canvas.height = frameHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(
                    img,
                    x * frameWidth, y * frameHeight,
                    frameWidth, frameHeight,
                    0, 0, frameWidth, frameHeight
                );
                frames.push(canvas);
            }
        }

        this.cache.set(key, frames)
        return frames;
    }

    clipImage(name, rect) {
        const key = `${name}@clip(${rect.x},${rect.y},${rect.w},${rect.h})`;
        if (this.cache.has(key)) return this.cache.get(key);

        const src = this.images.get(name);
        if (!src) return null;

        const canvas = document.createElement('canvas');
        canvas.width = rect.w;
        canvas.height = rect.h;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(src, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

        this.cache.set(key, canvas)
        return canvas;
    }

    maskImage(baseName, maskName) {
        const key = `${baseName}@mask(${maskName})`;
        if (this.cache.has(key)) return this.cache.get(key);

        const base = this.images.get(baseName);
        const mask = this.images.get(maskName);
        if (!base || !mask) return null;

        const w = base.width;
        const h = base.height;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');


        ctx.drawImage(base, 0, 0);


        const baseData = ctx.getImageData(0, 0, w, h);
        const maskCtx = document.createElement('canvas').getContext('2d');
        maskCtx.canvas.width = w;
        maskCtx.canvas.height = h;
        maskCtx.drawImage(mask, 0, 0, w, h);
        const maskData = maskCtx.getImageData(0, 0, w, h);


        const bd = baseData.data;
        const md = maskData.data;
        for (let i = 0; i < bd.length; i += 4) {
            bd[i + 3] = md[i]; // альфа з маски (можеш змінити на i+3 для альфи)
        }

        ctx.putImageData(baseData, 0, 0);

        this.cache.set(key, canvas);
        return canvas;
    }

    clearCache() {
        this.cache = {};
    }

    _loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
}
