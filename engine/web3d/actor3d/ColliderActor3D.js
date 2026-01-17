import {Actor3D} from "./Actor3D.js";

export class ColliderActor3D extends Actor3D {
    constructor(gameObject, shapeOptions) {
        super(gameObject);
        this.shapeOptions = shapeOptions; // box/sphere/size/material
        this.collider = null;
    }

    start(physicsWorld, rigidBody) {
        // створити collider у physicsWorld
        // прив’язати до rigidBody
    }
}

