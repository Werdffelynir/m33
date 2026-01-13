import {Controller} from "../../engine/Controller.js";
import {ExampleScreen} from "../screens/ExampleScreen.js";



export class ExampleController extends Controller {

    constructor(register) {
        super(register);

        // immortal components env
    }

    // should be called only once.
    async setup(params) {

    }

    // called every time they are initialized.
    async init(params) {

        await this.changeScreen(ExampleScreen.name, {});
    }

    // Called if explicitly reloaded
    async reload(params) {}

    // Called before switching away
    destroy(){}
}

