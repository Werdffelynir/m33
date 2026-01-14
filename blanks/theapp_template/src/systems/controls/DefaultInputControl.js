import {InputControl} from "../../../engine/InputControl.js";
import {Keybro} from "../Keybro.js";



export class DefaultInputControl extends InputControl {
    /**
     * @param mouse {MouseManagerParams}
     * @param event {PointerEvent}
     */
    globalMouseClick(mouse, event) {
        console.log(this.constructor.name, mouse, event)
    }

    // custom work with focus
    // Set new target
    setTarget(target) {
        this.manager.mouseManager.setTargetElement(target)
        this.manager.keyboardManager.setTargetElement(target)
    }
    set onlyfocus(n) {this.manager.mouseManager.onlyfocus = n}
    get onlyfocus() {return this.manager.mouseManager.onlyfocus}


    setup() {
        console.log(`${this.constructor.name} Run once, when manager exec setup()`)

        /**
         * Get global register
         * @type {Application|Register} */
        const register = this.manager.register

        this.manager.keyboardManager.keymap = Keybro

        // Mouse event handler
        // event name set in manager configuration with array param "eventsNames"
        //
        // callback return as arguments MouseManagerParams and PointerEvent

        // this.addMouseListener(MOUSE_EVENT.CLICK, (m, e) => this.globalMouseClick(m, e))


    }

    /**
     *
     * @param event {WheelEvent}
     */
    onWheel(event) {
        //
        //
        // console.log(`${this.constructor.name}.onWheel`, [event.deltaX, event.deltaY])
    }

    /**
     * ```
     * keymap.START.pressed && keyman.keys.shiftKey
     * ```
     * @param event {KeyboardEvent}
     */
    onKeypress(event) {
        // --switcher (mousedown mouseup)
        if (event.type !== "keydown") return;
        // --tumbler (only mousedown)

        const key = event.code;

        //
        // Keybro
        const keymap = this.manager.keyboardManager.keymap

        //
        //
        //
        // console.log(`${this.constructor.name}.onKeyboard`, key)
        if (key === 'Escape') {
            console.log('Escape key stopped!')
            event.preventDefault();
        }

        if (key === 'KeyC') {
            console.dir(this.manager.register)
        }
    }
}

