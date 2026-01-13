import {Vector2} from "./Vector2.js";
import {Ut} from "../Ut.js";


const EntityProps = {
    position: new Vector2,
    velocity: new Vector2,
    acceleration: new Vector2,
    rigidBody: null,
    collider: null,
};


export class Entity {

    position = new Vector2();
    velocity = new Vector2();
    acceleration = new Vector2();

    /**@type {RigidBody} */ rigidBody = null;
    /**@type {CircleCollider|*} */ collider = null;

    toObject(){
        const {x, y} = this.position;
        const {x:vx, y:vy} = this.velocity;
        const {x:ax, y:ay} = this.acceleration;
        const {id, parentId} = this;

        return {
            x, y, vx, vy, ax, ay,
            id, parentId,
            rigidBody: this.rigidBody || this.rigidBody.toObject(),
            collider: this.collider || this.collider.toObject(),
            state: this.state,
        }
    }

    constructor(props = {}) {
        const {x, y, vx, vy, ax, ay, position, velocity, acceleration, rigidBody, collider, id, parentId, state} = props;

        this.id = id ?? Ut.randomUUID().slice(0, 5)
        this.parentId = parentId ?? null
        this.state = state ?? {}

        if (position instanceof Vector2) {
            this.position = position;
        } else if (Ut.isNumber(x) || Ut.isNumber(y)) {
            this.position = new Vector2(x ?? 0, y ?? 0);
        }

        if (velocity instanceof Vector2) {
            this.velocity = velocity;
        } else if (Ut.isNumber(vx) || Ut.isNumber(vy)) {
            this.velocity = new Vector2(vx ?? 0, vy ?? 0);
        }

        if (acceleration instanceof Vector2) {
            this.acceleration = acceleration;
        } else if (Ut.isNumber(ax) || Ut.isNumber(ay)) {
            this.acceleration = new Vector2(ax ?? 0, ay ?? 0);
        }

        this.rigidBody = rigidBody;
        this.collider = collider;
        this.children = new Set();
    }

    update(delta, camera, iterator) {
        if (this.rigidBody)
            this.rigidBody.update(this, delta);

        // todo
        // if(this.children.size > 0) {
        //     this.children.forEach(act=>{
        //         if (act.update && act !== this) {
        //             act.update(delta, camera, iterator)
        //         }
        //     })
        // }
    }

    draw(ctx, camera, iterator, delta) {

    }

}

