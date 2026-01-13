import {IManager} from "./IManager.js";



export const KEYS = {
    Enter:        { key: 'Enter',        code: 'Enter',          keyCode: 13 },
    Escape:       { key: 'Escape',       code: 'Escape',         keyCode: 27 },
    Space:        { key: ' ',            code: 'Space',          keyCode: 32 },
    Tab:          { key: 'Tab',          code: 'Tab',            keyCode: 9 },

    ArrowLeft:    { key: 'ArrowLeft',    code: 'ArrowLeft',      keyCode: 37 },
    ArrowUp:      { key: 'ArrowUp',      code: 'ArrowUp',        keyCode: 38 },
    ArrowRight:   { key: 'ArrowRight',   code: 'ArrowRight',     keyCode: 39 },
    ArrowDown:    { key: 'ArrowDown',    code: 'ArrowDown',      keyCode: 40 },

    ShiftLeft:    { key: 'Shift',        code: 'ShiftLeft',      keyCode: 16 },
    ShiftRight:   { key: 'Shift',        code: 'ShiftRight',     keyCode: 16 },
    ControlLeft:  { key: 'Control',      code: 'ControlLeft',    keyCode: 17 },
    ControlRight: { key: 'Control',      code: 'ControlRight',   keyCode: 17 },
    AltLeft:      { key: 'Alt',          code: 'AltLeft',        keyCode: 18 },
    AltRight:     { key: 'Alt',          code: 'AltRight',       keyCode: 18 },
    MetaLeft:     { key: 'Meta',         code: 'MetaLeft',       keyCode: 91 },
    MetaRight:    { key: 'Meta',         code: 'MetaRight',      keyCode: 92 },
    CapsLock:     { key: 'CapsLock',     code: 'CapsLock',       keyCode: 20 },
    NumLock:      { key: 'NumLock',      code: 'NumLock',        keyCode: 144 },
    ScrollLock:   { key: 'ScrollLock',   code: 'ScrollLock',     keyCode: 145 },

    Insert:       { key: 'Insert',       code: 'Insert',         keyCode: 45 },
    Delete:       { key: 'Delete',       code: 'Delete',         keyCode: 46 },
    Home:         { key: 'Home',         code: 'Home',           keyCode: 36 },
    End:          { key: 'End',          code: 'End',            keyCode: 35 },
    PageUp:       { key: 'PageUp',       code: 'PageUp',         keyCode: 33 },
    PageDown:     { key: 'PageDown',     code: 'PageDown',       keyCode: 34 },
    PrintScreen:  { key: 'PrintScreen',  code: 'PrintScreen',    keyCode: 44 },
    Pause:        { key: 'Pause',        code: 'Pause',          keyCode: 19 },

    F1:  { key: 'F1',  code: 'F1',  keyCode: 112 },
    F2:  { key: 'F2',  code: 'F2',  keyCode: 113 },
    F3:  { key: 'F3',  code: 'F3',  keyCode: 114 },
    F4:  { key: 'F4',  code: 'F4',  keyCode: 115 },
    F5:  { key: 'F5',  code: 'F5',  keyCode: 116 },
    F6:  { key: 'F6',  code: 'F6',  keyCode: 117 },
    F7:  { key: 'F7',  code: 'F7',  keyCode: 118 },
    F8:  { key: 'F8',  code: 'F8',  keyCode: 119 },
    F9:  { key: 'F9',  code: 'F9',  keyCode: 120 },
    F10: { key: 'F10', code: 'F10', keyCode: 121 },
    F11: { key: 'F11', code: 'F11', keyCode: 122 },
    F12: { key: 'F12', code: 'F12', keyCode: 123 },

    Digit0: { key: '0', code: 'Digit0', keyCode: 48 },
    Digit1: { key: '1', code: 'Digit1', keyCode: 49 },
    Digit2: { key: '2', code: 'Digit2', keyCode: 50 },
    Digit3: { key: '3', code: 'Digit3', keyCode: 51 },
    Digit4: { key: '4', code: 'Digit4', keyCode: 52 },
    Digit5: { key: '5', code: 'Digit5', keyCode: 53 },
    Digit6: { key: '6', code: 'Digit6', keyCode: 54 },
    Digit7: { key: '7', code: 'Digit7', keyCode: 55 },
    Digit8: { key: '8', code: 'Digit8', keyCode: 56 },
    Digit9: { key: '9', code: 'Digit9', keyCode: 57 },

    KeyA: { key: 'a', code: 'KeyA', keyCode: 65 },
    KeyB: { key: 'b', code: 'KeyB', keyCode: 66 },
    KeyC: { key: 'c', code: 'KeyC', keyCode: 67 },
    KeyD: { key: 'd', code: 'KeyD', keyCode: 68 },
    KeyE: { key: 'e', code: 'KeyE', keyCode: 69 },
    KeyF: { key: 'f', code: 'KeyF', keyCode: 70 },
    KeyG: { key: 'g', code: 'KeyG', keyCode: 71 },
    KeyH: { key: 'h', code: 'KeyH', keyCode: 72 },
    KeyI: { key: 'i', code: 'KeyI', keyCode: 73 },
    KeyJ: { key: 'j', code: 'KeyJ', keyCode: 74 },
    KeyK: { key: 'k', code: 'KeyK', keyCode: 75 },
    KeyL: { key: 'l', code: 'KeyL', keyCode: 76 },
    KeyM: { key: 'm', code: 'KeyM', keyCode: 77 },
    KeyN: { key: 'n', code: 'KeyN', keyCode: 78 },
    KeyO: { key: 'o', code: 'KeyO', keyCode: 79 },
    KeyP: { key: 'p', code: 'KeyP', keyCode: 80 },
    KeyQ: { key: 'q', code: 'KeyQ', keyCode: 81 },
    KeyR: { key: 'r', code: 'KeyR', keyCode: 82 },
    KeyS: { key: 's', code: 'KeyS', keyCode: 83 },
    KeyT: { key: 't', code: 'KeyT', keyCode: 84 },
    KeyU: { key: 'u', code: 'KeyU', keyCode: 85 },
    KeyV: { key: 'v', code: 'KeyV', keyCode: 86 },
    KeyW: { key: 'w', code: 'KeyW', keyCode: 87 },
    KeyX: { key: 'x', code: 'KeyX', keyCode: 88 },
    KeyY: { key: 'y', code: 'KeyY', keyCode: 89 },
    KeyZ: { key: 'z', code: 'KeyZ', keyCode: 90 },

    Numpad0:        { key: '0',       code: 'Numpad0',        keyCode: 96 },
    Numpad1:        { key: '1',       code: 'Numpad1',        keyCode: 97 },
    Numpad2:        { key: '2',       code: 'Numpad2',        keyCode: 98 },
    Numpad3:        { key: '3',       code: 'Numpad3',        keyCode: 99 },
    Numpad4:        { key: '4',       code: 'Numpad4',        keyCode: 100 },
    Numpad5:        { key: '5',       code: 'Numpad5',        keyCode: 101 },
    Numpad6:        { key: '6',       code: 'Numpad6',        keyCode: 102 },
    Numpad7:        { key: '7',       code: 'Numpad7',        keyCode: 103 },
    Numpad8:        { key: '8',       code: 'Numpad8',        keyCode: 104 },
    Numpad9:        { key: '9',       code: 'Numpad9',        keyCode: 105 },
    NumpadMultiply: { key: '*',       code: 'NumpadMultiply', keyCode: 106 },
    NumpadAdd:      { key: '+',       code: 'NumpadAdd',      keyCode: 107 },
    NumpadSubtract: { key: '-',       code: 'NumpadSubtract', keyCode: 109 },
    NumpadDecimal:  { key: '.',       code: 'NumpadDecimal',  keyCode: 110 },
    NumpadDivide:   { key: '/',       code: 'NumpadDivide',   keyCode: 111 },
    NumpadEnter:    { key: 'Enter',   code: 'NumpadEnter',    keyCode: 13 }, // numpad Enter often shares Enter keyCode
};



/**
 *
 * ```
 * keymap.up.pressed, keymap.up.shiftKey
 *
 *
 * ```
 **/
const CONTROL_BUTTONS = {
    up: { pressed: false, codes: ['KeyW', 'ArrowUp', 'Numpad8'], callbacks: [] },
    down: { pressed: false, codes: ['KeyS', 'ArrowDown', 'Numpad2'], callbacks: [] },
    left: { pressed: false, codes: ['KeyA', 'ArrowLeft', 'Numpad4'], callbacks: [] },
    right: { pressed: false, codes: ['KeyD', 'ArrowRight', 'Numpad6'], callbacks: [] },

    start: { pressed: false, codes: ['Enter', ], callbacks: [] },
    pause: { pressed: false, codes: ['KeyP', ], callbacks: [] },
    select: { pressed: false, codes: ['Space', ], callbacks: [] },

    a: { pressed: false, codes: ['KeyZ'], callbacks: [] },
    b: { pressed: false, codes: ['KeyX'], callbacks: [] },
    c: { pressed: false, codes: ['KeyC'], callbacks: [] },
    d: { pressed: false, codes: ['KeyV'], callbacks: [] },

    action1: { pressed: false, codes: ['Digit1'], callbacks: [] },
    action2: { pressed: false, codes: ['Digit2'], callbacks: [] },
    action3: { pressed: false, codes: ['Digit3'], callbacks: [] },
    action4: { pressed: false, codes: ['Digit4'], callbacks: [] },
    action5: { pressed: false, codes: ['Digit5'], callbacks: [] },
}

/**
 * ```
 * keyman = new KeyboardManager(register)
 * keyman.configured({
 *     keymap: keymap,
 * });
 * keyman.init();
 *
 * keyman.onKey('KeyY', (pressed, event) => {
 *     console.log({pressed, event}) // {pressed: true, event: KeyboardEvent}
 * })
 *
 * keyman.onKey('*', this.onpress);
 *
 * // For use in loop
 * isPressed('KeyW');
 * isPressed('KeyW', () => {});
 * ```
 * ```
 * // reaction for mousedown and mouseup
 * keyman.onKey('KeyY', (pressed, event) => {
 *      // {pressed: true, event: KeyboardEvent}
 *
 *      // event.shiftKey: false,
 *      // event.ctrlKey: false,
 *      // event.altKey: false
 * })
 *
 * // call once, on event mousedown
 * keyman.onKeyJust('KeyY', (pressed, event) => {
 *     // {pressed: true, event: KeyboardEvent}
 * })
 *
 * // for loops
 * keyman.keymap.pressed
 *
 * ```
 *
 */
export class KeyboardManager extends IManager {

    configured({keymap, onlyfocus, target}) {
        this.keymap = keymap ?? CONTROL_BUTTONS;
        this._keymap_cache = structuredClone(keymap);
        this._keys = {
            shiftKey: false,
            ctrlKey:false,
            altKey:false,
        };
        this._keysJustPressed = {};
        this._keysState = new Map();
        this.listeners = new Map();

        this.onlyfocus = onlyfocus ?? false;
        this.targetElement = target;

        this._onKeyDown = (e) => this._handleKey(e, true);
        this._onKeyUp = (e) => this._handleKey(e, false);
    }
    
    setTargetElement (element){
        this.targetElement = element
    }
    
    /**
     *
     * @returns {*|{pressed:boolean, shiftKey:boolean, ctrlKey:boolean, altKey:boolean}}
     */
    get keys () {
        return this._keys;
    }

    setup() {
        //this.targetElement = element;
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }

    async init(){
        this.setup()
    }

    _handleKey(event, pressed) {
        if (this.onlyfocus && this.targetElement !== document.activeElement) return;

        this._keysState.set(event.code, pressed);
        const listenerCallbacks = this.listeners.get(event.code) || this.listeners.get(event.key);

        if (pressed) {
            this._keys[event.key] = true;
            this._keys[event.code] = true;
            this._keys.shiftKey = event.shiftKey;
            this._keys.ctrlKey = event.ctrlKey;
            this._keys.altKey = event.altKey;

            for (const [key, dat] of Object.entries(this.keymap)) {
                for (let i = 0; i < dat.codes.length; i++) {
                    if (event.code === dat.codes[i]) {
                        dat.pressed = true;
                        dat.shiftKey = event.shiftKey;
                        dat.ctrlKey = event.ctrlKey;
                        dat.altKey = event.altKey;
                    }
                }
                if (dat.pressed && dat.callbacks && dat.callbacks.length) {
                    for (let j = 0; j < dat.callbacks.length; j++) {
                        if (typeof dat.callbacks[j] === 'function')  dat.callbacks[j](true);
                    }
                }
            }
        } else {
            this._keys[event.key] = false;
            this._keys[event.code] = false;
            this._keys.shiftKey = false;
            this._keys.ctrlKey = false;
            this._keys.altKey = false;

            for (const [key, dat] of Object.entries(this.keymap)) {
                for (let i = 0; i < dat.codes.length; i++) {
                    if (event.code === dat.codes[i]) {
                        dat.pressed = false;
                        dat.shiftKey = false;
                        dat.ctrlKey = false;
                        dat.altKey = false;
                    }
                }
            }
        }

        if (this.listeners.get('*')){
            this.listeners.get('*').forEach(cb => cb(pressed, event));
        }

        if (listenerCallbacks) {
            listenerCallbacks.forEach(cb => cb(pressed, event));
        }
    }

    /**
     * For use in loop
     * ```
     * isPressed('KeyW');
     * isPressed('KeyW', () => {});
     *
     * // With option
     * {shiftKey: true, ctrlKey: false, altKey: false, [event.key]: false,  [event.code]: false }
     *
     * this.keyman.isPressed('KeyS', null, {shiftKey: true, altKey: true})      // 'S+Alt'
     * this.keyman.isPressed('KeyS', null, {'S': true})                         // 'S' alternative for shiftKey = true
     * this.keyman.isPressed('KeyS', null, {'KeyW': true})                      // 's+w'
     *
     * // alternative if key "up" is mapped:
     * keymap.up.pressed
     * ```
     * @param code
     * @param callback
     * @param options {{shiftKey: true, ctrlKey: false, altKey: false}|null}
     * @returns {boolean}
     */
    isPressed(code, callback = null, options = null) {
        let keyIsPressed = this._keysState.has(code) && this._keysState.get(code) === true;

        if (options)
            for (const [okey, oval] of Object.entries(options)) {
                let _keyIsPressed = this._keys?.[okey] && this._keys?.[code] === oval;
                if (keyIsPressed)
                    keyIsPressed = _keyIsPressed;
            }

        if (callback && typeof callback === 'function' && keyIsPressed) {
            return callback()
        }

        return keyIsPressed;
    }

    /**
     * ```
     * onKey('KeyY', (pressed, event) => {
     *     console.log({pressed, event}) // {pressed: bool, event: KeyboardEvent}
     * })
     * // Catch all events
     * onKey('*', (pressed, event) => {
     *     console.log({pressed, event}) // {pressed: bool, event: KeyboardEvent}
     * })
     * ```
     * @param code
     * @param callback
     */
    onKey(code, callback) {
        if (!this.listeners.has(code)) {
            this.listeners.set(code, []);
        }
        this.listeners.get(code).push(callback);
    }
    /**
     * ```
     * onKeyJust(code,  (keys, event) => {
     *
     * })
     * ```
     * @param code
     * @param callback
     */
    onKeyJust(code, callback) {
        this.onKey(code, (pressed, event) => {
            if(event.type === 'keydown') {
                if (this._keysJustPressed?.[code]) return;
                callback(this._keys, event)
                this._keysJustPressed[code] = true;
            } else {
                this._keysJustPressed[code] = false;
            }
        });
    }

    clear() {
        this._keysState.clear();
        this.listeners.clear();
        this._keysJustPressed = {}
    }

    destroy() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);

        this.keymap = this._keymap_cache
        // delete this.targetElement;
    }
}