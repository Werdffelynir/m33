
export class ColorPickerCanvas {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width || 100;
        this.height = canvas.height || 100;

        this.brightness = options.brightness ?? 1;
        this.saturationBoost = options.saturationBoost ?? 1;
        this.contrastBoost = options.contrastBoost ?? 1;

        this.selectedColor = null;

        this._drawPalette();
        canvas.addEventListener('click', (e) => this._handleClick(e));
    }

    _drawPalette() {
        const grad = this.ctx.createLinearGradient(0, 0, this.width, 0);
        for (let i = 0; i <= 360; i += 10) {
            grad.addColorStop(i / 360, `hsl(${i}, ${100 * this.saturationBoost}%, ${50 * this.brightness}%)`);
        }
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        const vGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        vGrad.addColorStop(0, 'rgba(255,255,255,0)');
        vGrad.addColorStop(1, `rgba(0,0,0,${1 - this.contrastBoost})`);
        this.ctx.fillStyle = vGrad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    _handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left));
        const y = Math.floor((e.clientY - rect.top));
        const [r, g, b] = this.ctx.getImageData(x, y, 1, 1).data;
        this.selectedColor = { r, g, b };
        console.log(this.selectedColor);
    }

    getColor() {
        return this.selectedColor;
    }

    getRGBColor() {
        const { r, g, b } = this.selectedColor || {};
        return r !== undefined ? `rgb(${r},${g},${b})` : null;
    }

    getRGBAColor() {
        const { r, g, b } = this.selectedColor || {};
        return r !== undefined ? `rgba(${r},${g},${b},1)` : null;
    }

    getHEXColor() {
        const { r, g, b } = this.selectedColor || {};
        if (r === undefined) return null;
        return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    }

    getHSLColor() {
        const { r, g, b } = this.selectedColor || {};
        if (r === undefined) return null;
        let [rNorm, gNorm, bNorm] = [r, g, b].map(v => v / 255);
        let max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
                case gNorm: h = (bNorm - rNorm) / d + 2; break;
                case bNorm: h = (rNorm - gNorm) / d + 4; break;
            }
            h /= 6;
        }

        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        return `hsl(${h},${s}%,${l}%)`;
    }
}



