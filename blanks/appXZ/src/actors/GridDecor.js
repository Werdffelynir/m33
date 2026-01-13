import {Actor} from "../../engine/canvas2d/Actor.js";
import {ActorType} from "./ActorType.js";


export class GridDecor extends Actor {

    /**
     * ```
     * new GridDecor ({
     *             x: -this.camera.fieldWidth,
     *             y: -this.camera.fieldHeight,
     *             step: 1000,
     *             size: 10000,
     * })
     * ```
     * @param props
     */
    constructor(props = {}) {
        super(props);

        this.type = ActorType.grid;

        this.step = props?.step || 1000;
        this.size = props?.size || 10000;

        this.optimized = false;
        this.updatable = false;

        this.points = [5,0,-5,0,0,0,0,-5,0,5];
        this.pointsLength = this.points.length;
        this.lineWidth = props?.lineWidth ?? 2
        this.shape = Object.entries(this.points).map((arr, i)=>{
            return {x: Number(arr[0]), y: Number(arr[1])}
        });
    }

    update(delta, camera, i) {}

    draw(ctx, camera, iterator) {
        // this.drawPoints(ctx, camera, iterator);
        // this.drawCrosses(ctx, camera, iterator);
        this.drawLines(ctx, camera, iterator);
    }

    drawLines(ctx, camera, iterator) {
        ctx.font = `${12 / camera.zoom}px sans, sans-serif`;
        ctx.fillStyle = '#8175ab';
        ctx.strokeStyle = '#a098cb';
        ctx.lineWidth = this.lineWidth / camera.zoom;

        for (let x = -this.size; x <= this.size; x += this.step) {
            ctx.beginPath();
            ctx.moveTo(x, -this.size);
            ctx.lineTo(x, this.size);
            ctx.stroke();

            ctx.fillText(`${x}`, x + 2, 2);
        }

        for (let y = -this.size; y <= this.size; y += this.step) {
            ctx.beginPath();
            ctx.moveTo(-this.size, y);
            ctx.lineTo(this.size, y);
            ctx.stroke();

            ctx.fillText(`${y}`, 2, y + 3);
        }
    }


    drawCrosses(ctx, camera, iterator) {
        ctx.font = `1px sans, sans-serif`; //`${12 / camera.zoom}px sans, sans-serif`;
        ctx.fillStyle = '#a197d7';
        ctx.strokeStyle = '#a197d7';
        ctx.lineWidth = this.lineWidth / camera.zoom;

        let x, y;
        for ( x = -this.size ; x < this.size; x += this.step) {
            for ( y = -this.size; y < this.size; y += this.step) {

                ctx.beginPath();
                ctx.moveTo(this.points[0]+x, this.points[1]+y);
                for (let i = 2; i < this.pointsLength; i += 2) {
                    ctx.lineTo(this.points[i]+x, this.points[i + 1]+y);
                }
                ctx.stroke();

                if (camera.isInScreen({x, y}, 2)) {
                    ctx.fillText(` ${x} ${y}`, x + 2, y + 3)
                }

            }
        }
    }

    drawPoints(ctx, camera, iterator) {
        // ctx.font = `${12 / camera.zoom}px sans, sans-serif`;
        ctx.font = `1px sans, sans-serif`; //`${12 / camera.zoom}px sans, sans-serif`;
        ctx.fillStyle = '#a197d7';
        ctx.strokeStyle = '#a197d7';
        ctx.lineWidth = this.lineWidth / camera.zoom;
        const radius = 2 / camera.zoom;

        let vn, x, y;
        for ( x = -this.size ; x < this.size; x += this.step) {
            for ( y = -this.size; y < this.size; y += this.step) {

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 6.3);
                ctx.fill();

                // vn = x % 2000 === 0 && y % 2000 === 0 && camera.isInScreen({x, y}, 2);
                if (x % 2000 === 0 && y % 2000 === 0) {
                    ctx.fillText(` ${x} ${y}`, x + 2, y + 3)
                }
            }
        }
    }

}

