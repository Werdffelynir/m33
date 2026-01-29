import {ICommander} from "./ICommander.js";

export class IManager extends ICommander {

    constructor(register) {
        super(register)

        this.archive = new Map();
    }

    get(key) {
        return this.archive.get(key)
    }

    has(key) {
        return this.archive.has(key)
    }

    set(key, value) {
        if (this.archive.has(key)) {
            console.warn(`Identical Keys Error. addStack parameter [${key}] is exist!`);
            return;
        }

        return this.archive.set(key, value);
    }

    /**
     * @param asCopyObject
     * @returns {any|Map<any, any>}
     */
    getArchive(asCopyObject = false) {
        return asCopyObject ? Object.fromEntries(this.archive.entries()) : this.archive;
    }
}
