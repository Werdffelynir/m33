import {AnimationLoop} from "./AnimationLoop.js";
import {ReactiveTemplate} from "./ReactiveTemplate.js";
import {Doom} from "./utils/Doom.js";


export const LETTER_CONSONANT = 'B,C,D,F,G,H,J,K,L,M,N,P,Q,R,S,T,V,W,X,Y,Z';
export const LETTER_VOWEL = 'A,E,I,O,U,Y';
export const ABC = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z';
export const NUMBERS = '0,1,2,3,4,5,6,7,8,9';
export const AMPERSAND = '&';


/**
 * Main game utilities
 */
export class Ut {

    static trim(str) {
        return str.replace(/^\s+|\s+$/gm, '');
    }

    static merge(target, ...sources) {
        for (const source of sources) {
            Object.defineProperties(
                target,
                Object.getOwnPropertyDescriptors(source)
            );
        }
        return target;
    }

    /**
     * Formatting of string, or maybe template builder
     *
     * Examples:
     * .format("Hello {0}, your code is {1}!", ['Jade', 'Prefect']);
     *
     * .format("Hello {name}, your code is {mean}!", {name:'Jade', mean: 'Prefect'});
     *
     * @param string    String
     * @param list  Array|Object
     * @returns string
     */
    static format = function (string, list) {
        let reg;
        if (Array.isArray(list))
            reg = new RegExp(/{(\d+)}/g);
        else if (list && typeof list === 'object')
            reg = new RegExp(/{(\w+)}/g);

        return string.replace(reg, function (match, number) {
            // if (defined(list[number]) && isNode(list[number])){
            if (list && list.number && Ut.isNode(list[number])) {
                list[number] = Doom.node2str(list[number]);
            }

            return typeof list[number] !== undefined ? list[number] : match;
        });
    }

    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __ reactive


    static reactiveYAML(templateString, state) {
        return ReactiveTemplate.renderStatic(templateString, state)
    }


    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __ time
    /**
     * ```
     * static waitMs(ms) {
     *   return Ut.wait({ms}, function(resolve) {
     *     setTimeout(resolve, this.ms);
     *   });
     * }
     * async function showMessage(msg) {
     *   show(msg);
     *   await Ut.waitMs(2000); // показати 2 секунди
     *   hide(msg);
     * }
     * static waitOnce(target, eventName) {
     *   return Ut.wait({target,eventName}, function(resolve) {
     *     this.target.addEventListener(this.eventName, handler);
     *     function handler(e) {
     *       this.target.removeEventListener(this.eventName, handler);
     *       resolve(e);
     *     }
     *   });
     * }
     * waitUntil(ctx, predicate, interval=16) {
     *   return Ut.wait({ctx, predicate, interval}, async function(resolve) {
     *     while (!this.predicate.call(this.ctx)) {
     *       await new Promise(resolve => {
     *          resolve()
     *       });
     *     }
     *     resolve();
     *   });
     * }
     * await waitUntil(player, () => player.distanceTo(target) < 1);
     * player.arrive();
     * ```
     */
    static wait(args, callback) {
        return new Promise((resolve, reject) => {
            callback.bind(args)(resolve, reject);
        })
    };

    static waitMs(ms) {
        return Ut.wait({ms}, function(resolve) {
            setTimeout(resolve, this.ms);
        });
    }

    /**@deprecated */
    static waitTimer(cb, ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                cb?.();
                resolve();
            }, ms);
        });
    }


    /**
     * ```
     * Ut.delay( () => {  }, 3000)()
     * ```
     * ```
     * const timeout = Ut.delay( () => {}, 3000)
     * timeout();
     * for (var i = 0; i < 5; i++) {
     *     timeout();
     * }
     * ```
     * @returns {(function(): void)|*}
     */
    static delay = (func, ms) => {
        let timer;
        return function () {
            if (timer) clearTimeout(timer);

            if (!timer) {
                timer = setTimeout(() => {
                    func();
                    timer = false;
                }, ms);
            }
            return timer
        };
    };

    /**
     * ```
     *  Ut.timer( () => {  }, 3000).start()
     * ```
     * ```
     * const timer = Ut.timer( () => {}, 3000)
     * timer.start(props = {});
     * timer.stop();
     * ```
     * @returns {{stop(): void, start(): void, started: boolean}}
     */
    static timer = (func, ms) => {
        let timer;
        return {
            started: false,
            start() {
                if (!timer) {
                    timer = setInterval(() => {
                        func.apply(func, arguments);
                    }, ms);
                    this.started = true;
                }
            },
            stop() {
                if (timer) {
                    clearInterval(timer);
                    this.started = timer = false;
                }
            },
        }
    };

    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __ Truly Random

    static randomOneWeight(arrObjects, key) {
        let totalWeight = 0;

        for (let i = 0; i < arrObjects.length; i++) {
            totalWeight += arrObjects[i][key];
        }

        const rand = Math.random() * totalWeight;
        let cumulative = 0;

        for (let i = 0; i < arrObjects.length; i++) {
            cumulative += arrObjects[i][key];
            if (rand < cumulative) {
                return arrObjects[i];
            }
        }

        return arrObjects[arrObjects.length - 1]; // fallback
    }

    // min = 0, max = 99, biasPower = 2.8, round = false
    static randomBias(min = 0, max = 99, biasPower = 2.8, round = false) {
        const value = Math.pow(Math.random(), biasPower) * (max - min + 1) + min;
        return round ? Math.round(value) : value;
    }

    /**
     * biasPower > 1 — more values in the center.
     * biasPower < 1 — the distribution becomes more even.
     * Symmetrical around the center of the range.
     * @param min
     * @param max
     * @param biasPower
     * @param round
     * @returns {number|number}
     */
    static randomCentered(min = 0, max = 1, biasPower = 2, round = false) {
        let t = (Math.random() + Math.random()) / 2;

        t = Math.pow(Math.abs(t - 0.5) * 2, 1 / biasPower);
        t = 0.5 + (Math.random() < 0.5 ? -t / 2 : t / 2);

        const value = min + t * (max - min);
        return round ? Math.round(value) : value;
    }

    static randomBool(shift = 0.49999999) {
        return Math.random() < shift
    }

    static randomUnique(array, count = 5) {
        if (count > array.length) {
            throw new Error("More elements requested than are in the array");
        }
        const copy = [...array];
        const result = [];
        for (let i = 0; i < count; i++) {
            const index = Math.floor(Math.random() * copy.length);
            result.push(copy.splice(index, 1)[0]);
        }
        return result;
    }

    static randomOne(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
    }

    static random(min = 0, max = 1, round = false) {
        const value = min + Math.random() * (max - min);
        return round ? Math.round(value) : value;
    }

    static randomNumber(size = 6) {
        if (size > 16) {
            let i = Math.ceil(size / 16);
            let res = '';
            for (i; i > 0; i--)
                res += Array(16).fill(0).map(i => Math.floor(Math.random() * 10)).join('');
            return res.slice(0, size);
        }
        return parseInt(Array(size).fill(0).map(i => Math.floor(Math.random() * 10)).join(''));
    }

    static randomString(size = 6) {
        let string = '';
        const abs = (ABC +","+ NUMBERS).toLowerCase().split(',');

        for (let i = size; i !== 0; i--) {
            string += abs[Math.floor(Math.random() * abs.length)];
        }

        return string
    }

    static randomColor() { return "#" + Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0') }
    // randomOne(randomColors)
    static randomColors(count = 1) {
        const list = [];
        for (let i = 0; i < count; i++) {
            list.push("#" + Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0'));
        }
        return list;
    }

    static round(value, toFloat) {
        if (toFloat && typeof toFloat === 'number') {
            return value.toFixed(toFloat)
        }
        return Math.round(value)
    }

    static randomUUID(){
        return crypto?.randomUUID?.() || `node_${Math.random().toString(36).slice(2, 9)}`
    }

    static len(value) {
        if (!value && value !== 0) return false;
        const type = Ut.typeOf(value)
        let len = 0;

        switch (type) {
            case 'data':
            case 'object':
            case 'function':
                len = Object.keys(value).length;
                break;
            case 'number':
                len = value;
                break;
            default:
                len = value.length;
        }

        return len;
    }

    static capitalise(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    /**
     *```
     * each( object, (v, i, object) => {}, instance )
     * each( array, (v, i, array) => {}, instance ) // todo in test
     *```
     * @param list
     * @param callback
     * @param instance
     */
    static each(list, callback, instance) {
        let type = Ut.typeOf(list);

        switch (type) {
            // todo: new type

            case 'number':
                Array(list).fill(0).forEach((i, v, a) => callback.call(instance, v, i, a));
                break;

            case 'array':
                list.forEach((i, v, a) => callback.call(instance, v, i, a));
                break;

            case 'object':
                if (Ut.isNode(list)) {

                    if (list instanceof NodeList)
                        Ut.each(Array.from(list), callback, instance)
                    else
                        Ut.each([list], callback, instance)

                } else {

                    if (list instanceof Map) {
                        for (const [key, value] of Object.entries(list)) {
                            callback.call(instance, list[key], key, list, value)
                        }
                        break;
                    }

                    else if (list instanceof Set) {
                        list = [...list]
                    }

                    Object.keys(list).forEach((key, i) => callback.call(instance, list[key], key, list, i));

                }

                break;

            case 'string':
                Ut.each(list.split(""), callback, instance);
                break;
        }
    }



    static uniqueArr(source, target) {
        return [...new Set([
            ...source,
            ...target
        ])];
    }

    static pick(obj, keys) {
        return Object.fromEntries(keys.map(key => [key, obj[key]]));
    }

    static async importObject(fileClassScript, params) {
        const {default: scriptObject} = await import(fileClassScript);

        // console.trace( scriptObject)
        return scriptObject;
    }

    static async importClass(fileClassScript, params) {
        const {default: ClassName} = await import(fileClassScript);

        // console.log('default', ClassName)
        return new ClassName(params);
    }

    // todo: need test!
    static getPendulumValue(delta, min, max, k) {
        if (this._pendulumTime === undefined) this._pendulumTime = 0;
        this._pendulumTime += delta * k;

        const range = (max - min) / 2;
        const mid = (max + min) / 2;

        return mid + Math.sin(this._pendulumTime) * range;
    }

    /**
     * todo: replace to space objects
     * ```
     * this.pendulumTime = 0;
     *
     * update(delta) {
     *     const { value, time } = pendulumValue(delta, 0.2, 0.9, 2, this.pendulumTime);
     *     this.pendulumTime = time;
     *     console.log('Коливання:', value);
     * }
     * ```
     * @param delta
     * @param min
     * @param max
     * @param k
     * @param time
     * @returns {{time: number, value: number}}
     */
    static pendulumValue(delta, min, max, k, time = 0) {
        time += delta * k;
        const range = (max - min) / 2;
        const mid = (max + min) / 2;
        return {
            value: mid + Math.sin(time) * range,
            time
        };
    }

    // Parsers
    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __ Types

    /**
     * ```
     * const input = "load:false,mod:reactive,time:1225.24";
     * const parsed = parseTypedString(input);
     * console.log(parsed);
     * // { load: false, mod: 'reactive', time: 1225.24 }
     * ```
     * @param input
     * @returns {{}}
     */
    static parseTypedString(input) {
        const result = {};

        const pairs = input.split(',');
        for (const pair of pairs) {
            const [key, rawValue] = pair.split(':');
            let value;

            if (rawValue === 'true') {
                value = true;
            } else if (rawValue === 'false') {
                value = false;
            } else if (!isNaN(rawValue) && rawValue.trim() !== '') {
                value = parseFloat(rawValue);
            } else {
                value = rawValue;
            }

            result[key] = value;
        }

        return result;
    }

    // This is a set of universal utilities for checking types and conditions.
    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __ Types

    /**
     * ```
     * typeOfStrict({}            )        - Object
     * typeOfStrict({1:10,2:20}   )        - Object
     * typeOfStrict([]            )        - Array
     * typeOfStrict(null          )        - Null
     * typeOfStrict(''            )        - String
     * typeOfStrict(100           )        - Number
     * typeOfStrict(undefined     )        - Undefined
     * typeOfStrict(true          )        - Boolean
     * typeOfStrict(()=>{}        )        - Function
     *```
     * @param {*} value
     * @param {boolean|string} type
     * @return {boolean|string}
     */
    static typeOfStrict(value, type) {
        const t = Object.prototype.toString.call(value).slice(8, -1);
        return typeof type === 'string' ? type === t : t;
    }

    /**
     * ```
     * typeOf({}            )     - object
     * typeOf({1:10,2:20}   )     - object
     * typeOf([]            )     - array
     * typeOf(null          )     - null
     * typeOf(''            )     - string
     * typeOf(100           )     - number
     * typeOf(undefined     )     - undefined
     * typeOf(true          )     - boolean
     * typeOf(()=>{}        )     - function
     * typeOf((new Data)    )     - date
     *```
     * @param {*|string|object|boolean}value
     * @param {string|null} type
     * @return {boolean|string}
     */
    static typeOf(value, type = null) {
        const simpleTypes = ['null', 'boolean', 'undefined', 'function', 'string', 'number', 'date', 'array', 'object'];
        let t = Ut.typeOfStrict(value).toLowerCase();
        if (simpleTypes.indexOf(t) === -1 && typeof value === 'object')
            t = 'object';

        return typeof type === 'string' ?
            type.toLowerCase() === t : t;
    }

    static isNumber(v) {
        return typeof v === 'number' && !isNaN(v);
    }

    static isNumeric(v) {
        return !Array.isArray(v) && !isNaN(parseFloat(v)) && isFinite(v);
    }

    static isFloat(v) {
        return Ut.isNumber(v) && !Number.isInteger(v);
    }

    static isString(v, length = null) {
        if (length)
            return typeof v === 'string' && v.length >= length;

        return typeof v === 'string';
    }

    static isBoolean(v) {
        return typeof v === 'boolean';
    }

    static isObject(v) {
        return v !== null && typeof v === 'object' && !Array.isArray(v);
    }

    static isArray(v) {
        return Array.isArray(v);
    }

    static isFunction(v) {
        return typeof v === 'function';
    }

    static isUndefined(v) {
        return typeof v === 'undefined';
    }

    static isNull(v) {
        return v === null;
    }

    static isDate(v) {
        return Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v);
    }

    static isPromise(v) {
        return !!v && typeof v.then === 'function' && typeof v.catch === 'function';
    }

    static isSet(v) {
        return Object.prototype.toString.call(v) === '[object Set]';
    }

    static isMap(v) {
        return Object.prototype.toString.call(v) === '[object Map]';
    }

    static isNode(v) {
        return v instanceof HTMLElement;
    }

    static isNodeNested(child, parent) {
        let node = child;
        while (node) {
            if (node === parent) return true;
            node = node.parentNode;
        }
        return false;
    }

    static isHTMLString(v) {
        if (!Ut.isString(v)) return false;
        const doc = new DOMParser().parseFromString(v.trim(), 'text/html');
        return [...doc.body.childNodes].some(n => n.nodeType === 1);
    }

    static isInDOM(el) {
        return el && el.nodeType === 1 && document.body.contains(el);
    }

    static isEmpty(v) {
        if (v == null) return true;
        if (typeof v === 'string' || Array.isArray(v)) return v.length === 0;
        if (typeof v === 'object') return Object.keys(v).length === 0;
        return false;
    }

    static isType(val, type) {
        const t = typeof val;
        switch (type.toLowerCase()) {
            case 'string':
                return t === 'string';
            case 'number':
                return t === 'number' && !isNaN(val);
            case 'float':
                return t === 'number' && !Number.isInteger(val);
            case 'boolean':
                return t === 'boolean';
            case 'function':
                return t === 'function';
            case 'object':
                return val !== null && t === 'object' && !Array.isArray(val);
            case 'array':
                return Array.isArray(val);
            case 'null':
                return val === null;
            case 'undefined':
                return typeof val === 'undefined';
            default:
                return Object.prototype.toString.call(val).toLowerCase().includes(type.toLowerCase());
        }
    }

    static isTypeEqual(a, b) {
        return typeof a === typeof b &&
            (Array.isArray(a) === Array.isArray(b)) &&
            (Ut.isNull(a) === Ut.isNull(b));
    }

    static matchPattern(str, pattern) {
        if (!Ut.isString(str)) return false;
        return pattern instanceof RegExp ? pattern.test(str) : false;
    }

    static assert(condition, msg = 'Assertion failed') {
        if (!condition) throw new Error(msg);
    }

    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __ common

    static callIf(fn, condition, ...args) {
        return condition ? fn(...args) : undefined;
    }

    static hasKeys(obj, ...keys) {
        if (!Ut.isObject(obj)) return false;
        return keys.every(k => k in obj);
    }

    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    static between(value, min, max) {
        return value >= min && value <= max;
    }

    static ensureArray(v) {
        return Array.isArray(v) ? v : [v];
    }

    static deepClone(from, to) {
        if (from === null || typeof from !== "object") return from;
        if (from.constructor !== Object && from.constructor !== Array) return from;
        if (from.constructor === Date || from.constructor === RegExp || from.constructor === Function ||
            from.constructor === String || from.constructor === Number || from.constructor === Boolean) {
            return new from.constructor(from);
        }

        to = to || new from.constructor();

        for (name in from) {
            to[name] = typeof to[name] == "undefined" ? Ut.deepClone(from[name], null) : to[name];
        }

        return to;
    }

    static clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    static copy(obj) {
        return Ut.deepClone(obj, null);
    }
    static mergeArrays(base, ...arrays) {
        return base.map((v, i) => {
            for (const arr of arrays) {
                if (Array.isArray(arr) && i < arr.length && arr[i] != null) {
                    return arr[i];
                }
            }
            return v;
        });
    }

    static debounce(fn, delay = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }

    static throttle(fn, limit = 300) {
        let waiting = false;
        return (...args) => {
            if (!waiting) {
                fn(...args);
                waiting = true;
                setTimeout(() => waiting = false, limit);
            }
        };
    }

    /**
     * Examples:
     * Ut.sprintf("Hello {0} my friend, i am {1}", "Mr.Morrison", "John")
     * @param string
     * @param args
     * @returns {void|*}
     */
    static sprintf  (string, ...args) {
        return string.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    }

    // low = 0
    // medium = 1
    // high = 2
    /**
     * Use `Camera.detailLevel(camera.zoom)`
     * @deprecated replaced to `Camera.detailLevel`
     */
    static cameraDetailLevel(zoom) {
        if (zoom > 10) return 3;
        if (zoom > 2) return 2;
        if (zoom > 0.5) return 1;
        return 0;
    }

    /**
     * ```
     * Ut.rangeValue(percent, 10, 80);
     * ```
     */
    static rangeValue = (value, outMin, outMax, inMin = 0, inMax = 100) =>
        outMin + ((outMax - outMin) / (inMax - inMin)) * (value - inMin);

    /**
     * ```
     * Ut. loop(
     *      (delta, iteration, animator) => {},
     *      30
     * )
     * ```
     * @returns {AnimationLoop}
     */
    static loop (render, fps = 30) {
        const animator = new AnimationLoop({
            update: (delta, iteration, renderRequest) => {
                renderRequest()
            },
            render: (delta, iteration) => {
                render(delta, iteration, animator);
            },
            fixedDelta: 1 / fps,
            timeScale: 1
        });
        return animator
    }

    /**
     * ```
     * serialize(["id", "x", "y", "z", "type"])
     * ```
     * @param obj
     * @param allowedKeys
     * @returns {{}}
     */
    static serialize(obj, allowedKeys = []) {
        const dto = {};
        for (const key of allowedKeys) {
            if (obj[key] !== undefined && typeof obj[key] !== "function") {
                dto[key] = obj[key];
            }
        }
        return dto;
    }

    // Convert An Image To A DataURL or Base64 String Using JavaScript
    static getBase64StringFromDataURL (dataURL) {
        return dataURL.replace('data:', '').replace(/^.+,/, '');
    }

    //  static loadModule = async (path = '') => {
    //     const { default: instance } = await import(path.endsWith('.js') ? path : path + '.js' );
    //     return instance
    // }
}



function generateNoise(ctx, w, h, color1, color2) {
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < w * h; i++) {
        const isColor1 = Math.random() > 0.5;
        const [r, g, b] = isColor1 ? color1 : color2;

        const idx = i * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255; // альфа
    }

    ctx.putImageData(imageData, 0, 0);
}



