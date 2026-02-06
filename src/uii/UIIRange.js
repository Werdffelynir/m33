import {Metric} from "../utils/Metric.js";
import {ReactiveTemplateYAML} from "../ReactiveTemplateYAML.js";
import {UIIButton} from "./UIIButton.js";
import {Ut} from "../Ut.js";


const UIIRangeView = `
div.UIIRangeShell[data-id=shell]:
  div.UIIRangeLine[data-id=line]:
    div.UIIRangeLineHaft[data-id=half]:
`;

export class UIIRange extends UIIButton {

    /**
     * ```
     * UIIRange = new UIIRange ( uii, 'keyName', {
     *      x: 0,
     *      y: 0,
     *      z: 0,
     *      width: 30,
     *      height: 30,
     *      vertical: false,
     *      haft: false,
     *      percent: 0,
     *
     * })
     * ```
     */
    constructor(uii, key, props) {
        super(uii, key, props);

        this.type = 'range';
        this.props.cssClasses = ['UII', 'UIIRange'];
        this.props.vertical = props?.vertical || false;
        this.props.haft = props?.haft || false; // todo
        this.props.percent = props?.percent || 0; // todo
        this.eventsOnchange = new Set();
        this.elements = {shell: {}, line: {}, half: {}};
        this.element = super.create();

        this.createContentElement();

        this._bindRangeEvents();

        if (this.props.percent)
            this.range = this.props.percent

        if (this.props.haft)
            this.withHaft();

        if (this.props.vertical)
            this.element.classList.add('UIIRangeVertical')

        if (typeof props?.onchange === 'function')
            this.onchange(props.onchange)
    }

    _bindRangeEvents() {
        const getPercent = (e) => {
            const elem = this.elements.shell;

            if (this.props.vertical) {
                let y = positionMouse(e, elem).y;
                let w = parseInt(getComputedStyle(elem).width);
                return Math.abs(Math.round(Metric.percentageFrom(y, w)) - 100);
            } else {
                let x = positionMouse(e, elem).x;
                let w = parseInt(getComputedStyle(elem).width);
                return Math.round(Metric.percentageFrom(x, w));
            }
        };
        this._click = (e) => {
            if (!this.props.haft) return;

            this.range = getPercent(e);
            this.element.removeEventListener('click', this._click);
        };
        this._mousemove = (e) => {
            if (!this.props.haft) return;
            if (!this.props.haftActive) return;

            this.range = getPercent(e);
        };
        this._mouseup = (e) => {
            if (!this.props.haft) return;

            this.props.haftActive = false;

            document.removeEventListener('mouseup', this._mouseup);
            document.removeEventListener('mousemove', this._mousemove);
        };
        this._mousedown = (e) => {
            if (!this.props.haft) return;

            this.props.haftActive = true;

            this.element.addEventListener('click', this._click);
            document.addEventListener('mouseup', this._mouseup);
            document.addEventListener('mousemove', this._mousemove);
        };
        this.element.addEventListener('mousedown', this._mousedown);
    }

    createContentElement() {
        const react
            = ReactiveTemplateYAML.renderStatic(UIIRangeView);
        this.element.textContent = '';
        this.element.appendChild(react.template);
        this.elements = react.elements;
    }

    withHaft() {
        this.element.classList.add('UIIRangeHaftShow')
        this.props.haft = true;
    }

    withoutHaft() {
        this.element.classList.remove('UIIRangeHaftShow')
        this.props.haft = false;
    }

    destroy() {
        super.destroy();
        this.element.removeEventListener('mousedown', this._mousedown);
    }
    /**@deprecated */
    onChange(callback) {
        this.onchange(callback)
    }

    onchange(callback) {
        this.eventsOnchange.add(callback)
    }

    get range() {
        return this.props.percent
    }

    set range(value) {
        value = Ut.clamp(value, 0, 100);

        this.elements.line.style.width = value + '%';
        this.props.percent = value;

        this.eventsOnchange.forEach((callback) => {
            callback.call(this, value);
        });
    }
}





