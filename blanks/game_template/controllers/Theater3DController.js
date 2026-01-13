import {Controller} from "../../engine/Controller.js";
import {Theater3DScreen} from "../screens/Theater3DScreen.js";



export class Theater3DController extends Controller {

    async init(params) {
        await this.changeScreen(Theater3DScreen.name, {});
    }

}

