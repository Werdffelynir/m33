

// 
// Cache
export class Temporary {

    static typeStorage = 'local';

    static get typeStorageObject () {
        return Temporary.typeStorage === 'local' ? window.localStorage : window.sessionStorage;
    }

    static get size () {
        return Temporary.length();
    }

    /**
     * Add item by name
     * @param name
     * @param value
     * @param json
     */
    static set (name, value, json = true) {
        if (json)
            try {
                value = JSON.stringify(value);
            } catch (error) {
                console.error(error);
            }
        return Temporary.typeStorageObject.setItem(name, value);
    };

    /**
     * Get item by name
     * @param {string} name
     * @param json
     */
    static get (name, json = true) {
        let value = Temporary.typeStorageObject.getItem(name);
        if (json && value)
            try {
                value = JSON.parse(value);
            } catch (error) {
                console.error(error);
            }

        return value;
    };

    /**
     *
     * Remove item by name
     * @param name
     */
    static remove(name) {
        return Temporary.typeStorageObject.removeItem(name)
    };

    /**
     * Get item by index
     *
     * @param index
     * @returns {string}
     */
    static key (index) {
        return Temporary.typeStorageObject.key(index)
    };

    /**
     * When invoked, will empty all keys out of the storage.
     */
    static clear () {
        return Temporary.typeStorageObject.clear()
    };

    /**
     * Returns an integer representing the number of data items stored in the Temporary object.
     * @returns {number}
     */
    static length () {
        return Temporary.typeStorageObject.length
    };
}