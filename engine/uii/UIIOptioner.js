import {Doom} from "../utils/Doom.js";
import {UIIButton} from "./UIIButton.js";


const CSS = `
`;
const HTML = `
div
  div.header[data-id=header]
    div.arrow.triangleRight[data-id=arrow]
    div.title[data-id=titleLabel]: "{{title}}"
  div.hide.options[data-id=options]
`;

/**
 * ```
 *
 * const optioner1 = this.uii.create(UIIOptioner, 'optioner1', {
 *     x: 700,
 *     y: 20,
 *     width: 260,
 *     fixed: true,
 *     title: 'My Special Title',
 *     titleUpdatable: true,
 *     closeAuto: false,
 *     enabled: false,
 *     opened: true,
 *     maxLength: 10,
 *     maxHeight: 300,
 *     style: {position: 'relative'},
 *     options: [
 *         {value: 'dog', name: 'Dog'},
 *         {value: 'cat', name: 'Cat'},
 *         {value: 'hamster', name: 'Hamster', checked: true},
 *         {value: 'parrot', name: 'Parrot'},
 *         {value: 'spider', name: 'Spider'},
 *         {value: 'goldfish', name: 'Goldfish'},
 *     ],
 *     onopen: (payload) => {
 *         console.log('{onopen} result', payload)
 *     },
 *     onselect: (payload) => {
 *         console.log('{onselect} result', payload)
 *     },
 *     onclick: (eve, trg) => {
 *         // called every click
 *         if (!optioner1.enabled) optioner1.enabled = true;
 *     },
 * });
 * optioner1.toggle()
 * optioner1.turnOn()
 * optioner1.turnOff()
 * optioner1.state     // State
 * optioner1.options   // getter
 *
 * // have two event types - 'open' and 'select' alias 'change'
 * optioner1.on ( 'select' ,  () => {})
 * optioner1.on ( 'open' ,  () => {})
 *
 * // alias for 'select'
 * optioner1.on('change', (payload) => {
 *     console.log('{change} result', payload)
 * })
 * ```
 */
export class UIIOptioner extends UIIButton {

    constructor(uii, key, props) {
        super(uii, key, {
            ...{width: 200}, ...props
        });

        this.type = 'optioner';
        this.props.cssClasses = [...['UII', 'UIIOptioner'], ...props?.cssClasses || []];

        this.props.cssClassDisabled = 'UIIOptionerDisabled';
        this.props.cssClassActive = 'UIIOptionActive';

        this.props.title = props?.title || "Select";
        this.props.titleUpdatable = props?.titleUpdatable ?? true;
        this.props.closeAuto = props?.closeAuto ?? false;
        this.props.enabled = props?.enabled ?? true;
        this.props.opened = props?.opened ?? false;
        this.props.options = props?.options || [];
        this.props.onopen = props?.onopen;
        this.props.onselect = props?.onselect;
        this.props.maxLength = props?.maxLength || 0;
        this.props.maxHeight = props?.maxHeight || 600;

        const reatpl = Doom.yamlrec(HTML, {
            title: this.props.title,
            opened: false,
            index: null,
            enabled: true,
        });
        this.react = reatpl.reactive;
        this.state = reatpl.reactive.state;
        this.elements = {
            ...{
                arrow: null,
                title: null,
                options: null,
            }, ...reatpl.elements
        };
        this.element = super.create(reatpl.template);
        Doom.Styles.remove(`${this.type}_${key}`)
        Doom.Styles.addStyleElement(`${this.type}_${key}`, CSS)

        this.bindOptionsEvents();
        this.createOptions()

        this.state.enabled = this.props.enabled

        if (this.props.opened) {
            if (this.state.enabled) {
                this.turnOn();
            } else {
                this.state.opened = true;
            }
        } else {
            this.turnOff();
        }
    }
    get options () {
        return  this.props.options
    }
    set enabled (enabled) {return  this.state.enabled = !!enabled}
    get enabled () {return this.state.enabled}
    on (type, cb) {
        if (['change','open','select'].includes(type)) {
            if (type === 'open') this.props.onopen = cb
            else {
                this.props.onselect = cb
            }
        } else {
            super.on(type, cb)
        }
    }

    createOptions(options) {
        // && options[0].hasOwnProperty('value') && options[0].hasOwnProperty('name')
        if (Array.isArray(options) )
            this.props.options = options;

        this.elements.options.textContent = '';

        this.props.options.forEach((_option, i) => {
           if (this.props.maxLength > 0 && i > this.props.maxLength-1) return;

            const {value, name} = _option;
            const node = Doom.yamlrec(`div.option[data-value=${value}]: "${name}"`).template;
            this.elements.options.appendChild(node);
            _option.index = i;
            _option.node = node;

            if (_option?.checked === true) // this.react.set('index', i);
                this._onselect ( {target: {dataset: {value}}} )
             else
                 _option.checked = false;
        })

        this.elements.options.style.maxHeight = this.props.maxHeight + 'px';
        this.elements.options.style.overflowY = 'auto';
    }

    bindOptionsEvents() {
        this._onopen = (eve) => {
            if (this.react.state.enabled === false) return;

            const notOpened = this.props?.onopen?.({
                index: this.react.state.index,
            })
            if (notOpened === false) return;
            this.toggle();
        };
        this._onselect = (eve) => {
            if (this.react.state.enabled === false) return;
            const value = eve.target.dataset.value;
            const optionSelected = this.props.options.find((_option, i) => {
                if (_option.value === value) {
                    this.react.state.index = i;
                    return _option;
                }
            });
            this.props?.onselect?.(optionSelected);
            if (this.props.closeAuto) {
                this._onopen()
            }
        };

        this.elements['titleLabel'].addEventListener('click', this._onopen);
        this.elements['options'].addEventListener('click', this._onselect);

        this.react.on('opened', (s) => {
            if (s) {
                this.elements['options'].classList.remove('hide');
                this.elements['arrow'].classList.replace('triangleRight', 'triangleDown');
            }
            else {
                this.elements['options'].classList.add('hide');
                this.elements['arrow'].classList.replace('triangleDown', 'triangleRight');

            }
        })
        this.react.on('index', (idx) => {
            const optionSelected = this.props.options[idx];
            if (this._lastSelected) {
                optionSelected.checked = false;
                this._lastSelected.node.classList.remove(this.props.cssClassActive);
            }
            optionSelected.checked = true;
            optionSelected.node.classList.add(this.props.cssClassActive);

            if (this.props.titleUpdatable) {
                this.react.set('title', optionSelected.name);
            }
            this._lastSelected = optionSelected;
        })
        this.react.on('enabled', (enabled) => {
            if (enabled) {
                this.elements['header'].classList.remove(this.props.cssClassDisabled);
                this.elements['options'].classList.remove(this.props.cssClassDisabled);
            } else {
                this.elements['header'].classList.add(this.props.cssClassDisabled);
                this.elements['options'].classList.add(this.props.cssClassDisabled);
            }
        })

    }

    get value () {
        return this._lastSelected && this._lastSelected.checked ? this._lastSelected.value : undefined;
    }

    toggle() {
        if (this.react.state.enabled === false) return;
        this.state.opened = !this.state.opened;
    }
    turnOn() {
        if (this.react.state.enabled === false) return;
        this.state.opened = true;
    }
    turnOff() {
        if (this.react.state.enabled === false) return;
        this.state.opened = false;
    }
    destroy() {
        super.destroy();
        this.element.removeEventListener('click', this._onopen);
        this.element.removeEventListener('click', this._onselect);
    }

}

