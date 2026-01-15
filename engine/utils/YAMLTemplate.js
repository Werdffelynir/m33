import {Ut} from "../Ut.js";
import {Dot} from "./Dot.js";
import {Doom} from "./Doom.js";


/**
 * Some view template examples
 * [value=@stateParam]
 * [onclick=@stateHandler]
 * [onchange=@stateHandler]
 * [oninput=@stateHandler]
 *
 * [data-id=elementName]
 *
 * input[type=text][value=@projectName][onchange=@onchange][data-name=projectName][autocomplete=off][spellcheck=false]
 *
 * input.w200px[type=range][value=@positionX][step=16][min=-1024][max=1024][oninput=@oninput][data-name=positionX]
 *
 * select[data-id=repeat][data-name=repeat][onchange=@onchangeSelect]
 *   option[data-name=no-repeat][selected=selected]: "no-repeat"
 *
 *
 *
 *
 *
 *
 *
 *
 **/

 /**
 *
 * 
 * ```
 * div#popup:
 *   div.header:
 *     div.title
 *     div.close[data-action=close]: "close"
 *   div.content:
 *     div.message: "Hello {{user_name}}, status {{user_status}}"    div.center
 *
 *       img[src=/assets/images/scanner.png][width=400][height=200]
 *
 *     div: "user popup text"
 * ```
 */
export class YAMLTemplate {

    constructor({template, state = {}, researchAttrs, createNodeType, fnCreateNode} = {}) {

        this.researchAttrs = researchAttrs ?? ['data-var', 'data-id'];
        this._templateString = template;
        this._template = null;
        this._elements = {};
        this._elementsVars = {};
        this._elementsWithValue = {};
        this._elementsWithAttrs = {};
        this._createNodeType = createNodeType ?? 'span';
        this.state = state;

        this.fnCreateNode = typeof fnCreateNode === 'function'
            ? fnCreateNode
            : (key) => {
                const span = document.createElement(this._createNodeType);
                span.setAttribute('data-var', key);
                return span
            };
    }

    get template () {
        return this._template;
    }

    get elements () {
        return this._elements
    }
    get elementsVars () {return this._elementsVars}
    get elementsWithValue () {return this._elementsWithValue}
    get elementsWithAttrs () {return this._elementsWithAttrs}

    _mergeSets = (setTarget, setSource) => [... new Set([...setTarget, ...setSource])]

    _mergeComplex = (target, source) => {
        for (const [path, payload] of Object.entries(source)) {
            if (target[path]) {
                target[path].stack = this._mergeSets(target[path].stack, payload.stack)
                continue;
            }
            target[path] = [...payload.stack][0]
            target[path].stack = [...payload.stack]
        }
    }

    research () {
        const attrs = this.researchAttrs;
        this._elements = {};

        attrs.forEach((attr) => {
            this._template.querySelectorAll('['+attr+']').forEach(el => {
                const name = el.getAttribute(attr);
                if(!this._elements[name] ) {
                    this._elements[name] = el
                    this._elements[name].stack = []
                } else
                    this._elements[name].stack.push(el)
            });
        })
        this._mergeComplex(this._elements, this._elementsVars)
        this._mergeComplex(this._elements, this._elementsWithValue)
        this._mergeComplex(this._elements, this._elementsWithAttrs)
    }


    render() {
        const lines = this._templateString.split(/\r?\n/);
        const root = this._parseLines(lines);
        const forElement = (value, element, path) => typeof value === 'function' ? value(element, path) : value;

        for (const [path, element] of Object.entries(this._elementsWithValue)) {
            let value = Dot.get(this.state, path);

            if (element.stack instanceof Set) {
                element.stack.forEach(elem => elem.value = value  )
                continue;
            }

            element.value = value;
        }

        for (const [path, element] of Object.entries(this._elementsVars)) {

            let value = Dot.get(this.state, path);

            if (element.stack instanceof Set) {
                element.stack.forEach(elem => this.insertContent (elem, forElement(value, elem, path)) )
                continue;
            }
            this.insertContent (element, forElement(value, element, path));
        }

        this._template = root;

        this.research ()
        return root;
    }

    insertContent (element, value) {
        if (element.value !== undefined) {
            element.value = Ut.isNumeric(value) ? parseFloat(value) : String(value);
        }
        if (Ut.isNode(value)) {
            element.replaceChildren(value);
        } else if (Ut.isHTMLString(value)) {
            element.innerHTML = value;
        } else {
            element.textContent = String(value);
        }
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
                const {createdElement, text} = this._createElementFromLine(cleanContent, i);

                if (text) {
                    const parsedText = this._parseText(text, i);
                    parsedText.forEach(node => createdElement.appendChild(node));
                }

                if (level === 0) {
                    root.appendChild(createdElement);
                    stack.length = 1;
                    stack[0] = createdElement;
                } else {
                    stack.length = level;
                    const parent = stack[level - 1];
                    parent.appendChild(createdElement);
                    stack[level] = createdElement;
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
        const createdElement = document.createElement(tag);

        if (selector) {
            selector.split(/(?=[#.])/).forEach(part => {
                if (part.startsWith('.')) createdElement.classList.add(part.slice(1));
                if (part.startsWith('#')) createdElement.id = part.slice(1).replace(/\$/g, index);
            });
        }

        if (attrBlock) {
            const attrMatches = [...attrBlock.matchAll(/\[([^\]=]+)(?:=([^\]]*))?\]/g)];

            attrMatches.forEach(([, matchKey, matchStr]) => {

                if (!matchStr) {
                    const msg = `Error Element attribute "${matchKey}" is invalid. Examples: [data-id=header] [onclick=@actionStateClick]`;
                    console.warn(msg);
                    throw new Error(msg)
                }

                if (matchStr.startsWith('@')) {
                    let evename = matchStr.slice(1);
                    let _value = Dot.get(this.state, evename);

                    if (typeof _value === 'function') {
                        if (matchKey.startsWith('on')) {

                            createdElement.state = this.state;
                            createdElement.addEventListener(matchKey.slice(2), (eve) => {

                                //
                                // Search elements attrs dynamic "[onclick=@onclickme]"
                                //
                                //
                                // call element event
                                //
                                _value.call(this.state, eve, createdElement)
                            })

                            createdElement.removeAttribute(matchKey);
                            createdElement.setAttribute('data-var', evename);
                            createdElement.setAttribute('data-yaml', 'attr');

                            return;
                        }

                        _value = _value.call(this.state, createdElement) || 'fn_void';
                    }

                    createdElement.state = this.state;

                    // matchKey === 'checked'
                    if (createdElement.type?.toLowerCase() === 'checkbox') {
                        createdElement.checked = _value;
                        createdElement.setAttribute('data-yaml', 'checked');
                    }

                    if (matchKey === 'value') {
                        createdElement.value = `${_value}`

                        // Search elements attrs dynamic "[value=@stateParam]"
                        //
                        createdElement.setAttribute('data-yaml', 'value');
                        if (!this._elementsWithValue[evename]) {
                            this._elementsWithValue[evename] = {element: createdElement};
                            this._elementsWithValue[evename].stack = new Set([createdElement]);
                        } else {
                            this._elementsWithValue[evename].stack.add(createdElement)
                        }

                    } else {

                        // Set other attrs, not of `value`
                        //
                        createdElement.setAttribute(matchKey.trim(), `${_value}`);
                        if (!this._elementsWithAttrs[evename]) {
                            this._elementsWithAttrs[evename] = {element: createdElement};
                            this._elementsWithAttrs[evename].attrName = matchKey.trim();
                            this._elementsWithAttrs[evename].attrVar = evename;
                            this._elementsWithAttrs[evename].stack = new Set([createdElement]);
                        }else
                            this._elementsWithAttrs[evename].stack.add(createdElement)
                    }

                } else {
                    let _value = null

                    if (typeof matchStr === 'function') {
                        _value = matchStr.call(this.state, createdElement);
                    }

                    _value = (matchStr?.trim() || '').replace(/\$/g, index);

                    if (matchKey === 'value') {
                        createdElement.value = `${_value}`
                    } else {
                        createdElement.setAttribute(matchKey.trim(), _value);
                    }
                }
            });
        }

        return {createdElement, text};
    }
    _addElementsWithValue(evename, element) {

    }
    _addElementsWithAttrs(evename, element) {

    }
    _parseText(str, index = 1) {
        const nodes = [];
        const parts = str.split(/({{[^}]+}})/);

        for (let part of parts) {
            if (part.startsWith('{{') && part.endsWith('}}')) {
                const keyRaw = part.slice(2, -2).trim();
                const key = keyRaw.replace(/\$/g, index);

                // Create dynamic elements by var key "{{var}}"
                //
                //
                // todo replace to this.fnCreateNode
                const span = this.fnCreateNode(key);
                span.setAttribute('data-var', key);
                span.setAttribute('data-yaml', 'var');

                if (!this._elementsVars[key]) {
                    this._elementsVars[key] = {element: span};
                    this._elementsVars[key].stack = new Set([span]);
                }else
                    this._elementsVars[key].stack.add(span)

                nodes.push(span);
            } else {
                const text = part.replace(/\$/g, index);

                nodes.push(document.createTextNode(text));
            }
        }

        return nodes;
    }

}


export function rea({template, state, props}) {
    const yaml = new YAMLTemplate({template, state, props});
    return yaml.render();
}


