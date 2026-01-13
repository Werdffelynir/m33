import {Metric} from "../utils/Metric.js";
import {ReactiveTemplateYAML} from "../ReactiveTemplateYAML.js";
import {UIIButton} from "./UIIButton.js";
import {Ut} from "../Ut.js";


const UIIRangeView = `
div.UIIChartShell[data-id=shell]:
  div.UIIChartDetail[data-id=details]
    div: "{{detailTitle}}"
    div: "{{detailPercent}}"
  div.UIIChartLine[data-id=line]: {{detailDesc}}
    div.UIIChartLineHaft[data-id=half]
`;

/**
 * ```
 * chart = this.uii.create(UIIChart, 'Chart2', {
 *      width: 300,
 *      height: 40,
 *      vertical: false,
 *      haft: true,
 *      percent: 70,
 *      title: 'Chart 2',
 *      onchange:(percent) => {
 *          console.log('Chart2 ',percent)
 *      },
 *  })
 *
 *  chart.onchange( (percent) => {} )
 *  chart.enabled = true|false      - setter, getter
 *  chart.range = number            - setter, getter change percent value, high of line
 *  chart.percent = number|string   - setter, getter
 *  chart.title = string            - setter, getter
 *  chart.haftOn()
 *  chart.haftOff()
 *  chart.haftOff()
 *
 *  Doom.css(ch6range.elements['detail'], {      // change part element position
 *     position: 'absolute',
 *     left: '20px',
 *     top: '-20px',
 * })
 * ```
 */
export class UIIChart extends UIIButton {

    static rangeValue = (value, outMin, outMax, inMin = 0, inMax = 100) => {
        return  Ut.rangeValue(value, outMin, outMax, inMin, inMax);
    }

    constructor(uii, key, props) {
        super(uii, key, props);

        this.type = 'chart';
        this.props.cssClasses = ['UII', 'UIIChart'];
        if (props?.cssClasses && Array.isArray(props.cssClasses))
            this.props.cssClasses = [...this.props.cssClasses, ...props.cssClasses]

        this.props.vertical = props?.vertical || false;
        this.props.haft = props?.haft || false; // todo
        this.props.percent = props?.percent || 0; // todo
        this.props.enabled = props?.enabled ?? true;
        this.props.hideDetails = props?.hideDetails ?? true;

        this.eventsOnchange = new Set();
        //
        // this.reactive.state.detailDesc
        //
        this.originState = {
            detailTitle: this.props?.title ?? '',
            detailPercent: this.props.percent,
            detailDesc: this.props.desc,
        };

        this.elements = {shell: {}, line: {}, half: {}, details: {}};
        this.element = super.create();
        this.createContentElement();

        if (this.props.hideDetails) this.elements['details'].classList.add('hide');
        else this.elements['details'].classList.remove('hide');

        if (this.props.vertical) {
            this.element.classList.add('UIIChartVertical');
        }

        this._bindRangeEvents();
        this.percent = this.props.percent;

        this.eventsOnchange.add((v) => {
            if (this.reactive.state.detailPercent !== v) this.reactive.state.detailPercent = v;
        })

        if (typeof props?.onchange === 'function')
            this.onchange(props.onchange)

        if (this.props.haft) this.haftOn();
        else this.haftOff()

        // detail
        // if (props?.detail) this.detail = props.detail;
        if (props?.percentText) this.percentText = ''+props.percentText;

    }

    get enabled() {
        return this.props.enabled
    }

    set enabled(value) {
        this.props.enabled = value
    }

    // /** @deprecated use setter|getter rangeText */
    // set detail(value) {this.reactive.state.detailPercent = value}

    set percentText(value) {this.reactive.state.detailPercent = value}
    get percentText() {return this.reactive.state.detailPercent}
    set title(value) {this.reactive.state.detailTitle = value}
    get title() {return this.reactive.state.detailTitle}
    set desc(value) {this.reactive.state.detailDesc = value}
    get desc() {return this.reactive.state.detailDesc}

    createContentElement() {
        this.reactive
            = ReactiveTemplateYAML.renderStatic(UIIRangeView, this.originState);
        this.element.textContent = '';
        this.element.appendChild(this.reactive.template);
        this.elements = this.reactive.elements;
    }

    get percent() {
        return this.props.percent
    }

    set percent(value) {
        if (!this.enabled) return;
        if (value>100||value<0) value = Ut.clamp(value, 0, 100);

        if (this.props.vertical)
            this.elements.line.style.height = value + '%';
        else
            this.elements.line.style.width = value + '%';

        this.props.percent = value;

        this.eventsOnchange.forEach((callback) => {
            callback.call(this, value);
        });
    }

    _bindRangeEvents() {
        const getPercent = (e) => {
            const elem = this.elements.shell;

            if (this.props.vertical) {
                let y = positionMouse(e, elem).y;
                let h = parseInt(getComputedStyle(elem).height);
                return Math.round( Metric.percentageFrom(h-y, h) );
            } else {
                let x = positionMouse(e, elem).x;
                let w = parseInt(getComputedStyle(elem).width);
                return Math.round(Metric.percentageFrom(x, w));
            }
        };
        this._click = (e) => {
            if (!this.props.haft) return;

            this.percent = getPercent(e);
            this.element.removeEventListener('click', this._click);
        };
        this._mousemove = (e) => {
            if (!this.props.haft) return;
            if (!this.props.haftActive) return;

            this.percent = getPercent(e);
        };
        this._mouseup = (e) => {
            if (!this.props.haft) return;
            if (!this.enabled) return;

            this.props.haftActive = false;

            document.removeEventListener('mouseup', this._mouseup);
            document.removeEventListener('mousemove', this._mousemove);
        };
        this._mousedown = (e) => {
            if (!this.props.haft) return;
            if (!this.enabled) return;

            this.props.haftActive = true;

            this.element.addEventListener('click', this._click);
            document.addEventListener('mouseup', this._mouseup);
            document.addEventListener('mousemove', this._mousemove);
        };
        this.element.addEventListener('mousedown', this._mousedown);
    }

    haftOn() {
        if (!this.enabled) return;
        this.element.classList.add('UIIChartHaftOn');
        this.elements['half'].classList.remove('hide');
        this.props.haft = true;
    }

    haftOff() {
        if (!this.enabled) return;
        this.element.classList.remove('UIIChartHaftOn');
        this.elements['half'].classList.add('hide');
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

}


/*

export class UIIChart2 extends UIIButton {

    static rangeValue = (value, outMin, outMax, inMin = 0, inMax = 100) => {
        return  Ut.rangeValue(value, outMin, outMax, inMin, inMax);
    }

    constructor(uii, key, props) {
        super(uii, key, props);

        this.type = 'chart';
        this.props.cssClasses = ['UII', 'UIIChart'];
        if (props?.cssClasses && Array.isArray(props.cssClasses))
            this.props.cssClasses = [...this.props.cssClasses, ...props.cssClasses]

        this.props.vertical = props?.vertical || false;
        this.props.haft = props?.haft || false; // todo
        this.props.percent = props?.percent || 0; // todo
        this.props.enabled = props?.enabled ?? true;

        this.eventsOnchange = new Set();
        //
        // this.reactive.state.detailDesc
        //
        this.originState = {
            detailTitle: props?.title ?? '',
            detailPercent: this.props.percent,
            detailDesc: this.props.desc,
        };

        this.elements = {shell: {}, line: {}, half: {}};
        this.element = super.create();
        this.createContentElement();

        if (this.props.vertical) {
            this.element.classList.add('UIIChartVertical');
        }

        this._bindRangeEvents();
        this.range = this.props.percent;

        this.eventsOnchange.add((v) => {
            if (this.reactive.state.detailPercent !== v) this.reactive.state.detailPercent = v;
        })

        if (typeof props?.onchange === 'function')
            this.onchange(props.onchange)

        if (this.props.haft) this.haftOn();
        else this.haftOff()

        // detail
        if (props?.detail) this.detail = props.detail;
        if (props?.rangeText) this.rangeText = props.rangeText;

    }

    get enabled() {
        return this.props.enabled
    }

    set enabled(value) {
        this.props.enabled = value
    }

    set detail(value) {this.reactive.state.detailPercent = value}

    set rangeText(value) {this.reactive.state.detailPercent = value}
    get rangeText() {return this.reactive.state.detailPercent}
    set title(value) {this.reactive.state.detailTitle = value}
    get title() {return this.reactive.state.detailTitle}
    set desc(value) {this.reactive.state.detailDesc = value}
    get desc() {return this.reactive.state.detailDesc}

    createContentElement() {
        this.reactive
            = ReactiveTemplateYAML.renderStatic(UIIRangeView, this.originState);
        this.element.textContent = '';
        this.element.appendChild(this.reactive.template);
        this.elements = this.reactive.elements;
    }

    get range() {
        return this.props.percent
    }

    set range(value) {
        if (!this.enabled) return;
        if (value>100||value<0) value = Ut.clamp(value, 0, 100);

        if (this.props.vertical)
            this.elements.line.style.height = value + '%';
        else
            this.elements.line.style.width = value + '%';

        this.props.percent = value;

        this.eventsOnchange.forEach((callback) => {
            callback.call(this, value);
        });
    }

    _bindRangeEvents() {
        const getPercent = (e) => {
            const elem = this.elements.shell;

            if (this.props.vertical) {
                let y = positionMouse(e, elem).y;
                let h = parseInt(getComputedStyle(elem).height);
                return Math.round( Metric.percentageFrom(h-y, h) );
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
            if (!this.enabled) return;

            this.props.haftActive = false;

            document.removeEventListener('mouseup', this._mouseup);
            document.removeEventListener('mousemove', this._mousemove);
        };
        this._mousedown = (e) => {
            if (!this.props.haft) return;
            if (!this.enabled) return;

            this.props.haftActive = true;

            this.element.addEventListener('click', this._click);
            document.addEventListener('mouseup', this._mouseup);
            document.addEventListener('mousemove', this._mousemove);
        };
        this.element.addEventListener('mousedown', this._mousedown);
    }

    haftOn() {
        if (!this.enabled) return;
        this.element.classList.add('UIIChartHaftOn');
        this.elements['half'].classList.remove('hide');
        this.props.haft = true;
    }

    haftOff() {
        if (!this.enabled) return;
        this.element.classList.remove('UIIChartHaftOn');
        this.elements['half'].classList.add('hide');
        this.props.haft = false;
    }

    destroy() {
        super.destroy();
        this.element.removeEventListener('mousedown', this._mousedown);
    }

    onChange(callback) {
        this.onchange(callback)
    }

    onchange(callback) {
        this.eventsOnchange.add(callback)
    }

}


*/
