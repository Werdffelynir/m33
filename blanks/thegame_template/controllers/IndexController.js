import {Controller} from "../../engine/Controller.js";
import {IndexScreen} from "../screens/IndexScreen.js";


export class IndexController extends Controller {

    async init(params) {
        await this.changeScreen(IndexScreen.name, {});
    }

    async setup() {

    }

    destroy() {

    }

}
