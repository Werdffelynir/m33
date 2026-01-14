import {Controller} from "../../engine/Controller.js";
import {IndexScreen} from "../screens/IndexScreen.js";
import {STATUSES} from "../../engine/Register.js";



export class IndexController extends Controller {

    constructor(register) {
        super(register);

        // immortal components env
    }

    // should be called only once.
    async setup(params) {

    }

    // called every time they are initialized.
    async init(params) {

        await this.changeScreen(IndexScreen.name, {
            someLoadedData: [],
        });
    }

    // Called if explicitly reloaded
    async reload(params) {}

    // Called before switching away
    destroy(){}
}
