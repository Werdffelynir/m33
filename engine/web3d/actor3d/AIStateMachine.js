import {Actor3D} from "./Actor3D.js";


export class AIStateMachine extends Actor3D {
    constructor(gameObject) {
        super(gameObject);
        this.state = null;
        this.states = {}; // map: name → { enter(), update(), exit() }
    }

    addState(name, definition) {
        // зберегти стан
    }

    setState(name) {
        // виклик exit старого, enter нового
    }

    update(dt) {
        // викликати update поточного стану
    }
}
