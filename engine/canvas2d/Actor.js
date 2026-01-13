import {Vector2} from "./Vector2.js";
import {Entity} from "./Entity.js";

const ActorProps = {
    width: 1,
    height: 1,
    drawable: true,         // designed to optimize performance
    updatable: true,        // designed to optimize performance
    name: 'none',
    type: 'none',
    spectacle: null,
    deep: 0,
};

/**
 * ```
 *
 *
 * this.addActor(actor);
 * ```
 */
export class Actor extends Entity {
    /**
     *
     * @param position {Vector2}
     */

    /**
     *
     * @param props
     */
    constructor(props = {}) {
        super({...ActorProps, ...props});

        this.width = props?.width ?? ActorProps.width;
        this.height = props?.height ?? ActorProps.height;
        this.radius = props?.radius ?? ActorProps.radius;
        this.updatable = props?.updatable ?? ActorProps.updatable;
        this.drawable = props?.drawable ?? ActorProps.drawable;
        this.name = props?.name ?? ActorProps.name;
        this.type = props?.type ?? ActorProps.type;
        this.spectacle = props?.spectacle ??ActorProps.spectacle;
        this.deep = props?.deep ?? ActorProps.deep;

        if (props?.update && typeof props.update === 'function') this.update = props.update;
        if (props?.draw && typeof props.draw === 'function') this.draw = props.draw;

        if (props?.position) {
            if (props.position instanceof Vector2) this.position.setVector(props.position)
            else this.position.set(props.position.x, props.position.y);
        }
        if (props?.velocity) {
            if (props.velocity instanceof Vector2) this.velocity.setVector(props.velocity)
            else {this.velocity.set(props.velocity.x, props.velocity.y)}
        }
        if (props?.acceleration) {
            if (props.acceleration instanceof Vector2) this.acceleration.setVector(props.acceleration)
            else this.acceleration.set(props.acceleration.x, props.acceleration.y);
        }

        Object.keys(props).forEach((name) => {
            if (!this.hasOwnProperty(name)) this[name] = props[name];
        })

        this.selected = false;
        this.isstarted = false;
    }

    get x() { return this.position.x }
    set x(n) { this.position.x = n}
    get y() { return this.position.y }
    set y(n) { this.position.y = n}
    get vx() { return this.velocity.x }
    set vx(n) { this.velocity.x = n}
    get vy() { return this.velocity.y }
    set vy(n) { this.velocity.y = n}
    get ax() { return this.acceleration.x }
    set ax(n) { this.acceleration.x = n}
    get ay() { return this.acceleration.y }
    set ay(n) { this.acceleration.y = n}

    update(delta) {
        // this.moveAngle(delta);
        // this.move(delta);
        this.position.x += this.velocity.x * delta;
        this.position.y += this.velocity.y * delta;
    }

    move(delta) {
        if (this.velocity && this.velocity.x !== 0 && this.velocity.y !== 0 ) {
            this.position.x += this.velocity.x * delta;
            this.position.y += this.velocity.y * delta;
        }
    }
    moveAngle(delta) {
        if (this.angle && this.angle !== 0 ) {
            this.velocity.x = Math.cos(this.angle) * this.speed;
            this.velocity.y = Math.sin(this.angle) * this.speed;
        }
    }

    draw(ctx, camera, iterator) {
    }

}


class SpaceObject extends Actor {
    target = new Vector2();

    constructor(props) {
        super(props);
        this.angle = 0
        this.speed = 8.2
        this.target = new Vector2(props.mouse.x, props.mouse.y);
    }
    update(delta, camera) {

        const direction = new Vector2(this.target.x, this.target.y)
            .subtract(this.position)
            .normalize();

        this.velocity = direction.copy().multiply(this.speed);

        if (this.target.distanceTo( this.position) > 1) {
            this.position.add(this.velocity.copy().multiply(delta));
        } else {
            this.target = this.position.copy();
        }

        // this.velocity.x = Math.cos(this.angle) * this.speed;
        // this.velocity.y = Math.sin(this.angle) * this.speed;
        // this.position.add(this.velocity.copy().multiply(delta));

        // this.position.x += this.velocity.x * delta;
        // this.position.y += this.velocity.y * delta;

        // this.velocity.add(this.acceleration.copy().multiply(delta));
        // this.position.add(this.velocity.copy().multiply(delta));

        // const direction = new Vector2(Math.cos( this.angle), Math.sin( this.angle));
    }
    /**
     * @param ctx {CanvasRenderingContext2D}
     * @param camera
     * @param iterator
     */
    draw(ctx, camera, iterator) {
        // console.log('draw', iterator)
        ctx.beginPath()
        ctx.fillStyle = '#b9e300'
        ctx.arc(this.position.x, this.position.y, 20, 0, 7)
        ctx.fill()
    }
}


