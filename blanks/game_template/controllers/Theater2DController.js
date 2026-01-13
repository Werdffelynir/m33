import {Controller} from "../../engine/Controller.js";
import {Theater3DScreen} from "../screens/Theater3DScreen.js";



export class Theater2DController extends Controller {

    // auto-called once
    async setup() {

    }

    // auto-called when change controller handler `ControllerManager.switch (ControllerName, params)`
    async init(params) {
        await this.changeScreen(Theater3DScreen.name, {});
    }

    destroy() {

    }
}

