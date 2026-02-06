import {Actor3D} from "./Actor3D.js";

export class TransformActor3D extends Actor3D  {
    constructor(gameObject) {
        super(gameObject);
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
        this.dirty = true; // флаг змін
    }

    setPosition(x, y, z) {
        // оновити position, поставити dirty
    }

    setRotation(x, y, z) {
        // оновити rotation, поставити dirty
    }

    setScale(x, y, z) {
        // оновити scale, dirty
    }
}