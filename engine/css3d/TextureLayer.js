
export class TextureLayer {
    constructor(src, options = {}) {
        this.src = src;
        this.options = {
            position: options.position || "center center",
            size: options.size || "cover",
            repeat: options.repeat || "no-repeat",
            origin: options.origin || "padding-box",
            clip: options.clip || "border-box",
            attachment: options.attachment || "scroll",
            blendMode: options.blendMode || "normal",
            color: options.color || "transparent",
        };
    }

    setPosition(x, y) { this.options.position = `${x} ${y}`; return this; }
    setSize(w, h) { this.options.size = `${w} ${h}`; return this; }
    setRepeat(v) { this.options.repeat = v; return this; }
    setOrigin(v) { this.options.origin = v; return this; }
    setClip(v) { this.options.clip = v; return this; }
    setBlendMode(v) { this.options.blendMode = v; return this; }
    setColor(v) { this.options.color = v; return this; }

    toCSS() {
        return {
            "background-image": `url(${this.src})`,
            "background-position": this.options.position,
            "background-size": this.options.size,
            "background-repeat": this.options.repeat,
            "background-origin": this.options.origin,
            "background-clip": this.options.clip,
            "background-attachment": this.options.attachment,
            "background-blend-mode": this.options.blendMode,
            "background-color": this.options.color,
        };
    }

    toJSON() {
        return {
            src: this.src,
            options: { ...this.options },
        };
    }

    static fromJSON(data) {
        return new TextureLayer(data.src, data.options);
    }
}