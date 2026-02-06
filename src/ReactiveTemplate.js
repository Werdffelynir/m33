import {IState} from "./IState.js";
import {Reactive} from "./Reactive.js";
import {YAMLTemplate} from "./utils/YAMLTemplate.js";
import {Ut} from "./Ut.js";
import {Doom} from "./utils/Doom.js";


/**
 * ```
 *   button[data-id=@varReg][onclick=state.title='title changed']: "Change"
 *   // or
 *   button[onclick=@onclick]: "Change"
 * ```
 */
export class ReactiveTemplate {

    researchAttrs = [];
    researchEvents = [];

    constructor({template, state, props, eventBus, researchAttrs, researchEvents, createNodeType} = {}) {
        if (state instanceof IState) {
            this.reactive = state.reactive;
            this.source = state.reactive.source;
            this.state = state.reactive.state;
        } else {
            this.reactive = new Reactive(state || {}, props);
            this.state = this.reactive.state;
            this.source = this.reactive.source;
        }

        this.eventBus = eventBus;
        this.researchAttrs = researchAttrs ?? ['data-id', 'data-var', 'data-action'];
        this.researchEvents = researchEvents ?? ['click', 'click'];

        this.yaml = new YAMLTemplate({
            template,
            state: this.state,
            researchAttrs: this.researchAttrs,
            createNodeType: createNodeType || 'span'
        });

        if (this.eventBus) {
            if (this.researchEvents.length) {
                this.eventBus?.busme(this.yaml.template, this.researchEvents)
            }
        }
    }

    /** @type {* } @return {* } */
    get elements() {return this.yaml.elements}
    /** @type {* } @return {* } */
    get template() {return this.yaml.template}

    research() {
        this.yaml.research();
    }

    render() {
        this.yaml.render();

        const valueForElement = ( element, path, value ) => {
            return typeof value === 'function' ? value(element, path) : value;
        }

        for (const [path, element] of Object.entries(this.yaml.elementsWithAttrs)) {
            if (!(element.stack instanceof Set)) continue;

             this.reactive.on(path, (_value, prev) => {
                element.stack.forEach(elem => {

                   this.insertAttr(elem, element.attrName, valueForElement(elem, path, _value))
                })
            });
        }

        for (const [path, element] of Object.entries(this.yaml.elementsWithValue)) {
            if (!(element.stack instanceof Set)) continue;
            this.reactive.on(path, (_value, prev) => {
                element.stack.forEach(elem => {

                   this.insertValue(elem, valueForElement(elem, path, _value))
                })
            });
        }
        for (const [path, element] of Object.entries(this.yaml.elementsVars)) {
            if (!(element.stack instanceof Set)) continue;

            this.reactive.on(path, (_value, prev) => {
                element.stack.forEach(elem => {

                    this.insertContent (elem, valueForElement(elem, path, _value))
                })
            });

        }
    }

    insertAttr(element, attr, value) {
        if (Ut.isFunction(value)) value = value()

        element.setAttribute(attr, value);
    }

    insertValue(element, value) {
        if (Ut.isFunction(value)) value = value()

        if (element.type === 'number' && (isNaN(value) || undefined || value === 'undefined')) {
            value = "-0" //(element?.step && Ut.isNumeric(element.step)) ? -parseFloat(element.step) : "-0"
        }

        element.value = value
    }

    insertContent(element, value) {
        if (Ut.isFunction(value)) value = value()

        if (Ut.isNode(value)) {
            element.replaceChildren(value);
        } else if (Ut.isHTMLString(value)) {
            element.innerHTML = value;
        } else {
            element.textContent = String(value);
        }
    }

    replaceThe(targetName, newerElement) {
        if ( !Ut.isNode(newerElement) ) return console.warn(`ErrorType: param "newElement" is not Node type!`)
        this.elements[targetName].parentNode.replaceChild(newerElement, this.elements[targetName]);
        this.research();
    }

    appendTo(name, child) {
        if (this.elements.hasOwnProperty(name) && Ut.isNode(this.elements[name])) {
            if ( !Ut.isNode(child) ) return console.warn(`ErrorType: param "childElement" is not Node type!`)

            this.elements[name].appendChild(child);
            this.research();
        } else {
            console.warn(`ErrorType: elements with "varName=${name}" is not exist!`)
        }
    }

    static renderStatic(templateString, state = {}) {
        if (!Ut.isString(templateString) || templateString.length < 1)
            console.warn(`Param templateString is not String. Expected YAML Template`)

        const yaml = new ReactiveTemplate({
            template: templateString,
            state,
        })
        yaml.render();

        return yaml;
    }

    static renderStaticCSS(id, CSSString) {
        return Doom.Styles.addStyleElement(id, CSSString)
    }
}



