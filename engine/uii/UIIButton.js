import {UIIElement} from "./UIIElement.js";
import {UII_ATTR} from "./UII.js";

/**
 *
 * ```
 * uii = UII ({
 *      theme: 'themeDarkBlue',
 *      parent: parent,
 *      events:  ['click', 'dblclick', 'contextmenu', 'mousemove', 'mousedown', 'mouseup'],
 * })
 *
 * UIIButton = new UIIButton ( uii, 'keyName', {
 *      x: 0,
 *      y: 0,
 *      width: 80,
 *      onclick: (e) => {},
 *      ondblclick: (e) => {},
 *      oncontextmenu: (e) => {},
 * })
 *
 *
 * button.on('mousedown', (event, target) => {
 *     console.log(event.type, event, target)
 * })
 * button.on('click', (event, target) => {
 *     console.log(event.type, event, target)
 * })
 * button.on('dblclick', (event, target) => {
 *     console.log(event.type, event, target)
 * })
 * button.on('contextmenu', (event, target) => {
 *     console.log(event.type, event, target)
 * })
 * ```
 */
export class UIIButton extends UIIElement {

    /**
     *
     * @param uii {UII}
     * @param key
     * @param props
     */
    constructor(uii, key, props) {
        super(uii, key, props);
        this.width = props?.width || 80;
        this.type = 'button';
        this.props.cssClasses = [...['UII', 'UIIButton'], ...props?.cssClasses || []];
        this.element = super.create();

        if (props?.events) {
            this.uii.eventnamesBussed = new Set([
                ...this.uii.eventnamesBussed,
                ...props.events
            ])
        }

        // if (props?.onclick && typeof props.onclick === 'function') this.on('click', props.onclick)
        // if (props?.ondblclick && typeof props.ondblclick === 'function') this.on('dblclick', props.ondblclick);
        // if (props?.oncontextmenu && typeof props.oncontextmenu === 'function') this.on('contextmenu', props.oncontextmenu)
        // if (props?.onmousemove && typeof props.onmousemove === 'function') this.on('mousemove', props.onmousemove)
        // if (props?.onmousedown && typeof props.onmousedown === 'function') this.on('mousedown', props.onmousedown)
        // if (props?.onmouseup && typeof props.onmouseup === 'function') this.on('mouseup', props.onmouseup)

    }
    /**
     *
     * Types: 'click', 'dblclick', 'contextmenu', 'mousemove', 'mousedown', 'mouseup'
     * ```
     * on(eventType, callback)
     * ```
     * @param eventType
     * @param callback

    on(eventType, callback) {
        this.uii.eventsElementsListeners.get(eventType).set(this.key,  {
            key: this.key,
            path: `${eventType}:${UII_ATTR}:${this.key}`,
            instance: this,
            callback: (event, target) => {
                callback(event, target)
            },
        })
    }
*/
    destroy() {
        super.destroy();

    }

}