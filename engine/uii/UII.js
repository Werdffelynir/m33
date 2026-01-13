import {EventBus} from "../EventBus.js";
import {UIIBlock} from "./UIIBlock.js";
import {UIIHint} from "./UIIHint.js";
import {UIILabel} from "./UIILabel.js";
import {UIIText} from "./UIIText.js";
import {UIIMultitext} from "./UIIMultitext.js";
import {UIITextline} from "./UIITextline.js";
import {UIIElement} from "./UIIElement.js";
import {UIIButton} from "./UIIButton.js";
import {UIICanvas} from "./UIICanvas.js";
import {UIIEvents} from "./UIIEvents.js";
import {UIIPhaser} from "./UIIPhaser.js";
import {UIIRange} from "./UIIRange.js";
import {UIISign} from "./UIISign.js";
import {UIISwitcher} from "./UIISwitcher.js";
import {UIIBackgroundGrid} from "./UIIBackgroundGrid.js";
import {UIIMonitor} from "./UIIMonitor.js";

/*
UIIButton
UIICanvas
UIIElement
UIIEvents
UIIHint
UIILabel
UIIMultitext
UIIPhaser
UIIRange
UIISign
UIISwitcher
UIIText
UIITextline
=========================
createButton
createCanvas
createElement
createEvents
createHint
createLabel
createMultitext
createPhaser
createRange
createSign
createSwitcher
createText
createTextline

25.09.10     v 0.3.1
* */


//
// Element dataset attribute for 'data-uii' (element.dataset[UII_ATTR] = this.key)
//
export const UII_ATTR = 'uii';

export class UII {

    /**
     * ```
     * const uii = new UII({
     *      theme: 'themeDarkBlue',
     *      parent: parent,
     *      eventBus: new EventBus(),
     *      events:  ['click', 'dblclick', 'contextmenu', 'mousemove', 'mousedown', 'mouseup'],
     *
     *      // WARNING !
     *      // default properties for all UII elements
     *      props: {
     *          fixed: true,
     *          x: 0,
     *          y: 0,
     *          z: 0,
     *          width: 30,
     *          height: 30,
     *          content: true,
     *          style: {},
     *          cssClasses: ['UII', 'UIIBlock'],
     *      }
     * });
     *
     *
     * // uses eventBus
     * // eventBus common for all UII elements
     *
     * uii.eventBus.subscribe('click:id:btn1', handler);
     *
     * UIIButton = new UIIButton ( uii, 'keyName', {
     *      x: 0,
     *      y: 0,
     *      width: 80,
     *      click: (e) => {},
     *      dblclick: (e) => {},
     *      contextmenu: (e) => {},
     * })
     * ```
     * @property {HTMLElement} parent
     */
    constructor({theme, parent, eventBus, events, props = {}}) {
        this.theme = theme;
        this.parent = parent ?? document.createElement('div');
        this.eventBus = eventBus || new EventBus();
        this.eventnamesBussed = new Set();
        if (events) this.eventnamesBussed = new Set(events)
        this.props = {...{x:0,y:0,width:100,height:100}, ...props};
        this._appropriateProps(this.props);
        this.components = new Set();
        this.parent.classList.add('UIIRoot');
        this.parent.classList.add(this.theme);
        this.eventsElementsListeners = new Map( [
            [ 'click', new Map() ],
            [ 'dblclick', new Map() ],
            [ 'contextmenu', new Map() ],
            [ 'mousemove', new Map() ],
            [ 'mousedown', new Map() ],
            [ 'mouseup', new Map() ],
            [ 'mouseenter', new Map() ],
            [ 'mouseleave', new Map() ],
            [ 'mouseout', new Map() ],
            [ 'mouseover', new Map() ],
        ]);
    }

    // mouseenter
    // mouseleave
    // mousemove
    // mouseout
    // mouseover
    _appropriateProps(props) {
        this.x = props.x;
        this.y = props.y;
        this.width = props.width;
        this.height = props.height;
        delete props.x;
        delete props.y;
        delete props.width;
        delete props.height;
    }

    addComponent(component) {
        this.components.add(component);
    }

    getComponent(key) {
        return [...this.components].find((comp) => comp.key === key);
    }

    get root() {
        const node = document.createElement('div');
        this.components.forEach((component) => {
            if (!component.element.isConnected)
                node.appendChild(component.element);
        })
        return node;
    }

    /**
     * attached all UII elements to parent node
     *
     */
    attach() {
        this.afterConnected(() => {
            this.attachForce();
        })

        ;[...this.eventnamesBussed].forEach(eveName => {
            const lists = this.eventsElementsListeners.get(eveName);

            for (const [key, data] of lists.entries()) {
                const {callback, path, instance} = data;

                this.eventBus.subscribe(path, (payload) => {
                    callback.call(instance, payload.event, payload.target);
                });

            }
        })

        this.eventBus.busme(this.parent, [...this.eventnamesBussed], UII_ATTR)

        return this.parent;
    }

    attachForce() {
        this.components.forEach((component) => {

            if (!component.element.isConnected) {
                if (component.parent && component.parent.nodeType === Node.ELEMENT_NODE) {
                    component.parent.appendChild(component.element);
                } else {
                    this.parent.appendChild(component.element);
                }
            }
        })

        this.eventBus.publish('uii:attached')
    }

    withProps(props) {
        return {...this.props, ...props};
    }

    /**
     * ```
     * ui.create(UIIBlock, "main", {
     *     x: 0,
     *     y: 0,
     *     z: 0,
     *     width: 30,
     *     height: 30,
     *     fixed: true,
     *     content: true,
     *     style: {},
     *     cssClasses: ['UII', 'UIIBlock'],
     * });
     * ui.create(UIIElement, "main", {
     *     bused: true,
     *
     *     // special events warp
     *     bused: ['click', 'contextmenu'],
     * });
     * ui.create(UIIButton, "play", {
     *      context: "Play",
     *      x: 0,
     *      y: 0,
     *      width: 80,
     *      events:  ['click', 'dblclick', 'contextmenu', 'mousemove', 'mousedown', 'mouseup'],
     *      click: (e) => {},
     *      dblclick: (e) => {},
     *      contextmenu: (e) => {},
     * });
     * ui.create(UIICanvas, "main", {width: 300});
     * ui.create(UIIHint, "main", {width: 300});
     * ui.create(UIILabel, "main", {width: 300});
     * ui.create(UIIMonitor, "main", {width: 300});
     * ui.create(UIIText, "main", {width: 300});
     * ui.create(UIIText, "main", {width: 300});
     * ui.create(UIIMultitext, "main", {width: 300});
     * ui.create(UIIPhaser, "main", {width: 300});
     * ui.create(UIISwitcher, "main", {width: 300});
     * ui.create(UIIRange, "main", {width: 300});
     * ui.create(UIISign, "main", {width: 300});
     * ui.create(UIITextline, "main", {width: 300});
     * ```
     * @param ClassRef
     * @param key
     * @param props
     * @returns {UIIBlock|UIILabel|UIIButton|UIIMultitext|UIIPhaser|UIIOptioner}
     */
    create(ClassRef, key, props) {
        return new ClassRef(this, key, this.withProps(props));
    }

    /** @deprecated */
    createButton(key, props) {
        return  new UIIButton(this, key, this.withProps(props));
    }

    /** @deprecated */
    createCanvas(key, props) {
        return new UIICanvas(this, key, this.withProps(props));
    }

    /** @deprecated */
    createElement(key, props) {
        return new UIIElement(this, key, this.withProps(props));
    }

    /** @deprecated */
    createBlock(key, props) {
        return new UIIBlock(this, key, this.withProps(props));
    }

    /** @deprecated */
    createHint(key, props) {
        return new UIIHint(this, key, this.withProps(props));
    }

    /** @deprecated */
    createLabel(key, props) {
        return new UIILabel(this, key, this.withProps(props));
    }

    /** @deprecated */
    createMonitor(key, props) {
        return new UIIMonitor(this, key, this.withProps(props));
    }

    /** @deprecated */
    createMultitext(key, props) {
        return new UIIMultitext(this, key, this.withProps(props));
    }

    /** @deprecated */
    createPhaser(key, props) {
        return new UIIPhaser(this, key, this.withProps(props));
    }

    /** @deprecated */
    createRange(key, props) {
        return new UIIRange(this, key, this.withProps(props));
    }

    /** @deprecated */
    createSign(key, props) {
        return new UIISign(this, key, this.withProps(props));
    }

    /** @deprecated */
    createSwitcher(key, props) {
        return new UIISwitcher(this, key, this.withProps(props));
    }

    /** @deprecated */
    createText(key, props) {
        return new UIIText(this, key, this.withProps(props));
    }

    /** @deprecated */
    createTextline(key, props) {
        return new UIITextline(this, key, this.withProps(props));
    }

    afterConnected(callback) {
        if (document.body.contains(this.parent)) {
            callback()
        } else {
            const observer = new MutationObserver(() => {
                if (document.body.contains(this.parent)) {
                    observer.disconnect();
                    callback()
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    //
    //
    // Utilitarian
    grid(fieldSize = 6) {
        this.afterConnected(() => {
            (new UIIBackgroundGrid({element: this.parent})).grid(fieldSize);
        })
    }
}
