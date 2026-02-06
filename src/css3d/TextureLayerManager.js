import {TextureLayer} from "./TextureLayer.js";


export class TextureLayerManager {
    constructor() {
        this.layers = new Set();
    }

    addLayer(layer) {
        this.layers.add(layer);
        return this;
    }

    removeLayer(layer) {
        this.layers.delete(layer);
        return this;
    }

    clear() {
        this.layers.clear()
        return this;
    }

    getCombinedStyle() {
        const combine = prop =>
            [...this.layers].map(l => l.toCSS()[prop]).join(", ");

        return {
            "background-image": combine("background-image"),
            "background-position": combine("background-position"),
            "background-size": combine("background-size"),
            "background-repeat": combine("background-repeat"),
            "background-origin": combine("background-origin"),
            "background-clip": combine("background-clip"),
            "background-attachment": combine("background-attachment"),
            "background-blend-mode": combine("background-blend-mode"),
            "background-color": [...this.layers].at(-1)?.toCSS()["background-color"] || "transparent",
        };
    }

    applyToElement(el) {
        const style = this.getCombinedStyle();
        for (const [key, value] of Object.entries(style)) {
            el.style[key] = value;
        }
    }

    toJSON() {
        return this.layers.map(layer => layer.toJSON());
    }

    static fromJSON(dataArray) {
        const manager = new TextureLayerManager();
        dataArray.forEach(d => manager.addLayer(TextureLayer.fromJSON(d)));
        return manager;
    }
}