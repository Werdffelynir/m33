import {ICommander} from "./ICommander.js";

export class IManager extends ICommander {

    constructor(register) {
        super(register)

        this.stackmanager = new Map();
    }

    get(key) {
        return this.stackmanager.get(key)
    }

    has(key) {
        return this.stackmanager.has(key)
    }

    set(key, value) {
        if (this.stackmanager.has(key)) {
            console.warn(`Identical Keys Error. addStack parameter [${key}] is exist!`);
            return;
        }

        return this.stackmanager.set(key, value);
    }

    /**
     *
     * @param asObject
     * @returns {any|Map<any, any>}
     */
    getStack(asObject = false) {
        return asObject ? Object.fromEntries(this.stackmanager.entries()) : this.stackmanager;
    }
}
