import {Actor3D} from "./Actor3D.js";

export class RigidBodyActor3D extends Actor3D {
    constructor(gameObject, options) {
        super(gameObject);
        this.options = options; // type, mass, initial transform
        this.body = null;       // Rapier body
    }

    start(physicsWorld) {
        // створити rigidBody у physicsWorld
        // зберегти body
    }

    applyImpulse(vec) {
        // body.applyImpulse(vec, true)
    }

    setTranslation(vec) {
        // body.setTranslation(vec, true)
    }

    getTranslation() {
        // повернути body.translation()
    }
}
