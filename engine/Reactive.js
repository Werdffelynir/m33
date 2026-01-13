import {IState} from "./IState.js";


/**
 * ```
 * const source = {
 *     id: 128,
 *     name: 'Demo name',
 * };
 * const state = new IState(source)
 *
 *
 * ```
 */
export class Reactive {

    _excluded = [
        'constructor',
        'excluded',
        'reactive',
        'register',
        'setup',
        'on',
        'off',
        'has',
        'set',
        'get',
        'mix',
    ];

    /**
     *
     * ```
     * state = new IState({
     *   version: '1.0.0',
     *   user: {name: 'John',age: 30},
     *   position: { x: 0, y: 0 },
     *   lib: {math: {geometry: {corner: 'cornerValue'}}}
     * })
     *
     * eventBus = EventBus()
     * props = {
     *      register,
     *      eventBus,   // Don't recommend (LoopKeeper killer)
     *
     *                  // High probability of oversaturating the object with events, do not use in cyclic handlers
     *                  // For objects actions like - ui, modules, plugins, other closed environments.
     *                  // if set, use `eventBus.subscribe("react:uiVar", )` for intercepted
     * }
     *
     * const state = new Reactive(state, props);
     *
     * // Warning! (LoopKeeper killer)
     * eventBus.subscribe( 'react:lib.math.geometry.corner', (path, value, prev) => {
     *   console.log(`Changed [${path}]: ${prev} → ${value}`);
     * } );
     *
     *
     * state.on('user.name', (value, prev) => {
     *   console.log(`Name changed from ${prev} to ${value}`);
     * });
     *
     * state.on('*', (path, value, prev) => {
     *   console.log(`Changed [${path}]: ${prev} → ${value}`);
     * });
     *
     * state.on('lib.math.*', (path, value, prev) => {
     *   console.log(`Changed [${path}]: ${prev} → ${value}`);
     * });
     *
     *
     * state.user.name = 'Alice';      // execute 'user.name', '*'
     * state.position.x = 100;         // execute '*'
     * state.set('user.age', 40);      // use .set()
     * ```
     * @param source {IState|{}}
     * @param params
     * @returns {*|{set, off, on }}
     */
    constructor(source = {}, params = {}) {
        this._listeners = new Map(); // Map<propertyName, Set<callbacks>>

        /** @type {*|{set, off, on }} */
        this._proxy = this._createReactiveObject(source, []);
        this._source = source;

        this.eventBus = params?.eventBus ?? null;
        this.exclude();
    }

    exclude() {
        if (Array.isArray(this._source.excluded))
            this._excluded = [...new Set([...this._excluded, ...this._source.excluded])];
    }

    get source() {
        return this._source;
    }

    get state() {
        return this._proxy;
    }

    /**
     * ```
     * get('path.to.key')
     * ```
     * @param path
     * @returns {*}
     */
    get(path) {
        const [obj, key] = this._resolve(path, false);
        if (!obj || !(key in obj)) {
            throw new Error(`{Reactive.get} "path=${path}" not exists!`);
        }
        return obj[key];
    }

    /**
     *
     * ```
     * set('path', value )
     * set('path.to.key', value )
     * ```
     * @param path
     * @param value
     */
    set(path, value) {
        const [obj, key] = this._resolve(path, true);
        if (!obj) {
            throw new Error(`{Reactive.set} "path=${path}" not exists!`);
        }
        obj[key] = value;
    }

    setIfDif(path, value) {
        if (this.has(path) && this.get(path) !== value) {
            this.set(path, value);
        }
    }

    has(path) {
        const [obj, key] = this._resolve(path, false);
        return obj ? obj.hasOwnProperty(key) : false;
    }

    /**
     *
     *
     *
     * Deep, controlled mixing (without creating new branches)
     * ```
     *
     * ```
     *
     *
     * @param state
     */
    mix(state) {
        Object.assign(this._proxy, state);
/*        const merge = (target, source) => {
            for (const [key, value] of Object.entries(source)) {
                const t = target[key];

                if (Array.isArray(value) && Array.isArray(t)) {
                    t.length = 0;
                    for (const item of value) t.push(item);

                } else if (value instanceof IState && t instanceof IState) { //todo test
                    for (const [k, v] of value.entries()) {
                        t.set(k, v);
                    }


                } else if (value instanceof Map && t instanceof Map) {
                    for (const [k, v] of value.entries()) {
                        t.set(k, v);
                    }

                } else if (value instanceof Set && t instanceof Set) {
                    for (const v of value.values()) {
                        t.add(v);
                    }

                } else if (
                    typeof value === 'object' &&
                    value !== null &&
                    typeof t === 'object' &&
                    t !== null
                ) {
                    merge(t, value);

                } else if (key in target) {
                    target[key] = value;
                }
            }
            return target;
        };

        return merge(this, state);*/
    }

    /**
     * ```
     * state.on('user.name', (value, prev) => {})
     * state.on('user', (value, prev) => {})
     * state.on('*', (value, prev) => {})
     * ```
     * @param path
     * @param callback
     */
    on(path, callback) {
        if (!this._listeners.has(path)) {
            this._listeners.set(path, new Set());
        }
        this._listeners.get(path).add(callback);
    }

    off(path, callback) {
        if (this._listeners.has(path)) {
            this._listeners.get(path).delete(callback);
        }
    }

    _resolve(path, create = false) {
        const parts = path.split('.');
        let obj = this._proxy;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in obj)) {
                if (create) {
                    obj[parts[i]] = {};
                } else {
                    return [null, null];
                }
            }
            obj = obj[parts[i]];
        }

        const key = parts.at(-1);
        return [obj, key];
    }

    _createReactiveObject(obj, path) {
        const self = this;

        return new Proxy(obj, {
            get(target, key, receiver) {

                if (key === "__raw") return target;

                // if (key === "reactive") {return "{excluded value}";}

                const value = Reflect.get(target, key, receiver);

                if (typeof value === 'object' && value !== null) {
                    return self._createReactiveObject(value, [...path, key]);
                }

                return typeof value === 'function' ? value.bind(target) : value;
            },

            set(target, key, newValue, receiver) {

                // if (self._excluded.includes(key)) { return "{excluded value}"; }

                const oldValue = target[key];
                const result = Reflect.set(target, key, newValue, receiver);

                if (oldValue !== newValue) {
                    const fullpath = [...path, key].join('.');
                    self._emit(fullpath, newValue, oldValue);

                    // todo testing
                    // if (false) {
                    //     self?.eventBus?.publish?.(`react:${fullpath}`, { value: newValue, prev: oldValue })
                    // }
                }

                return result;
            },


            // has(target, key) {
            //     if (self._excluded.includes(key)) return key in target;
            //     return key in target || key in self;
            // }
            // has(target, prop) {
            //     return prop in target || prop in target.self;
            // },
        });
    }

    _emit(path, value, oldValue) {
        const listeners = this._listeners.get(path);
        if (listeners) {
            for (const cb of listeners) {
                cb(value, oldValue);
            }
        }

        const globalListeners = this._listeners.get('*');
        if (globalListeners) {
            for (const cb of globalListeners) {
                cb(value, oldValue, path);
            }

        }

        // todo testing
        for (const [key, callbacks] of this._listeners.entries()) {
            if (key.endsWith('.*') && path.startsWith(key.slice(0, -2))) {
                callbacks?.forEach(cb => {
                    cb(path, value, oldValue) // todo testing
                })
            }
        }
    }
}


