import {Spectacle} from "../../engine/Spectacle.js";
import {Actor} from "../../engine/canvas2d/Actor.js";


export const SPECTACLE_DEFAULT = 'default'


export class DefaultSpectacle extends Spectacle {

    /**
     *
     * @param register {Register|*}
     * @param props
     */
    constructor(register, props = {}) {
        super(register, {
            name: SPECTACLE_DEFAULT
        });
        this.register = register;
    }

    configured(config= {}) {
        super.configured(config);

        this.create()
    }

    create () {
        const actor = new Actor();

        this.addActor(actor);
    }
}