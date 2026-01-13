import {Controller} from "../../engine/Controller.js";
import {Theater2DScreen} from "../screens/Theater2DScreen.js";



export class Theater2DController extends Controller {

    async init(params) {
        await this.changeScreen(Theater2DScreen.name);
    }

}

