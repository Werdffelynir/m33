import {ReactiveTemplateYAML} from "../ReactiveTemplateYAML.js";
import {Ut} from "../Ut.js";
import {Doom} from "../utils/Doom.js";
import {UIIButton} from "./UIIButton.js";

export const UIIPhaserStyle = {
    lines: 'UIIPhaserStyleLines',
    rows: 'UIIPhaserStyleRows',
    tiles: 'UIIPhaserStyleTiles',
    range: 'UIIPhaserStyleRange',
    // UIIPhaserStyleTiles
    // UIIPhaserStyleLines default
    // UIIPhaserStyleRows
    // line: 'shellLine',
    // rows: 'shellRows',
    // tiles: 'shellTiles',
};

/**
 * ```
 * uii.create(UIIPhaser, toname('sw_range2'), {
 *    parent: base.element,
 *    x: 220,
 *    y: 440,
 *    width: 80,
 *    height: 90,
 *    phases: Array.from({ length: 12 }).fill(' '),
 *    cssClasses: ['fontSize80'],
 *    phaserStyle: {
 *        type: UIIPhaserStyle.range,
 *        vertical: true,
 *    },
 * })
 *
 * uii.create(UIIPhaser, toname('sw_range'), {
 *    parent: base.element,
 *    x: 10,
 *    y: 520,
 *    width: 180,
 *    height: 10,
 *    style: {border:'none'},
 *    phases: Array.from({ length: 12 }).fill(''),
 *    cssClasses: ['fontSize80'],
 *    phaserStyle: UIIPhaserStyle.range,
 * })
 *
 * ```
 */

/**
 * beans length
 * phases
 * {beans: 6, phases: ['left', 'right']}
 * ```
 *this.ui105 = new UIIPhaser( uii, 'ui105', {
 *     x: 100,
 *     y: 100,
 *     width: 220,
 *     height: 'none',
 *     fixed: true,
 *     cssClasses: ['fontSize80'],
 *     style: {border:'none', height: '70px'},
 *     // content: 'UIITextline a tool for content creation',
 *     // beans: 6,
 *     phases: ['Thrusters','Brake', 'Thrusters', 'Left', 'Right', 'FullStop'],
 *
 *     onchange: (phase, content) => {
 *         console.log('>>>>', phase, content)
 *     },
 *     phaserStyle: UIIPhaserStyle.lines,
 *     phaserStyle: UIIPhaserStyle.rows,
 *     phaserStyle: UIIPhaserStyle.tiles,
 *     phaserStyle: UIIPhaserStyle.range,
 *
 *     phaserStyle: {
 *        type: UIIPhaserStyle.tiles,
 *        columns: 3,
 *     },
 *     phaserStyle: {
 *        type: UIIPhaserStyle.range,
 *        vertical: true,
 *     },
 *
 *
 *
 *    multiphase: true,
 *    onchange: (phase, active, content, indexes) => {
 *        console.log('>>>>', phase, active, content, indexes)
 *    },
 * })
 * ```
 */
export class UIIPhaser extends UIIButton {

    constructor(uii, key, props) {
        super(uii, key, props);

        this.type = 'phaser';
        this.props.cssClasses = [...['UII', 'UIIPhaser'], ...props?.cssClasses || []];
        this.props.phases = props?.phases || [...Array(props?.beans || props?.length || 10).keys()];
        this.props.currentIndex = 0;
        this.props.active = false; // todo
        this.props.enabled = props?.enabled ?? true;
        this.props.multiphase = props?.multiphase ?? false;

        this.props.width = props?.width ?? '100%';
        this.props.height = props?.height ?? '100%';

        this.props.phaserStyle = props?.phaserStyle ?? UIIPhaserStyle.lines; // todo

        if ((Ut.isString(this.props.phaserStyle) && this.props.phaserStyle !== UIIPhaserStyle.range) ||
            (Ut.isObject(this.props.phaserStyle) && this.props.phaserStyle.type !== UIIPhaserStyle.range))
            this.props.height = 'none';

        this.elements = {phase: [], shell: {}};
        this.element = super.create();
        this.eventsOnchange = new Set();

        if (typeof props?.onchange === 'function')
            this.onchange(props.onchange)

        this.createContentElement();
        this.phaserStyle(this.props.phaserStyle)
        this._bindPhaserEvents();
    }

    get enabled() {
        return this.props.enabled
    }

    set enabled(value) {
        this.props.enabled = value
    }

    /**
     * ```
     * phaserStyle( UIIPhaserStyle.lines ) // UIIPhaserStyle.lines UIIPhaserStyle.rows UIIPhaserStyle.tiles
     * phaserStyle({
     *     type: UIIPhaserStyle.lines,
     *     width: 'none',
     *     height: 'none',
     *     cssClasses: [],
     *     shell: {padding: '2px'},
     *     bean: {},
     * })
     * phaserStyle({
     *     type: UIIPhaserStyle.rows,
     *     width: 'none',
     *     height: 'none',
     *     shell: {padding: '2px'},
     *     bean: {height: '12px'},
     * })
     * phaserStyle({
     *     type: UIIPhaserStyle.tiles,
     *     width: 'none',
     *     height: 'none',
     *     columns: 2,
     *     shell: {},
     *     bean: {color:'var(--cr2)'},
     * })
     * phaserStyle( {
     *     type: UIIPhaserStyle.range,
     *     vertical: true,
     * })
     * ```
     * @param CSSClassString
     */
    phaserStyle(CSSClassString) {

        if (typeof CSSClassString === 'string') {

            if (Object.values(UIIPhaserStyle).includes(CSSClassString)) {
               // this.elements['shell'].classList.add(CSSClassString)
                return this.phaserStyle({type: CSSClassString})
            } else {
                console.warn(`CSS class "${CSSClassString}" not allow. Use: UIIPhaserStyle`)
            }
        }

        if (Ut.isObject(CSSClassString)) {
            const phaStyleObj = {...{
                    type: UIIPhaserStyle.tiles,
                    width: 'none',
                    height: 'none',
                    columns: 2,
                    vertical: false,
                    cssClasses: [],
                    shell: {},
                    bean: {},
                }, ...CSSClassString};
            if (Ut.isNumber(phaStyleObj.width)) phaStyleObj.width = phaStyleObj.width + 'px'
            if (Ut.isNumber(phaStyleObj.height)) phaStyleObj.height = phaStyleObj.height + 'px'

            const styleShell = phaStyleObj.shell;
            const styleBean = {...phaStyleObj.bean, ...{
                    width: phaStyleObj.width,
                    height: phaStyleObj.height,
                }}

            switch (phaStyleObj.type) {
                case UIIPhaserStyle.rows:
                    this.elements['shell'].classList.add(UIIPhaserStyle.rows)
                    this.props.height = 'none'
                    this.element.style.height = 'none'
                    break;
                case UIIPhaserStyle.lines:
                    this.elements['shell'].classList.add(UIIPhaserStyle.lines)
                    this.props.height = 'none'
                    this.element.style.height = 'none'
                    break;
                case UIIPhaserStyle.tiles:
                    this.elements['shell'].classList.add(UIIPhaserStyle.tiles)
                    styleBean.width = `${Math.floor(100/phaStyleObj.columns)}%`
                    this.props.height = 'none'
                    this.element.style.height = 'none'
                    break;
                case UIIPhaserStyle.range:
                    if (phaStyleObj.vertical) {
                        this.elements['shell'].classList.add(UIIPhaserStyle.range+'Vertical')
                    } else {
                        this.elements['shell'].classList.add(UIIPhaserStyle.range)
                    }
                    break;
            }

            phaStyleObj.cssClasses.forEach(className=>{this.elements['shell'].classList.add(className)})
            this.elements.phase.forEach(elBean=>{Doom.css(elBean, styleBean)})
            Doom.css(this.elements['shell'], styleShell);


            // shell root
            // Doom.css(  this.elements['shell'], CSSClassString)
        }

    }

    createContentElement() {
        const react = ReactiveTemplateYAML.renderStatic('div.UIIPhaserShell[data-id=shell]');
        this.element.textContent = '';
        this.element.appendChild(react.template);
        this.elements = {...this.elements, ...react.elements};

        this.phases = this.props.phases;

        if (this.props?.phase > -1) // todo
            this.phase = this.props.phase;
    }

    _bindPhaserEvents() {
        super.on('click', (event) => {
            if (!this.enabled) return;
            const target = event.target.closest('[data-index]');
            // console.log('target', target);

            if (target) {
                this.phase = parseInt(target.dataset.index);
            }
        })

    }

    get phases() {
        return this.props.phases
    }

    set phases(phases) {
        if (!Ut.isArray(phases) || !phases.length) {
            console.warn(`{UIIPhaser.setPhases(phases)} phases not Array type`)
            return;
        }

        // this.props.phase = 0; todo
        this.props.phases = phases;
        this.props.currentIndex = -1;
        this.elements.phase = [];
        this.elements.shell.replaceChildren();
        this.elements.shell.textContent = '';

        // create phase elem
        this.props.phases.forEach((value, i) => {
            const slice = Doom.create('div', {
                'class': 'UIIPhaserBean',
                'data-index': i,
            }, Ut.isNumber(value) ? value+'' : value );
            this.elements.phase.push(slice);
            this.elements.shell.append(slice);
        });
    }
    /**@deprecated */
    onChange(callback) {
        this.onchange(callback)
    }

    onchange(callback) {
        this.eventsOnchange.add(callback)
    }

    get phase() {
        return this.props.currentIndex
    }

    reset() {
        if (this.props.currentIndex > -1) {
            this.elements.phase[this.props.currentIndex].classList.remove('UIIPhaserBeanOn');
        }
        this.props.currentIndex = -1;
    }

    multiphaseCache = {
        indexes: new Set(),
    }
    set phase(value) {
        value = parseInt(value);

        if (this.props.multiphase) {

            if (this.multiphaseCache.indexes.has(value)) {
                this.multiphaseCache.indexes.delete(value)
            } else {
                this.multiphaseCache.indexes.add(value)
            }

            this.eventsOnchange.forEach((callback) => {
                const active = this.multiphaseCache.indexes.has(value) // current active index
                callback.call(this,
                    value,
                    active,
                    this.elements.phase[value].textContent,
                    [...this.multiphaseCache.indexes],
                );
                if(active) {
                    this.elements.phase[value].classList.add('UIIPhaserBeanOn');
                } else {
                    this.elements.phase[value].classList.remove('UIIPhaserBeanOn');
                }
            });

            return;
        }

        this.phaseShifterHandler(value)
    }

    phaseShifterHandler(value){
        if (this.props.currentIndex === value) {
            console.warn('Repeat click on index ' + value)
            return;
        }

        if (value < 0 || value > this.props.phases.length - 1) {
            console.warn(`Phase number index "${value}" exceeded limit - number of phases`)
            return
        }

        const phaseElem = this.elements.phase;

        if (this.props.currentIndex > -1) {
            phaseElem[this.props.currentIndex].classList.remove('UIIPhaserBeanOn');
        }
        this.props.currentIndex = value;

        phaseElem[value].classList.add('UIIPhaserBeanOn');

        if (this.eventsOnchange.size) {
            this.eventsOnchange.forEach((callback) => {
                callback.call(this, value, phaseElem[value].textContent);
            });
        }
    }

    prev() {
        this.phase = this.props.currentIndex - 1
    }

    next() {
        this.phase = this.props.currentIndex + 1
    }
}

/*
export class UIIPhaser22 extends UIIButton {

    constructor(uii, key, props) {
        super(uii, key, props);

        this.type = 'phaser';
        this.props.cssClasses = ['UII', 'UIIPhaser'];
        const length = props?.beans || props?.length || 10;
        this.props.phases = props?.phases || [...Array(length).keys()];
        this.props.currentIndex = 0;
        this.props.active = false; // todo
        this.props.enabled = props?.enabled ?? true;

        this.props.phaserStyle = props?.phaserStyle ?? UIIPhaserStyle.lines; // todo

        if ((Ut.isString(this.props.phaserStyle) && this.props.phaserStyle !== UIIPhaserStyle.range) ||
            (Ut.isObject(this.props.phaserStyle) && this.props.phaserStyle.type !== UIIPhaserStyle.range))
            this.props.height = 'none';

        this.elements = {slices: [], shell: {}};
        this.element = super.create();
        this.eventsOnchange = new Set();


        if (typeof props?.onchange === 'function')
            this.onchange(props.onchange)

        // if (props?.onChange && typeof props.onChange === 'function') {
        //     this.eventsOnchange.add(props.onChange)
        // }
        this.createContentElement();
        this.phaserStyle(this.props.phaserStyle)
        this._bindPhaserEvents();
    }

    get enabled() {
        return this.props.enabled
    }

    set enabled(value) {
        this.props.enabled = value
    }
    phaserStyle(CSSClassString) {

        if (typeof CSSClassString === 'string') {

            if (Object.values(UIIPhaserStyle).includes(CSSClassString)) {
               // this.elements['shell'].classList.add(CSSClassString)
                return this.phaserStyle({type: CSSClassString})
            } else {
                console.warn(`CSS class "${CSSClassString}" not allow. Use: UIIPhaserStyle`)
            }
        }

        if (Ut.isObject(CSSClassString)) {
            const phaStyleObj = {...{
                    type: UIIPhaserStyle.tiles,
                    width: 'none',
                    height: 'none',
                    columns: 2,
                    vertical: false,
                    cssClasses: [],
                    shell: {},
                    bean: {},
                }, ...CSSClassString};
            if (Ut.isNumber(phaStyleObj.width)) phaStyleObj.width = phaStyleObj.width + 'px'
            if (Ut.isNumber(phaStyleObj.height)) phaStyleObj.height = phaStyleObj.height + 'px'

            const styleShell = phaStyleObj.shell;
            const styleBean = {...phaStyleObj.bean, ...{
                    width: phaStyleObj.width,
                    height: phaStyleObj.height,
                }}

            switch (phaStyleObj.type) {
                case UIIPhaserStyle.rows:
                    this.elements['shell'].classList.add(UIIPhaserStyle.rows)
                    this.props.height = 'none'
                    this.element.style.height = 'none'
                    break;
                case UIIPhaserStyle.lines:
                    this.elements['shell'].classList.add(UIIPhaserStyle.lines)
                    this.props.height = 'none'
                    this.element.style.height = 'none'
                    break;
                case UIIPhaserStyle.tiles:
                    this.elements['shell'].classList.add(UIIPhaserStyle.tiles)
                    styleBean.width = `${Math.floor(100/phaStyleObj.columns)}%`
                    this.props.height = 'none'
                    this.element.style.height = 'none'
                    break;
                case UIIPhaserStyle.range:
                    if (phaStyleObj.vertical) {
                        this.elements['shell'].classList.add(UIIPhaserStyle.range+'Vertical')
                    } else {
                        this.elements['shell'].classList.add(UIIPhaserStyle.range)
                    }
                    break;
            }

            phaStyleObj.cssClasses.forEach(className=>{this.elements['shell'].classList.add(className)})
            this.elements.slices.forEach(elBean=>{Doom.css(elBean, styleBean)})
            Doom.css(this.elements['shell'], styleShell);


            // shell root
            // Doom.css(  this.elements['shell'], CSSClassString)
        }

    }
    createContentElement() {
        const react = ReactiveTemplateYAML.renderStatic('div.UIIPhaserShell[data-id=shell]');
        this.element.textContent = '';
        this.element.appendChild(react.template);
        this.elements = {...this.elements, ...react.elements};

        this.phases = this.props.phases;

        if (this.props?.phase > -1) // todo
            this.phase = this.props.phase;
    }

    _bindPhaserEvents() {
        super.on('click', (event) => {
            if (!this.enabled) return;
            const target = event.target.closest('[data-index]');
            // console.log('target', target);

            if (target) {
                this.phase = parseInt(target.dataset.index);
            }
        })

    }

    get phases() {
        return this.props.phases
    }

    set phases(phases) {
        if (!Ut.isArray(phases) || !phases.length) {
            console.warn(`{UIIPhaser.setPhases(phases)} phases not Array type`)
            return;
        }

        // this.props.phase = 0; todo
        this.props.phases = phases;
        this.props.currentIndex = -1;
        this.elements.slices = [];
        this.elements.shell.replaceChildren();
        this.elements.shell.textContent = '';

        // create slices
        this.props.phases.forEach((value, i) => {

            const slice = Doom.create('div', {
                'class': 'UIIPhaserBean',
                'data-index': i,
            }, Ut.isNumber(value) ? value+'' : value );

            this.elements.slices.push(slice);
            this.elements.shell.append(slice);
        });
    }

    onChange(callback) {
        this.onchange(callback)
    }

    onchange(callback) {
        this.eventsOnchange.add(callback)
    }

    get phase() {
        return this.props.currentIndex
    }

    reset() {
        if (this.props.currentIndex > -1) {
            this.elements.slices[this.props.currentIndex].classList.remove('UIIPhaserBeanOn');
        }
        this.props.currentIndex = -1;
    }

    set phase(value) {
        value = parseInt(value);

        if (this.props.currentIndex === value) {
            console.warn('Repeat click on index ' + value)
            return;
        }

        if (value < 0 || value > this.props.phases.length - 1) {
            console.warn(`Phase number index "${value}" exceeded limit - number of phases`)
            return
        }

        const slices = this.elements.slices;

        if (this.props.currentIndex > -1) {
            slices[this.props.currentIndex].classList.remove('UIIPhaserBeanOn');
        }
        this.props.currentIndex = value;

        slices[value].classList.add('UIIPhaserBeanOn');

        if (this.eventsOnchange.size) {
            this.eventsOnchange.forEach((callback) => {
                callback.call(this, value, slices[value].textContent);
            });
        }
    }

    prev() {
        this.phase = this.props.currentIndex - 1
    }

    next() {
        this.phase = this.props.currentIndex + 1
    }
}




 * ```
 * phaserStyle( UIIPhaserStyle.lines ) // UIIPhaserStyle.lines UIIPhaserStyle.rows UIIPhaserStyle.tiles
 * phaserStyle({
 *     type: UIIPhaserStyle.lines,
 *     width: 'none',
 *     height: 'none',
 *     cssClasses: [],
 *     shell: {padding: '2px'},
 *     bean: {},
 * })
 * phaserStyle({
 *     type: UIIPhaserStyle.rows,
 *     width: 'none',
 *     height: 'none',
 *     shell: {padding: '2px'},
 *     bean: {height: '12px'},
 * })
 * phaserStyle({
 *     type: UIIPhaserStyle.tiles,
 *     width: 'none',
 *     height: 'none',
 *     columns: 2,
 *     shell: {},
 *     bean: {color:'var(--cr2)'},
 * })
 * phaserStyle( {
 *     type: UIIPhaserStyle.range,
 *     vertical: true,
 * })
 * ```
 * @param CSSClassString
 */
/*        this._onclick = (event) => {
            this.eventsClicks.forEach(callback => {
                const target = event.target.closest('[data-index]');

                if (target) {
                    callback.call(event, target.dataset.index, target.textContent);
                    this.phase = parseInt(target.dataset.index);
                }
            })
        };*/




