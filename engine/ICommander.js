// import {Register} from "./Register.js";

export class ICommander{

    /** @type {Register|any} */
    register;

    /**
     * Important: The internal name `props` is for providing data between objects.
     *
     * @type {any}
     */
    props = {};

    constructor(register) {
        //
        // if ( !(register instanceof Register) ) {
        //     console.warn(`Warning! {ICommander.register} "${register}" is not instanceof class {Register}!`)
        //     console.trace(this);
        // }

        this.register = register;
    }

    // configured
    configured(params) {
        this.props = params || {};
    }

    setup(params) {

    }

    async init(params) {

    }

    reload() {
    }

    destroy() {
    }
}

