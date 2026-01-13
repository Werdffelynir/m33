import {Module} from "../../engine/Module.js";


export class FocusModule extends Module {
    constructor(register) {
        super(register, {
            type: 'focus',
        });
    }

    setup() {
        // there will be a "focus" event, and the active element has attr [data-id=n] and [tabindex=0], do
    }

    update(delta, iter) {}

}

