import {KEYS} from "../../../engine/KeyboardManager.js";


/**
 * Dynamic Object
 *
 * @return {Keybro}
 */
export const Keybro = {

    START: {pressed: false, codes: ['Space',], callbacks: []},
    EXIT: {pressed: false, codes: ['Escape',], callbacks: []},
    PAUSE: {pressed: false, codes: ['Tab', 'KeyP'], callbacks: []},
    SELECT: {pressed: false, codes: ['ShiftLeft', 'ShiftRight',], callbacks: []},
    UP: {pressed: false, codes: ['KeyW', 'ArrowUp', 'Numpad8'], callbacks: []},
    DOWN: {pressed: false, codes: ['KeyS', 'ArrowDown', 'Numpad2'], callbacks: []},
    LEFT: {pressed: false, codes: ['KeyA', 'ArrowLeft', 'Numpad4'], callbacks: []},
    RIGHT: {pressed: false, codes: ['KeyD', 'ArrowRight', 'Numpad6'], callbacks: []},
    A: {pressed: false, codes: ['KeyZ', 'KeyQ'], callbacks: []},
    B: {pressed: false, codes: ['KeyX', 'KeyE'], callbacks: []},
    C: {pressed: false, codes: ['KeyC', 'KeyF'], callbacks: []},
    D: {pressed: false, codes: ['KeyV', 'KeyR'], callbacks: []},

    w: {pressed: false, codes: ['KeyW',], callbacks: []},
    s: {pressed: false, codes: ['KeyS',], callbacks: []},
    a: {pressed: false, codes: ['KeyA',], callbacks: []},
    d: {pressed: false, codes: ['KeyD',], callbacks: []},
    q: {pressed: false, codes: ['KeyQ'], callbacks: []},
    e: {pressed: false, codes: ['KeyE'], callbacks: []},
    f: {pressed: false, codes: ['KeyF'], callbacks: []},
    r: {pressed: false, codes: ['KeyR'], callbacks: []},
    z: {pressed: false, codes: ['KeyZ'], callbacks: []},
    x: {pressed: false, codes: ['KeyX'], callbacks: []},
    c: {pressed: false, codes: ['KeyC'], callbacks: []},
    v: {pressed: false, codes: ['KeyV'], callbacks: []},

    dig1: {pressed: false, codes: ['Digit1',], callbacks: []},
    dig2: {pressed: false, codes: ['Digit2',], callbacks: []},
    dig3: {pressed: false, codes: ['Digit3',], callbacks: []},
    dig4: {pressed: false, codes: ['Digit4',], callbacks: []},
    dig5: {pressed: false, codes: ['Digit5',], callbacks: []},

    up: {pressed: false, codes: ['ArrowUp',], callbacks: []},
    down: {pressed: false, codes: ['ArrowDown',], callbacks: []},
    left: {pressed: false, codes: ['ArrowLeft',], callbacks: []},
    right: {pressed: false, codes: ['ArrowRight',], callbacks: []},

    shift: {pressed: false, codes: ['ShiftLeft'], callbacks: []},
    ctrl: {pressed: false, codes: ['CtrlLeft'], callbacks: []},
    alt: {pressed: false, codes: ['AltLeft'], callbacks: []},

    shiftRight: {pressed: false, codes: ['ShiftRight'], callbacks: []},
    ctrlRight: {pressed: false, codes: ['CtrlRight'], callbacks: []},
    altRight: {pressed: false, codes: ['AltRight'], callbacks: []},

    num0: {pressed: false, codes: ['Numpad0',], callbacks: []},
    num1: {pressed: false, codes: ['Numpad1',], callbacks: []},
    num2: {pressed: false, codes: ['Numpad2',], callbacks: []},
    num3: {pressed: false, codes: ['Numpad3',], callbacks: []},
    num4: {pressed: false, codes: ['Numpad4',], callbacks: []},
    num5: {pressed: false, codes: ['Numpad5',], callbacks: []},
    num6: {pressed: false, codes: ['Numpad6',], callbacks: []},
    num7: {pressed: false, codes: ['Numpad7',], callbacks: []},
    num8: {pressed: false, codes: ['Numpad8',], callbacks: []},
    num9: {pressed: false, codes: ['Numpad9',], callbacks: []},
    numDiv: {pressed: false, codes: ['NumpadDivide',], callbacks: []},
    numMul: {pressed: false, codes: ['NumpadMultiply',], callbacks: []},
    numSub: {pressed: false, codes: ['NumpadSubtract',], callbacks: []},
    numAdd: {pressed: false, codes: ['NumpadAdd',], callbacks: []},
    numEnt: {pressed: false, codes: ['NumpadEnter',], callbacks: []},
    numDec: {pressed: false, codes: ['NumpadDecimal',], callbacks: []},
}

console.log(KEYS)
console.log(Keybro)
