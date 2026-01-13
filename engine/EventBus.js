import {Ut} from "./Ut.js";

/**
 * ```
 * eb = EventBus()
 *
 *
 * this.eventBus.publish(eventName, data);
 * this.eventBus.subscribe(eventName, handler);
 * this.eventBus.unsubscribe(eventName, handler);
 * ```
 */
export class EventBus {

    static CLICK = 'click'
    static DBLCLICK = 'dblclick'
    static MOUSEMOVE = 'mousemove'
    static MOUSEDOWN = 'mousedown'
    static MOUSEUP = 'mouseup'
    static CONTEXTMENU = 'contextmenu'

    availableEventTypes = [
        'click',
        'dblclick',
        'mousemove',
        'mousedown',
        'mouseup',
        'contextmenu',
        'mouseenter',
        'mouseleave',
        'mouseout',
        'mouseover',
        'dragstart',
        'dragover',
        'drop',
        'dragend',
    ];

    constructor() {
        this.listeners = new Map();

        this.events = {
            click: new Set(),
            dblclick: new Set(),
            contextmenu: new Set(),
            mousemove: new Set(),
            mousedown: new Set(),
            mouseup: new Set(),
            mouseenter: new Set(),
            mouseleave: new Set(),
            mouseout: new Set(),
            mouseover: new Set(),
            dragstart: new Set(),
            dragover: new Set(),
            drop: new Set(),
            dragend: new Set(),
        };
    }

    clear() {
        this.listeners.clear()
    }

    /**
     * ```
     *  subscribe(event, callback)
     *  subscribe(`click:id:ATTR_NAME`, ( {event, target, data, name} ) => { })
     * ```
     */
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        GLog(1, `<${this.constructor.name}.subscribe>`, event);

        this.listeners.get(event).add(callback);
    }

    has(event, callback) {
        return this.listeners.has(event) && this.listeners.get(event).has(callback);
    }

    unsubscribe(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.listeners.delete(event); // очищення порожніх записів
            }
        }
    }

    publish(event, data) {
        const callbacks = this.listeners.get(event);

        if (callbacks) {
            for (const cb of callbacks) {
                GLog(1, `<${this.constructor.name}.publish>`, event);
                cb(data);
            }
        }
    }

    /**
     * ```
     * // handling 'click' event for all elements with attrs `data-id=ATTR_NAME`
     * eventBus.bused(element, 'click', 'id');
     * eventBus.bused(element, 'click', 'var');
     *
     * subscribe(`click:id:ATTR_NAME`, ( {event, target, data, name} ) => { })
     * subscribe(`click:var:ATTR_NAME`, ( {event, target, data, name} ) => { })
     *
     * eventBus.bused(element, 'mousedown' 'id', 'uii');
     * subscribe(`uii:mousedown:id:ATTR_NAME`, ( {event, target, data, name} ) => { })
     *
     *
     * eventBus.bused(element, 'mousedown' 'id');
     * eventBus.bused(element, 'mouseup' 'id');
     *
     * ```
     * @param element
     * @param eventType
     * @param attr
     * @param prefix
     * @returns {*|void}
     */
    bused (element, eventType = 'click', attr = 'id', prefix = null) {

        if (this._bused.has(element) && this._bused.get(element) === eventType) return console.warn(`Warning. Added clone element with event`);

        if (!this.availableEventTypes.includes(eventType)) return console.warn(
            `ErrorType. Invalid parameter "${eventType}". Use: "${this.availableEventTypes.join(',')}"`);

        const listeners = (e) => {
            const target = e.target.closest(`[data-${attr}]`);

            if (target) {
                const data = target.dataset[attr];
                const path = (prefix?`${prefix}:`:``) + `${eventType}:${attr}:${data}`;

                this.publish(path, { data: data, name: attr, target, event: e });
            }
        };

        element.removeEventListener(eventType, listeners);
        element.addEventListener(eventType, listeners);

        this._bused.set(element, eventType);

        return element;
    }

    _bused = new Map();

    /**
     * add events element  ['click', 'dblclick']  , 'id' , [prefix]
     * click:id:VAR_NAME
     * dblclick:id:VAR_NAME
     *
     * with prefix - PREFIX_NAME:click:id:VAR_NAME
     *
     * ```
     *  busme(element, ['click', 'dblclick'])
     *  subscribe(`click:id:ATTR_NAME`, ( {event, target, data, name} ) => { })
     *
     *  ['click', 'dblclick', 'mousemove', 'mousedown', 'mouseup', 'contextmenu'];
     *  busme(element, eventsType = [], attr = 'id', prefix = null)
     *
     *  busme(element, ['mousedown', 'mouseup'])
     *  subscribe(`click:id:ATTR_NAME`, ( {event, target, data, name} ) => { })
     *
     *  busme(element, ['mousedown', 'mouseup',], 'ui') // dataset = ui [data-ui=*]
     *  subscribe(`click:ui:ATTR_NAME`, ( {event, target, data, name} ) => { })
     *
     *  busme(element, ['click', 'dblclick', 'contextmenu'], 'id', prefix = 'jop')
     *  subscribe(`jop:click:id:ATTR_NAME`, ( {event, target, data, name} ) => { })
     *  subscribe(`jop:dblclick:id:ATTR_NAME`, ( {event, target, data, name} ) => { })
     * ```
     */
    busme(element, eventsType = ['click'], attr = 'id', prefix = null) {

        if (Array.isArray(eventsType)) {
            eventsType.forEach(eventType =>  this.bused(element, eventType, attr));
        }

        if (Ut.isString(eventsType)) {
            this.bused(element, eventsType, attr, prefix);
        }
    }

}
