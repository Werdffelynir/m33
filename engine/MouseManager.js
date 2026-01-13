import {IManager} from "./IManager.js";
import {Ut} from "./Ut.js";


class MouseManagerParams {
    x = 0
    y = 0
    wheel = 0
    wheeled = false
    left = false
    middle = false
    right = false
    button4 = false
    button5 = false
    button6 = false
    isDragging = false
    drag = {x: 0, y: 0}
    dragStart = {x: 0, y: 0}
    mousedown = {x: 0, y: 0}
    mouseup = {x: 0, y: 0}
    shiftKey = false
    ctrlKey = false
    altKey = false
}

export const MOUSE_EVENT = {  // todo
    LEFT: 'left',
    RIGHT: 'right',
    MIDDLE: 'middle',
    MOUSEDOWN: 'mousedown',
    MOUSEUP: 'mouseup',
    MOUSEMOVE: 'mousemove',
    MOUSEOUT: 'mouseout',
    MOUSELEAVE: 'mouseleave',
    CLICK: 'click',
    DBLCLICK: 'dblclick',
    WHEEL: 'wheel',
    BUTTON4: 'button4',
    BUTTON5: 'button5',
    BUTTON6: 'button6',
    DRAG: 'drag',
};

/**
 *
 * Access to dynamic props `mouseman.mouse` {MouseManagerParams}
 *
 * Use:
 * ```
 * mouseman = new MouseManager(register)
 *
 * mouseman.configured ({
 *      mousetarget: HTMLElement,
 *      onlyfocus: false,
 * })
 * mouseman.setup ({target: HTMLElement})
 *
 * //
 * mouseman.addListener('click|right|wheel|mousemove...', callback)
 *
 * //
 * mouseman.destroy()
 *
 *
 * ```
 * ## Example simple
 * ```
 * mouseman = new MouseManager(register)
 * mouseman.configured({target: element})
 * mouseman.setup ()
 *
 * // array of keys
 * Object.values(MouseManager.NAMES) // todo
 * ```
 * ## Example with focus
 * ```
 *
 * ```
 */
export class MouseManager extends IManager {

    mouse = new MouseManagerParams();

    eventsNames = [...Object.values(MOUSE_EVENT)];

    constructor(register) {
        super(register)
        this.eventBus = register.eventBus;
        this.eventsCallbacks = new Map();
    }

    async init() {
    }

    /**
     * ```
     * configured ({target: HTMLElement, onlyfocus: false})
     * ```
     * @param target {HTMLElement|HTMLCanvasElement}
     * @param onlyfocus {boolean}
     * @param eventsOn {boolean}
     * @param scalingOn {boolean}
     * @param draggableOn {boolean}
     */
    configured({
                   target,
                   onlyfocus,
                   eventsOn,
                   scalingOn,
                   draggableOn} = {}) {

        this.eventsOn = eventsOn ?? true;
        this.onlyfocus = onlyfocus ?? true;
        this.draggableOn = draggableOn ?? true;
        this.scalingOn = scalingOn ?? true;
        this.targetElement = target;

        this._mousedown = (event) => this.eventsOn && this._handler(event, 'mousedown')
        this._click = (event) => this.eventsOn && this._handler(event, 'click')
        this._dblclick = (event) => this.eventsOn && this._handler(event, 'dblclick')
        this._mouseup = (event) => this.eventsOn && this._handler(event, 'mouseup')
        this._mouseout = (event) => this.eventsOn && this._handler(event, 'mouseout')
        this._mousemove = (event) => this.eventsOn && this._handler(event, 'mousemove')
        this._wheel = (event) => this.eventsOn && this._wheelHandler(event)
        this._contextmenu = (event) => this.eventsOn && this._handler(event, 'contextmenu')

        this.events = [
            ['mousedown', this._mousedown],
            ['click', this._click],
            ['dblclick', this._dblclick],
            ['mouseup', this._mouseup],
            ['mouseout', this._mouseout],
            ['mouseleave', this._mouseout],
            ['mousemove', this._mousemove],
            ['contextmenu', this._contextmenu],
            ['wheel', this._wheel],
        ];
    }
    setTargetElement (element){
        this.targetElement = element
    }
    /**
     * ```
     * setup( {target: HTMLElement} )
     * ```
     * @param target {HTMLElement|HTMLCanvasElement|*} Target for mouse */
    setup({target = null} = {}) {

        if (this.isInstalled) return;
        this.isInstalled = true;

        if (target && Ut.isNode(target)) {
            /** @type {HTMLElement|HTMLCanvasElement} */
            this.targetElement = target;
        }

        this.mouse = this.defaultMouseParams();

        for (const [event, handler] of this.events) {
            if (event === 'wheel') {
                this.targetElement.addEventListener(event, handler, {passive: true});
                continue;
            }

            this.targetElement.addEventListener(event, handler);
        }
    }

    destroy() {
        for (const [event, handler] of this.events) {
            if (event === 'wheel') {
                this.targetElement.removeEventListener(event, handler, {passive: true});
                continue;
            }
            this.targetElement.removeEventListener(event, handler);
        }

        this.mouse = this.defaultMouseParams();
        delete this.targetElement;
        this.isInstalled = false;
    }

    /**
     * for Layers -> Canvas is target
     *
     * See this.eventsNames
     * ```
     * .addListener('click|right|wheel|mousemove...', callback)
     * .addListener('right', callback right (mouse, event) )
     * .addListener('wheel', callback wheel (mouse, event) ) // mouse.wheel
     * .addListener('mousemove', callback mousemove (mouse, event))
     * .addListener('drag', callback drag (mouse, event) )
     * ```
     * @param eventName {string} left right click dblclick wheel mousedown mousemove mouseup contextmenu
     * @param callback
     */
    addListener(eventName, callback) {

        if (!this.eventsNames.includes(eventName))
            return console.warn(`Error Params: eventName="${eventName}" not valid!\n\tUse one of:\n ${this.eventsNames.join(', ')}`)

        if (!this.eventsCallbacks.has(eventName))
            this.eventsCallbacks.set(eventName, new Set());

        this.eventsCallbacks.get(eventName).add(callback);
    }

    _wheelHandler(event) {
        this.mouse.wheeled = event.deltaY !== 0;

        if (this.onlyfocus && this.targetElement !== document.activeElement) return;

        if (this.scalingOn) {
            this.mouse.wheel += event.deltaY > 0 ? 1 : -1;

            // this.eventBus.publish('mouse:wheel', {
            //     event,
            //     mouse: this.mouse,
            //     element: this.targetElement,
            //     deltaY: event.deltaY,
            //     deltaX: event.deltaX,
            //     ctrlKey: event.ctrlKey,
            // });
        }

        // handler for onWheel callbacks listeners
        this.eventsCallbacks.get('wheel')?.forEach((_cb) => _cb(this.mouse, event));
    }

    _updateModifierKeys(event) {
        this.mouse.shiftKey = !!event.shiftKey;
        this.mouse.ctrlKey = !!event.ctrlKey;
        this.mouse.altKey = !!event.altKey;
    }

    _updateMouseButtons (event, pressed) {
        const buttonMap = {
            1: 'left',
            2: 'middle',
            3: 'right',
            4: 'button4',
            5: 'button5',
            6: 'button6'
        };
        const key = buttonMap[event.which];

        if (key) this.mouse[key] = pressed;
    };

    _handler(event, type) {



        if (this.onlyfocus && this.targetElement !== document.activeElement) return;

        switch (type) {
            case 'mousemove':
                const rect = this.targetElement.getBoundingClientRect();

                this.mouse.x = event.clientX - rect.left;
                this.mouse.y = event.clientY - rect.top;
                // console.log('drag', this.draggableOn , this.mouse.isDragging)
                if (this.draggableOn && this.mouse.isDragging) {
                    const dx = (event.offsetX - this.mouse.dragStart.x);
                    const dy = (event.offsetY - this.mouse.dragStart.y);
                    this.mouse.dragStart.x = event.offsetX;
                    this.mouse.dragStart.y = event.offsetY;
                    this.mouse.drag.x = dx;
                    this.mouse.drag.y = dy;

                    this.eventsCallbacks.get('drag')?.forEach((_cb) => _cb(this.mouse, event));
                }

                this.eventsCallbacks.get('mousemove')?.forEach((_cb) => _cb(this.mouse, event));

                break;

            case 'mouseup':
                this._updateMouseButtons(event, false);
                this._updateModifierKeys(event); // clear modifiers

                this.mouse.isDragging = false;
                this.mouse.mouseup.x = this.mouse.x;
                this.mouse.mouseup.y = this.mouse.y;

                this.eventsCallbacks.get('mouseup')?.forEach((_cb) => _cb(this.mouse, event));

                break;

            case 'contextmenu':
                event.preventDefault();
                this._updateMouseButtons(event, true);
                this._updateModifierKeys(event);

                this.eventsCallbacks.get('contextmenu')?.forEach((_cb) => _cb(this.mouse, event));

                if (this.mouse.right === true && this.eventsCallbacks.has('right'))
                    this.eventsCallbacks.get('right').forEach((_cb) => _cb(this.mouse, event));

                break;

            case 'mouseout':
                this.mouse.isDragging = false;

                this.eventsCallbacks.get('mouseout')?.forEach((_cb) => _cb(this.mouse, event));

                break;

            case 'mousedown':
                this._updateMouseButtons(event, true);
                this._updateModifierKeys(event);

                this.mouse.isDragging = true;
                this.mouse.dragStart.x = event.offsetX;
                this.mouse.dragStart.y = event.offsetY;
                this.mouse.mousedown.x = this.mouse.x;
                this.mouse.mousedown.y = this.mouse.y;


                this.eventsCallbacks.get('mousedown')?.forEach((_cb) => _cb(this.mouse, event));

                ;['middle', 'button4', 'button5', 'button6'].forEach(buttonName => {
                    if (this.mouse[buttonName] === true && this.eventsCallbacks.has(buttonName)){
                        this.eventsCallbacks.get(buttonName).forEach((_cb) => _cb(this.mouse, event));
                    }
                })

                break;

            case 'click':
                this.eventsCallbacks.get('left')?.forEach((_cb) => _cb(this.mouse, event));
                this.eventsCallbacks.get('click')?.forEach((_cb) => _cb(this.mouse, event));

                break;

            case 'dblclick':
                this.eventsCallbacks.get('dblclick')?.forEach((_cb) => _cb(this.mouse, event));

                break;

            default:
        }
    }

    defaultMouseParams() {
        return new MouseManagerParams();
    }
}
