import {InputControl} from "../../../engine/InputControl.js";
import {MOUSE_EVENT} from "../../../engine/MouseManager.js";


export class SidebarInputControl extends InputControl {

    setup() {
        // const target = this.register.screenman.get('IndexScreen').page.elements['sidebar-left']

        this.addMouseListener(MOUSE_EVENT.BUTTON4, (e, m) => {
            console.log(this.constructor.name, e, m)
        })
        this.addMouseListener(MOUSE_EVENT.BUTTON5, (e, m) => {
            console.log(this.constructor.name, e, m)
        })
    }
    /**
     *
     * @param event {WheelEvent}
     */
    onWheel(event) {
        console.log(`${this.constructor.name}.onWheel`, [event.deltaX, event.deltaY])
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
        if (key === 'Escape') {
            console.log('Escape key stopped!')
            event.preventDefault();
        }
    }
}
