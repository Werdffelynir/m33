import {ReactiveTemplateYAML} from "../ReactiveTemplateYAML.js";
import {Ut} from "../Ut.js";
import {UIIButton} from "./UIIButton.js";
import {UIIBlock} from "./UIIBlock.js";
import {UIIElement} from "./UIIElement.js";

const UIISignView = `
div.UIISignTumbler[data-id=tumbler]
`;

/**
 * ```
 * this.ui109 = new UIISign( uii, 'ui109', {
 *     x: 0,
 *     y: 0,
 *     label: "tool for content creation",
 *     fixed: true,
 *     active: true,
 *     enabled: true,
 *     onclick: (eve, trg) => {console.log('onclick', eve, trg)},
 *     onswitch: (eve, trg) => {console.log('onclick', eve, trg)},
 * })
 * ```
 */
export class UIISign extends UIIElement {

    constructor(uii, key, props) {
        super(uii, key, props);

        this.type = 'sign';

        this.props.cssClasses = ['UII', 'UIISign'];
        this.props.cssClassActive = 'UIISignTumblerOn';
        this.props.iterator = 0;
        this.props.enabled = props?.enabled ?? true;
        this.props.active =  false;
        this.props.onswitch = props?.onswitch || props?.onclick || null;
        this.props.hint = props?.hint || null;


        this.eventsOnchange = new Set();
        this.elements = {tumbler: {}};
        this.element = super.create();

        this.createContentElement()

        this._bindSwitcherEvents();

        if (props?.enabled) {
            this.turnOn();
        }
    }

    createContentElement() {
        const react = ReactiveTemplateYAML.renderStatic(UIISignView);
        this.element.textContent = '';
        this.element.appendChild(react.template);
        this.elements = {...this.elements, ...react.elements};
    }

    _bindSwitcherEvents() {
        this._onswitch = (e) => {
            if (!this.props.enabled) return;

            if (this.props.onswitch)
                this.props.onswitch.call(this,  this.props.active, this.props.iterator)

            this.switch();

            this.props.iterator++;
        };

        this.element.addEventListener('click', this._onswitch);
    }

    get iterator() {
        return this.props.iterator
    }

    get active() {
        return this.props.active
    }

    get enabled() {
        return this.props.enabled
    }

    set enabled(value) {
        //

        this.props.enabled = value
    }

    destroy() {
        super.destroy();
        this.element.removeEventListener('click', this._onswitch);
    }

    onChange(callback) {
        this.eventsOnchange.add(callback)
    }

    switch(activity) {
        if (activity === undefined) {
            if (this.props.active) this.turnOff();
            else this.turnOn();
            return;
        }
        activity = !!activity;

        this.props.active = activity;

        this.eventsOnchange.forEach(callback =>
            callback.call(this, this.props.active, this.props.iterator));

        return activity;
    }

    turnOn() {
        this.switch(true)
        this.elements.tumbler.classList.add(this.props.cssClassActive);
    }

    turnOff() {
        this.switch(false)
        this.elements.tumbler.classList.remove(this.props.cssClassActive);
    }
}




