import {UIIHint} from "./UIIHint.js";
import {UIILabel} from "./UIILabel.js";


/**
 * - hint
 * - label
 *
 * @param type
 * @param args
 * @returns {UIILabel|UIIHint}
 */
export function createUIIElement(type, args) {
    switch(type) {
        case 'hint': return new UIIHint(...args);
        case 'label': return new UIILabel(...args);
        default: throw new Error('Unknown type');
    }
}
