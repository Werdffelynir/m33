import {InputControl} from "../../../engine/InputControl.js";
import {Keybro} from "./Keybro.js";
import {STATUSES} from "../../../engine/Register.js";


export class GlobalInputControl extends InputControl {

    // examples: {enabled: true, value: null, type: keyboard|wheel},
    // controllers = {};
    // addController(name, cb, type = 'keyboard') {
    //     this.controls[name] = {enabled: true, type, value: cb}
    // };
    // enableController(name, enable = true) {
    //     this.controls[name].enable = enable
    // };

    setup() {
        /**
         * Get global register
         * @type {Application|Register} */
        const register = this.manager.register
        /** @type {MouseManager}  */
        this.mouseman = this.manager.mouseManager
        /** @type {KeyboardManager}  */
        this.keyman = this.manager.keyboardManager

        this.getComponent = (name) => this.manager.register.componentManager.get(name)

        // Set new target
        // this.manager.mouseManager.setTargetElement(element)
        // this.manager.keyboardManager.setTargetElement(element)

        // Mouse event handler
        // event name set in manager configuration with array param "eventsNames"
        // callback return as arguments MouseManagerParams and PointerEvent
        // this.addMouseListener(MOUSE_EVENT.CLICK, (m, e) => this.globalMouseClick(m, e))
    }

    /**
     *
     * @param event {WheelEvent}
     */
    onWheel(event) {

        if (this.register.state.status === STATUSES.PLAYING) {}

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


        // --tumbler (only mousedown)
        if (event.type !== "keydown") return;


        if (this.getComponent('EscMenuComponent') && event.code === "Escape") {
            console.log('Escape key stopped!')
            this.getComponent('EscMenuComponent').toggle()
            event.preventDefault();
        }

    }
}
