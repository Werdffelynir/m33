import {IManager} from "./IManager.js";


/**
 * ```
 * import { StateManager } from './core/StateManager.js';
 * import { EventBus } from './core/EventBus.js';
 *
 * const bus = new EventBus();
 *
 * const stateMan = new StateManager();
 * const state = stateManager.state;
 *
 *
 * // Reaction to change
 * stateMan.subscribe('fuel', (newVal, oldVal) => {
 *   console.log(`Fuel changed from ${oldVal} → ${newVal}`);
 * });
 *
 *
 * // Change of state
 * stateMan.getState().fuel -= 10;
 * stateMan.get('fuel') -= 10;
 * stateMan.set('screen', 'space');
 * stateMan.state.screen ='space';
 *
 *
 * // Nested variable (deep proxy)
 * stateMan.getState().inventory.crystals += 5;
 * stateMan.state.inventory.crystals += 5;
 *
 *
 * // Used EventBus
 * bus.subscribe('state:screen', ({ newVal }) => {
 *   console.log(`Screen changed to ${newVal}`);
 * });
 *
 *
 * stateMan.watch('fuel', (val) => val <= 10, (val) => {
 *   console.warn(`Warning! Fuel is critically low: ${val}`);
 * });
 *
 *
 * stateMan.getState().fuel = 9; // callback watch fuel
 * ```
 */
export class StateManager extends IManager {

    /** @type {EventBus} */
    eventBus;
    /** @type {Proxy|*} */
    state;

    configured({state, eventBus, storageKey}) {
        this.listeners = new Map();
        this.eventBus = eventBus || null;
        this.storageKey = storageKey || 'game_state';
        this.undoStack = [];
        this.redoStack = [];
        this.state = state;
        this.autosaveEnable = false;


        // Autoload from repository
        if (this.autosaveEnable)
            state = this._loadFromStorage();

        this.state = this._createReactiveState(state);
    }

    async init(params) {

    }

    getState(){
        return this.state
    }

    set(key, value) {
        this._saveSnapshot();
        this.state[key] = value;
    }

    get(key) {
        return this.state[key];
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }
    on(key, callback){return this.subscribe(key, callback)}

    unsubscribe(key, callback) {
        const list = this.listeners.get(key);
        if (list) {
            this.listeners.set(key, list.filter(fn => fn !== callback));
        }
    }
    off(key, callback){
        return this.unsubscribe(key, callback);
    }

    reset() {
        const keys = Object.keys(this.state);
        this._saveSnapshot();
        for (const key of keys) {
            delete this.state[key];
        }
        localStorage.removeItem(this.storageKey);
    }

    /**
     * key                          - the path to the value, e.g. "inventory.crystals"
     * conditionFn(newVal, oldVal)  - returns true if a callback should be called
     * callback(newVal, oldVal)     - your reaction
     *
     * ```
     * state.watch('fuel', (val) => val <= 10, (val) => {
     *   console.warn(`Warning! Fuel is critically low: ${val}`);
     * });
     *
     * state.getState().fuel = 9; // → callback watch fuel
     *
     * ```
     * @param key
     * @param conditionFn
     * @param callback
     * @returns {function(): void}
     */
    watch(key, conditionFn, callback) {
        const wrapped = (newVal, oldVal) => {
            if (conditionFn(newVal, oldVal)) {
                callback(newVal, oldVal);
            }
        };
        this.subscribe(key, wrapped);
        return () => this.unsubscribe(key, wrapped); // для зняття підписки
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const current = JSON.parse(JSON.stringify(this.state));
        this.redoStack.push(current);

        const snapshot = this.undoStack.pop();
        this._replaceState(snapshot);
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const current = JSON.parse(JSON.stringify(this.state));
        this.undoStack.push(current);

        const snapshot = this.redoStack.pop();
        this._replaceState(snapshot);
    }

    _notify(key, value, prev) {

        const globalListeners = this.listeners.get('*');
        if (globalListeners) {
            for (const cb of globalListeners) {
                cb(key, value, prev);
            }
        }

        if (this.listeners.has(key)) {
            for (const cb of this.listeners.get(key)) {
                cb(key, value, prev);
            }
        }

        if (this.eventBus) {
            this.eventBus.publish(`state:${key}`, { key, value, prev });
        }

        this._saveToStorage();
    }

    _createReactiveState(obj, path = []) {
        const handler = {
            get: (target, key) => {
                const value = target[key];
                return typeof value === 'object' && value !== null
                    ? this._createReactiveState(value, [...path, key])
                    : value;
            },
            set: (target, key, value) => {
                const oldValue = target[key];
                target[key] = value;

                const fullKey = [...path, key].join('.');
                if (oldValue !== value) {
                    this._notify(fullKey, value, oldValue);
                }
                return true;
            },
            deleteProperty: (target, key) => {
                const fullKey = [...path, key].join('.');
                this._saveSnapshot();
                if (key in target) {
                    const oldValue = target[key];
                    delete target[key];
                    this._notify(fullKey, undefined, oldValue);
                }
                return true;
            }
        };

        return new Proxy(obj, handler);
    }

    _saveToStorage() {
        try {
            const plain = JSON.stringify(this.state);
            localStorage.setItem(this.storageKey, plain);
        } catch (err) {
            console.warn('StateManager: Failed to save state', err);
        }
    }

    _loadFromStorage() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.warn('StateManager: Failed to load state', err);
            return null;
        }
    }

    _saveSnapshot() {
        const snapshot = JSON.parse(JSON.stringify(this.state));
        this.undoStack.push(snapshot);

        // limitation
        if (this.undoStack.length > 50)
            this.undoStack.shift();

        this.redoStack = []; // clear Redo
    }

    _replaceState(snapshot) {
        for (const key of Object.keys(this.state)) {
            delete this.state[key];
        }
        for (const [key, val] of Object.entries(snapshot)) {
            this.state[key] = val;
        }
    }
}

