import {IManager} from "./IManager.js";


export class ComponentManager extends IManager {

    /**
     * @returns {*|Map<any, any>}
     */
    add (key, instance) {
        return this.set(key, instance);
    }
}