import {ReactiveTemplateYAML} from "../ReactiveTemplateYAML.js";
import {UIISign} from "./UIISign.js";


/**
 * ```
 * this.ui109 = new UIISign( uii, 'ui109', {
 *     x: 0,
 *     y: 0,
 *     width: 60,
 *     label: "tool for content creation",
 *     fixed: true,
 *     active: true,
 *     enabled: true,
 *     onclick: (eve, trg) => {console.log('onclick', eve, trg)},
 *     onswitch: (eve, trg) => {console.log('onclick', eve, trg)},
 * })
 *
 * switcher1.label("UII Switcher for content creation", {
 *     width: 160,
 *     fixed: true,
 *     y: 'none',
 *     x: 100
 * })
 * ```
 */
export class UIISwitcher extends UIISign {

    constructor(uii, key, props) {
        super(uii, key, {
            ...{width: 60}, ...props
        });

        this.type = 'switcher';
        this.props.cssClasses = ['UII', 'UIISwitcher'];
        this.props.cssClassActive = 'UIISwitcherTumblerOn';

        this.elements = {tumbler: null};
        this.element = super.create();

        if (props.hint) {
            this.hint(props.hint)
        }

        this.createContentElement();
        super._bindSwitcherEvents();
    }

    createContentElement() {
        const react
            = ReactiveTemplateYAML.renderStatic(
            'div.UIISwitcherTumbler[data-id=tumbler]');
        this.element.textContent = '';
        this.element.appendChild(react.template);
        this.elements = react.elements;
    }
}




