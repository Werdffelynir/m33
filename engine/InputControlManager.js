import {ICommander} from "./ICommander.js";
import {MouseManager} from "./MouseManager.js";
import {KeyboardManager} from "./KeyboardManager.js";
import {InputControl} from "./InputControl.js";



/**
 * ```
 *
 * const target = this.screenman.get('IndexScreen').page.elements['sidebar-left']
 * target.setAttribute('tabindex', '-1')
 *
 * const inputsManager = new InputControlManager(this)
 * inputsManager.configured({
 *     // target: target, // default `document.body`
 *     // onlyfocus: false,
 *     // keyboardManager: this.keyboardManager,
 *     // mouseManager: this.mouseManager,
 * })
 *
 * inputsManager.addControl('general', new GlobalInputControl())
 * inputsManager.addControl('sidebar', new SidebarInputControl())
 *
 * inputsManager.setup()
 *
 * inputsManager.switchControl('general')
 * inputsManager.switchControl('sidebar')
 *
 *
 * // key definition code object log
 * import {KEYS} from "../../engine/KeyboardManager.js";
 * console.log(KEYS)
 * ```
 */
export class InputControlManager extends ICommander {

    constructor(register) {
        super(register)
        this.controls = new Map()
        this.currentControl = null;
        this.eventsNames = [
            // 'left',
            // 'right',
            // 'middle',
            // 'mousedown',
            // 'mouseup',
            // 'mousemove',
            // 'mouseout',
            // 'mouseleave',
            'click',
            'dblclick',
            'wheel',
            'button4',
            'button5',
            'button6',
            'drag',
        ]
    }

    configured({keyboardManager, mouseManager, target, onlyfocus, eventsNames, keymap} = {}) {
        if(this.isConfigured) return; this.isConfigured = true;
        this.currentTarget = target ?? document.body;

        if (Array.isArray(eventsNames)) {
            this.eventsNames = eventsNames
        }

        if (!keyboardManager) {
            keyboardManager = new KeyboardManager(this.register);
            keyboardManager.configured({
                onlyfocus: !!this.onlyfocus,
                target: this.currentTarget,
                keymap: keymap,
            });
        }
        /** @type {KeyboardManager} */
        this.keyboardManager = keyboardManager;
        this.keyboardManager.setup();
        /** @type {MouseManager} */
        this.mouseManager = mouseManager ?? new MouseManager(this.register);
        this.mouseManager.configured({
            onlyfocus: !!this.onlyfocus,
            target: this.currentTarget,
            eventsOn: true,
            draggableOn: true,
        })
    }

    setup() {

        this.keyboardManager.onKey('*', (pressed, event) => {
            if (this.currentControl && this.currentControl.onKeypress) {
                this.currentControl.onKeypress(event)
            }
        });

        this.mouseManager.addListener('wheel', (mouse, event) => {
            if (this.currentControl && this.currentControl.onWheel) {
                this.currentControl.onWheel(event, mouse)
            }
        })

        Object.values(this.eventsNames).forEach(eventName => {
            this.mouseManager.addListener(eventName, (mouse, event) => {

                // Centred event HUB
                //
                //
                //
                if (this.currentControl?.eventHandlers?.has?.(eventName))
                    this.currentControl.eventHandlers.get(eventName)(mouse, event)
            })
        })
        this.mouseManager.setup()
    }

    removeControl() {
        this.currentControl = null;
    }

    /**
     * ```js
     * ```
     * @param key
     * @param control {InputControl}
     */
    addControl(key, control) {
        if (!(control instanceof InputControl))
            return console.warn(`Control ${key} not found`)

        control.register = this.register;
        control.manager = this;

        control?.setup?.({register:this.register, manager:this})

        this.controls.set(key, control)
    }

    switchControl(key) {
        if (!this.controls.has(key))
            return console.warn(`Control ${key} not found`)

        if (this.currentControl !== this.controls.get(key))
            this.currentControl = this.controls.get(key)
    }
}

