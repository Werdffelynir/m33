import {InputControl} from "../../../engine/InputControl.js";
import {Keybro} from "../Keybro.js";



export class GlobalInputControl extends InputControl {

    setup() {
        /**
         * Get global register
         * @type {Application|Register} */
        const register = this.manager.register
        console.log(`{GlobalInputControl} Run once, when manager exec setup()`)
        console.log( this.manager)
       // this.manager.keyboardManager.keymap = Keybro

        /*
        // Set new target
        this.manager.mouseManager.setTargetElement(element)
        this.manager.keyboardManager.setTargetElement(element)

        // Mouse event handler
        // event name set in manager configuration with array param "eventsNames"
        // callback return as arguments MouseManagerParams and PointerEvent
        //
        this.addMouseListener(MOUSE_EVENT.CLICK, (m, e) => this.globalMouseClick(m, e))
         */
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
            this.manager.register.componentManager.get('EscMenuComponent').show()
            event.preventDefault();
        }

        if (key === 'KeyC' && event.shiftKey) {
            console.dir(this.manager.register)
        }

        if (key === 'KeyL' && event.shiftKey) {
            const sandbox = this.manager.register.componentManager.get('BasicSandboxComponent')
            //
            if (sandbox.loopman.get('global').running) {
                if (this._sundboxOn !== false) {
                    this._sundboxOn = false;
                    sandbox.mouseman.eventsOn =  this._sundboxOn;
                    sandbox.loopman.pause('global')
                } else {
                    this._sundboxOn = true;
                    sandbox.mouseman.eventsOn =  this._sundboxOn;
                    sandbox.loopman.resume('global')
                }
            }

        }

    }
}

