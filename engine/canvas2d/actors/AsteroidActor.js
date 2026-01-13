import {Actor} from "../Actor.js";
import {Vector2} from "../Vector2.js";
import {Ut} from "../../Ut.js";

export class AsteroidActor extends Actor {

    options = { label: false, track: false, colors: ['#8387a8', '#686c8a', '#4f536c'] };

    constructor(props = {}) {
        super(props);

        this.type = 'asteroid';

        this.radius = props?.radius ?? 4;
        this.angle = props?.angle ?? 0;
        this.angleSpeed = props?.angleSpeed ?? 0;
        this.frictionForce = props?.frictionForce ?? 0.001;

        this.orbitSpeed = props?.orbitSpeed ?? 0;
        this.orbitCenter = props?.orbitCenter ?? null;
        this.orbitDistance = 0;

        this.missedDelta = 0;
        this.skipFrameInScreen = props?.skipFrameInScreen ?? 0;
        this.skipFrameOutScreen = props?.skipFrameOutScreen ?? 0;


        this.options = {
            wrap: false,
            name: false,
            track: false,
            colors: ['#6fbdc4', '#469fa8', '#436c70'],
        };
        this.options = {...this.options, ...props?.options || {}};

        this.colors = props?.colors || {text: '#6fbdc4', border: '#469fa8', bg: '#436c70'};
    }

    //
    // Optimized !
    //
    updateOptimized(delta, camera, iterator) {
        if (!this.updatable) return;
        if (this.skipFrameRate && iterator % this.skipFrameRate !== 0) return;

        const isVisible = camera.isInScreen(this);

        if (!isVisible) {
            this.missedDelta += delta;
            this.sleep = true;
            return;
        }

        const totalDelta = delta + this.missedDelta;
        this.missedDelta = 0;
        this.sleep = false;

        this.updateVisible(totalDelta, camera, iterator);
    }

    update(delta, camera, iterator) {
        if (!this.updatable) return;
        if (this.skipFrameInScreen && iterator % this.skipFrameInScreen !== 0) return;

        if (!camera.isInScreen(this, camera.zoom)) {
            if (this.skipFrameOutScreen && iterator % this.skipFrameOutScreen !== 0) return;
        }

        if (this.orbitCenter) {
            this.moveAroundOrbitCenter(delta)
        } else {
            this.moveAngle(delta)
        }
    }

    /**
     * Do not use ZOOM in this method !!!
     * @param ctx { CanvasRenderingContext2D }
     * @param camera { Camera }
     */
    draw(ctx, camera) {
        //
        // Optional:
        //
        if (!this.drawable) return;
        if (!camera.isInScreen(this, camera.zoom)) return;

        const colorBg = this.colors.bg;
        const colorBorder = this.colors.border;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = colorBg;
        ctx.fill();


        if (this.options.name) {
            ctx.fillStyle = colorBorder;
            ctx.font = `${16 / camera.zoom}px sans, sans-serif`;
            ctx.fillText(this.options.name, this.x + this.radius + 2, this.y + this.radius + 2);
        }
    }

    //  free flight at an angle
    moveAngle(delta) {
        const direction = new Vector2(Math.cos(this.angle), Math.sin(this.angle));
        this.velocity.add(direction.multiply(this.angleSpeed));
        this.position.add(this.velocity.copy().multiply(this.frictionForce * delta))
    }

    // movement around an object
    moveAroundOrbitCenter(delta, c, i) {
        if (!this.orbitCenter || !(this.orbitCenter instanceof Vector2))
            return console.warn(`ErrorParam. required parameter - orbitCenter or parent`);

        let offset = this.position.copy().subtract(this.orbitCenter);
        this.orbitDistance = offset.length();
        offset = offset.rotate( this.orbitSpeed * delta );
        this.position = this.orbitCenter.copy().add(offset);
    }
}
