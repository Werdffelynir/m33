import {Reactive} from "./Reactive.js";
import {Ut} from "./Ut.js";
import {Dot} from "./utils/Dot.js";
import {IState} from "./IState.js";
import {Doom} from "./utils/Doom.js";

/** @deprecated */
export class ReactiveTemplateYAML {

    researchAttrs = ['data-id', 'data-action'];
    researchBusEvents = ['click'];

    /**
     * Use simpled:
     * ```
     * ReactiveTemplateYAML.renderStatic(TEMPLATE_VIEW).template
     * ReactiveTemplateYAML.renderTemplate(TEMPLATE_VIEW)
     * ```
     *
     * ```
     * (new ReactiveTemplateYAML({
     *      template: TEMPLATE_VIEW,
     *      state: {},
     * })).render();
     *
     * ```
     *
     * ### constructor({template, state, params})
     *  - `template = 'div#header'`             yaml template string
     *  - `state = {} `                         state object
     *  - `props = {eventBus, register}`        If passed {eventBus}  - sets a listener for changes to template state variables
     *
     * ### Events
     *      template:researched
     *
     * - `{{reactiveVariable}}`         Reactive Variable
     * - `[data-id]`                    Reactive Element
     *
     * ```
     * react = new ReactiveTemplateYAML({template: MainView})
     * react.render();
     * {template, state, } = react
     *
     * tpl =
     * div#popup:
     *   div.header:
     *     div.title
     *     div.close[data-id=close]: "close"
     *   div.content:
     *     div.message: "Hello {{user_name}}, status {{user_status}}"
     *     div: "user popup text"  div[data-id=inputs]
     *   div.form:
     *     input.edit[type=text][data-id=@name][data-name=name][autocomplete=off][spellcheck=false]
     *     input.edit[type=text][data-id=@desc][data-name=desc][autocomplete=off][spellcheck=false]
     * `
     * state = {
     *      user_name: 'user_name',
     *      user_status: 'user_status',
     *      name: 'default name',
     *      desc: 'default desc',
     * }
     *
     * props = {
     *      // Not recommended
     *      // transmit global eventBus,
     *      eventBus: this.register.eventBus
     *
     *      // thane can use `eventBus.subscribe( 'user_name', (value, prev) => {} )`
     *      register: false,
     * }
     *
     * const react = new ReactiveTemplateYAML({
     *      template: ,
     *      state,
     *      props: {
     *           register: this,
     *           eventBus: this.eventBus, // this.ebus
     *      }
     * });
     *
     * document.body.appendChild( react.render() );
     *
     * console.log(react.state);
     * console.log(react.template);
     * console.log(react.elements);
     *
     * react.subscribe('var1', (_value, _prev) => {
     *     console.log('subscribe var1 _value', _value)
     *     console.log('subscribe var1 _prev', _prev)
     * })
     *
     * timer(() => {
     *     react.state.var1 = 'Hello ' + (i++);
     * }, 1000).start();
     *
     * this.attrs('data-detail') // for get HTMLElements with attr [data-detail=*]
     * ```
     */
    constructor({template, state, props}) {
        if (!Ut.isString(template))
            return console.warn(`{ErrorProps} parameter "template" is not YAML Template Format`);

        this.eventBus = props?.eventBus ?? null;
        this.researchAttrs = props?.researchAttrs && Array.isArray(props.researchAttrs)
            ? [...this.researchAttrs, ...props.researchAttrs]
            : this.researchAttrs;

        this.researchBusEvents = props?.busEvents && Array.isArray(props.busEvents)
            ? [...this.researchBusEvents, ...props.busEvents]
            : this.researchBusEvents;

        this._templateString = template;
        this._elementsWithAttrs = {};
        this._elementsWithValue = {};
        this._elements = {};
        this._template = null;

        if (state instanceof IState) {
            this.reactive = state.reactive;
            this.source = state.reactive.source;
            this.state = state.reactive.state;
        } else {
            this.reactive = new Reactive(state || {}, props);
            this.state = this.reactive.state;
            this.source = this.reactive.source;
        }

    }

    /** @return {HTMLElement} */
    get template() {
        return this._template
    }

    /** @return { * } */
    get elements() {
        return {...this._elements}
    }

    replaceThe(targetVarName, newElement) {
        if ( !Ut.isNode(newElement) ) return console.warn(`ErrorType: param "newElement" is not Node type!`)
        this._elements[targetVarName].parentNode.replaceChild(newElement, this._elements[targetVarName]);
        this.research();
    }

    appendTo(varName, childElement) {
        if (this._elements.hasOwnProperty(varName) && Ut.isNode(this._elements[varName])) {
            if ( !Ut.isNode(childElement) ) return console.warn(`ErrorType: param "childElement" is not Node type!`)

            this._elements[varName].appendChild(childElement);
            this.research();
        } else {
            console.warn(`ErrorType: elements with "varName=${varName}" is not exist!`)
        }
    }

/**/
    attrs(attr, cb) {
        const elems = Array.from(this.template.querySelectorAll('[' + attr + ']'));
        const elemsNamed = {};
        let i = 0;
        while (elems.length > i) {
            const a = elems[i].getAttribute(attr);
            if (a.length > 0)
                elemsNamed[a] = elems[i];
            i++;
        }

        if (cb && typeof cb === 'function') {
            cb(elemsNamed)
            return;
        }

        return elemsNamed;
    }

    research() {
        this._elements = {};
        const attrs = [...this.researchAttrs, ...['data-var']];

        attrs.forEach((_attrData) => {

            for (const [key, element] of Object.entries(Doom.attrs(_attrData, this._template))) {
                this._elements[key] = element;
            }

            if (this._template.hasAttribute(_attrData)) {
                this._elements[this._template.getAttribute(_attrData)] = this._template;
            }
        });

        if (this.eventBus) {
            this.eventBus.publish?.(`template:researched`, {
                template: this._template,
                elements: this._elements,
            });

            if (this.researchBusEvents.length && Object.keys(this._elements).length) {
                this.eventBus?.busme(this._template, this.researchBusEvents)
            }
        }


        return this._elements;
    }

    render() {
        const lines = this._templateString.split(/\r?\n/)
        const root = this._parseLines(lines);

        for (const [path, element] of Object.entries(this._elementsWithValue)) {
            this.reactive.on(path, (_value, prev) => {
                if (Ut.isFunction(_value)) {
                    _value = _value();
                }

                if (element.value !== _value) {
                    element.value = _value;
                }
            });
        }

        for (const [path, element] of Object.entries(this._elements)) {
            const value = Dot.get(this.state, path);

            element.innerHTML = typeof value === 'function' ? value() : value;

            this.reactive.on(path, (_value, prev) => {
                if (Ut.isFunction(_value)) {
                    _value = _value();
                }

                if (Ut.isNode(_value)) {
                    element.replaceChildren(_value);
                } else if (Ut.isHTMLString(_value)) {
                    element.innerHTML = _value;
                } else {
                    element.textContent = Ut.isString(_value) ? _value : String(_value); // todo
                }

            });
        }
        this._template = root;

        this.research();

        return root;
    }

    _parseLines(lines) {
        const stack = [];
        let root = document.createDocumentFragment();

        lines.forEach(line => {
            if (!line.trim()) return;
            const indent = line.match(/^ */)[0].length;
            const level = indent / 2;
            const content = line.trim();

            const repeatMatch = content.match(/\*([0-9]+)$/);
            const repeat = repeatMatch ? parseInt(repeatMatch[1], 10) : 1;
            const cleanContent = repeatMatch ? content.slice(0, content.lastIndexOf('*')).trim() : content;

            for (let i = 1; i <= repeat; i++) {
                const {el, text} = this._createElementFromLine(cleanContent, i);

                if (text) {
                    const parsedText = this._parseText(text, i);
                    parsedText.forEach(node => el.appendChild(node));
                }

                if (level === 0) {
                    root.appendChild(el);
                    stack.length = 1;
                    stack[0] = el;
                } else {
                    stack.length = level;
                    const parent = stack[level - 1];
                    parent.appendChild(el);
                    stack[level] = el;
                }
            }
        });

        return root.children.length === 1 ? root.firstChild : root;
    }

    _createElementFromLine(line, index = 1) {
        const regex = /^([a-zA-Z][\w-]*)([^:\s\[]*)?((?:\[[^\]]+\])*)(?::\s*"([^"]*)")?/;
        const match = line.match(regex);
        if (!match) throw new Error("Invalid syntax: " + line);

        const [, tag, selector = '', attrBlock = '', text = ''] = match;
        const el = document.createElement(tag);

        if (selector) {
            selector.split(/(?=[#.])/).forEach(part => {
                if (part.startsWith('.')) el.classList.add(part.slice(1));
                if (part.startsWith('#')) el.id = part.slice(1).replace(/\$/g, index);
            });
        }

        if (attrBlock) {
            const attrMatches = [...attrBlock.matchAll(/\[([^\]=]+)(?:=([^\]]*))?\]/g)];
            // console.log(tag, selector, text )
            // console.log(attrMatches, attrBlock)
            // todo: need create handler for attributes variables
            attrMatches.forEach(([, key, val]) => {
                // console.log('{{startsWith}}', key, val)
                if (!val) {
                    const msg = `Error Element attribute "${key}" is invalid. Examples: [data-id=header] [onclick=@actionStateClick]`;
                    console.warn(msg);
                    throw new Error(msg)
                }

                if (val.startsWith('@')) {
                    let _name = val.slice(1);
                    let _value = this.reactive.get(_name);
                    if (typeof _value === 'function') {
                        if(key.startsWith('on')){
                            // if (key === 'onload') {
                            //     console.log(key, key.slice(2))
                            //
                            // }
                            //let s_event = key;
                            //let s_name = val.slice(val.search('@')+1);
                            el.reactive = this.reactive;
                            el.addEventListener(key.slice(2), (eve) => {
                                //
                                //
                                //
                                // call element event
                                //
                                // _value.call(this.reactive.source, eve, el)
                                _value(eve, el)
                            })
                            el.removeAttribute(key);
                            el.setAttribute('data-var', val);
                            return;
                        }
                        // _value = _value.bind(this.reactive.state)(el) || 'fn_void';
                        _value = _value(el) || 'fn_void';
                    }

                    el.reactive = this.reactive;

                    if (key === 'value') {
                        el.value = `${_value}`
                        this._elementsWithValue[_name] = el;
                    } else {
                        el.setAttribute(key.trim(), `${_value}`);
                    }

                }
                else
                {
                    let _value = null

                    if (typeof val === 'function') {
                        _value = val(el);
                    }
                    _value = (val?.trim() || '').replace(/\$/g, index);

                    if (key === 'value') {
                        el.value = `${_value}`
                    } else {
                        el.setAttribute(key.trim(), _value);
                    }
                }
            });
        }

        return {el, text};
    }

    _parseText(str, index = 1) {
        const nodes = [];
        const parts = str.split(/({{[^}]+}})/);

        for (let part of parts) {
            if (part.startsWith('{{') && part.endsWith('}}')) {
                const keyRaw = part.slice(2, -2).trim();
                const key = keyRaw.replace(/\$/g, index);
                const span = document.createElement('span');
                span.setAttribute('data-var', key); // todo ??

                if (!this._elementsWithAttrs.hasOwnProperty(key)) {
                    this._elementsWithAttrs[key] = span;
                }

                this._elements[key] = span;

                nodes.push(span);
            } else {
                const text = part.replace(/\$/g, index);
                nodes.push(document.createTextNode(text));
            }
        }

        return nodes;
    }
    
    onState(path, cb) {
        this.reactive.on(path, cb);
    }

    offState(path, cb) {
        this.reactive.off(path, cb);
    }

    setState(path, value) {
        this.reactive.set(path, value);
    }

    setIfDif(path, value) {
        this.reactive.setIfDif(path, value);
    }

    getState(path) {
        return this.reactive.get(path);
    }

    hasState(path) {
        return this.reactive.has(path);
    }

    mixState(newState) {
        return this.reactive.mix(newState)
    }
    
    /** @returns {ReactiveTemplateYAML} */
    static renderStatic(templateString, state = {}) {

        if (!Ut.isString(templateString) || templateString.length < 1)
            console.warn(`Param templateString is not String. Expected YAML Template`)

        const yaml = new ReactiveTemplateYAML({
            template: templateString,
            state,
        })
        yaml.render();

        return yaml;
    }
    static renderStaticCSS(id, CSSString) {
        return Doom.Styles.addStyleElement(id, CSSString)
    }

    static renderTemplate(templateString, state = {}) {
        const react = ReactiveTemplateYAML.renderStatic(templateString, state);
        return react.template;
    }

}
