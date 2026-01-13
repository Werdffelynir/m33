import {UIIText} from "./UIIText.js";
import {Doom} from "../utils/Doom.js";
import {Ut} from "../Ut.js";


/**
 * ```
 * const mon = new UIIMonitor(this.uii, 'monitor', {
 *      element: NodeElement,
 *      parent: NodeElement,
 *      width: 960,
 *      height: 600,
 *      fixed: false,
 * })
 * mon.alignment({
 *     justify: {end: true},
 *     align: {start: true},
 *     text: {start: true}
 * });
 * ```
 */
export class UIIMonitor extends UIIText {
    constructor(uii, key, props) {
        super(uii, key, {...{width: 'unset', height: 'unset'}, ...props});

        this.type = 'monitor';
        this.props.cssClasses = ['UII', 'UIIMonitor'];

        this.element = props?.element && props.element.nodeType === Node.ELEMENT_NODE ? props.element : this.element;
        this.elementRect = Doom.create('div', {class: 'UIIMonitorRect'});
        this.element.appendChild(this.elementRect);
        this.children = new Set()
    }

    cursorAnimation(params = {}) {
        if (params === false) {
            this._cursorAnimationTimer.stop();
            return;
        }
        const def = {start: false, end: false, symbol: `|`, delay: 2000};
        params = Ut.isObject(params)
            ? {...def, ...this.cursorAnimation}
            : def;

        if (!this._cursorAnimationTimer) this._cursorAnimationTimer = Ut.timer((a, b, c) => {

        }, params.delay);

        this._cursorAnimationTimer.start();
    }
    _cursorAnimationTimer = null;
    _cursorAnimation() { }

    clean() {
        // super.clean();
        this.elementRect.textContent = ''
    }

    append(data) {
        if (Ut.isString(data))
            data = Doom.create('div', {style: {width: '100%'}}, data);

        this.children.add(data)
        this.elementRect.appendChild(data);
    }

    /**
     * text block alignment
     * possibly keys: justify align text
     * possibly values: end center start
     *
     * ```
     * this.alignment({
     *     justify: {end: true, center: true, start: true,},
     *     align: {end: true, center: true, start: true,},
     *     text: {end: true, center: true, start: true,}
     * });
     * this.alignment({
     *     justify: {end: true},
     *     align: {center: true},
     *     text: {start: true}
     * });
     * ```
     */
    alignment(options = {}) {
        const maps = {
            justify: {
                start: 'flex-start',
                center: 'center',
                end: 'flex-end',
                around: 'space-around',
                between: 'space-between',
            },
            align: {
                start: 'flex-start',
                center: 'center',
                end: 'flex-end',
                stretch: 'stretch',
                around: 'space-around',
                between: 'space-between',
            },
            text: {
                start: 'left',
                center: 'center',
                end: 'right',
                unset: 'unset',
            }
        };
        const defaults = {
            justify: 'flex-start',
            align: 'stretch',
            text: 'left'
        };
        const pickValue = (key) => {
            const opts = options[key] || {};
            for (const variant in maps[key]) {
                if (opts[variant]) {
                    return maps[key][variant];
                }
            }
            return defaults[key];
        };
        const css = {
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: pickValue('justify'),
            alignContent: pickValue('align'),
            textAlign: options.text ? pickValue('text') : maps.text.unset,
        };

        Doom.css(this.elementRect, css)
    }
}
