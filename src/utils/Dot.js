/**
 * ```
 * const obj = {};
 * Dot.set(obj, 'user.profile.name', 'Alice');
 * Dot.get(obj, 'user.profile.name');        // 'Alice'
 * Dot.has(obj, 'user.profile');             // true
 * Dot.ensure(obj, 'settings.ui.theme');     // створить порожній об'єкт theme
 * Dot.flatten(obj);                         // { 'user.profile.name': 'Alice', ... }
 * Dot.delete(obj, 'user.profile.name');     // true
 * Dot.paths(obj);                           // [ 'user.profile', 'settings.ui.theme' ]
 * ```
 *
 *
 */
export class Dot {
    static split(path) {
        return typeof path === 'string' ? path.split('.') : path;
    }

    static get(obj, path) {
        const parts = Dot.split(path);
        let curr = obj;
        for (let part of parts) {
            if (curr == null || typeof curr !== 'object' || !(part in curr)) return undefined;
            curr = curr[part];
        }
        return curr;
    }

    static set(obj, path, value) {
        const parts = Dot.split(path);
        let curr = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in curr) || typeof curr[part] !== 'object' || curr[part] === null) {
                curr[part] = {};
            }
            curr = curr[part];
        }
        curr[parts.at(-1)] = value;
        return obj;
    }

    static has(obj, path) {
        const parts = Dot.split(path);
        let curr = obj;
        for (let part of parts) {
            if (curr == null || typeof curr !== 'object' || !(part in curr)) return false;
            curr = curr[part];
        }
        return true;
    }

    static delete(obj, path) {
        const parts = Dot.split(path);
        let curr = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in curr)) return false;
            curr = curr[part];
        }
        return delete curr[parts.at(-1)];
    }

    static ensure(obj, path) {
        const parts = Dot.split(path);
        let curr = obj;
        for (let part of parts) {
            if (!(part in curr) || typeof curr[part] !== 'object' || curr[part] === null) {
                curr[part] = {};
            }
            curr = curr[part];
        }
        return curr;
    }

    static flatten(obj, prefix = '') {
        let result = {};
        for (let key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            const path = prefix ? `${prefix}.${key}` : key;
            const value = obj[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(result, Dot.flatten(value, path));
            } else {
                result[path] = value;
            }
        }
        return result;
    }

    static paths(obj, prefix = '') {
        return Object.keys(Dot.flatten(obj, prefix));
    }
}
