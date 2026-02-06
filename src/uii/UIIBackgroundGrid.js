export class UIIBackgroundGrid {

    constructor({element}) {
        this.element = element;
    }

    grid(fieldSize = 6) {
        const element = this.element;
        element.style.position = 'absolute'
        element.style.width = (fieldSize*100)+'px';
        element.style.height = (fieldSize*100)+'px';
        element.style.left = 0;
        element.style.top = 0;
        const width = element.clientWidth;
        const height = element.clientHeight;
        const gridSize = 100;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.lineWidth = 0.2;

        let x = 0;
        let y = 0;
        for (x = 0; x <= width; x += gridSize) {
            for (y = 0; y <= height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x-gridSize, y);
                ctx.moveTo(x, y);
                ctx.lineTo(x, y-gridSize);
                ctx.stroke();
            }
        }

        const dataURL = canvas.toDataURL();
        element.style.backgroundImage = `url(${dataURL})`;
        element.style.backgroundRepeat = 'no-repeat';
        element.style.backgroundSize = `${width}px ${height}px`;
    }
}

