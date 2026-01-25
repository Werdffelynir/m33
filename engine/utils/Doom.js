import {Ut} from "../Ut.js";
import {ReactiveTemplateYAML} from "../ReactiveTemplateYAML.js";
import {ReactiveTemplate} from "../ReactiveTemplate.js";
import {YAMLTemplate} from "./YAMLTemplate.js";


export const Doom = {

    clear(node) {
        if (node) node.innerHTML = '';
    },
    clone(node, deep = true) {
        return node?.cloneNode(deep);
    },
    remove(node) {
        node?.remove?.();
    },
    replace(oldNode, newNode) {
        if (oldNode?.replaceWith) oldNode.replaceWith(newNode);
    },

    //
    // Doom.insertIn (root, node, Doom.BEFORE)
    // ||
    // Doom.insert (root.firstElementChild, node, Doom.BEFORE)
    // ||
    // root.firstElementChild.insertAdjacentElement('beforebegin', node);
    //
    BEFORE: 'before',
    AFTER: 'after',
    PREPEND: 'prepend',
    APPEND: 'append',
    insert(root, node, position = 'append') {
        if (!(root instanceof Element) || !(node instanceof Node)) return;

        switch (position) {
            case 'before': root.before(node); break;
            case 'after': root.after(node); break;
            case 'prepend': root.prepend(node); break;
            case 'append': default: root.append(node); break;
        }
    },
    insertIn(root, node, position = 'append') {
        Doom.insert(root?.firstElementChild ?? root, node, position);
    },

    /**
     * ```
     * const card = create('div', { class: 'card', 'data-id': '42' }, [
     *   create('h3', 'Title'),
     *   create('p', 'Some text'),
     * ], {
     *   backgroundColor: '#eef',
     *   padding: '1em'
     * });
     *
     * document.body.appendChild(card);
     * ```
     * @param tag
     * @param attrs
     * @param content
     * @param styles
     * @returns {any}
     */
    create(tag, attrs = null, content = null, styles = null) {
        const el = document.createElement(tag);

        if (arguments.length === 2 && (typeof attrs === 'string' || attrs instanceof Node || Array.isArray(attrs))) {
            content = attrs;
            attrs = null;
        }

        if (attrs && typeof attrs === 'object' && !Array.isArray(attrs) && !(attrs instanceof Node)) {
            if ('style' in attrs && typeof attrs.style === 'object') {
                styles = attrs.style;
                delete attrs.style;
            }

            for (const [key, val] of Object.entries(attrs)) {
                el.setAttribute(key, val);
            }
        }

        if (styles && typeof styles === 'object') {
            for (const [key, val] of Object.entries(styles)) {
                el.style[key] = val;
            }
        }

        const appendContent = (value) => {

            if (Ut.isString(content) && Ut.isHTMLString(content)) {
                let _cont = document.createElement('div')
                _cont.innerHTML = content;
                el.appendChild(_cont.firstElementChild);
            } else if (typeof value === 'string') {
                el.insertAdjacentHTML('beforeend', value);
            } else if (value instanceof Node) {
                el.appendChild(value);
            } else if (Array.isArray(value)) {
                value.forEach(v => appendContent(v));
            }
        };


        if (content) {
            appendContent(content);
        }

        return el;
    },



    /**
     * ```
     * Doom.CSSVariable.get('--main-color');
     * Doom.CSSVariable.set('--main-color', '#ff9900')
     * Doom.CSSVariable.remove('--main-color')
     * Doom.CSSVariable.getAll()
     * Doom.CSSVariable.setMany({
     *   '--main-color': '#00f',
     *   '--bg-color': '#eee',
     * }
     * ```
     */
    CSSVariable: {
        _freshDocumentElement() {
            return document.documentElement;
        },

        get(name) {
            const styles = getComputedStyle(this._freshDocumentElement());
            return styles.getPropertyValue(name).trim();
        },

        set(name, value) {
            this._freshDocumentElement().style.setProperty(name, value);
        },

        remove(name) {
            this._freshDocumentElement().style.removeProperty(name);
        },

        getAll() {
            const styles = getComputedStyle(this._freshDocumentElement());
            return Array.from(styles)
                .filter(p => p.startsWith('--'))
                .reduce((acc, key) => {
                    acc[key] = styles.getPropertyValue(key).trim();
                    return acc;
                }, {});
        },

        setMany(vars) {
            for (const [k, v] of Object.entries(vars)) {
                this._freshDocumentElement().style.setProperty(k, v);
            }
        }
    },

    /**
     * ```
     * Doom.Styles.add('button-style', '.my_button', {
     *   backgroundColor: '#315322',
     *   color: '#fff',
     *   fontSize: '16px'
     * });
     *
     * Doom.Styles.addStyleElement('button-style',  CSS_STRING );
     *
     * Doom.Styles.update('button-style', '.my_button', {
     *   backgroundColor: '#772222'
     * });
     *
     * Doom.Styles.remove('button-style');
     *
     * console.log(Doom.styles.has('button-style'));
     *
     * Doom.Styles.clear();
     *
     * console.log(Doom.Styles.list());
     * ```
     */
    Styles: (() => {
        const styleMap = new Map();

        const toKebab = s => s.replace(/([A-Z])/g, '-$1').toLowerCase();

        function createStyleElement(id, cssText) {
            const style = document.createElement('style');
            style.dataset.doom = id;
            style.textContent = cssText;
            document.head.appendChild(style);
            return style;
        }

        function buildRule(selector, styles) {
            const body = Object.entries(styles)
                .map(([k, v]) => `${toKebab(k)}: ${v};`)
                .join(' ');
            return `${selector} { ${body} }`;
        }

        return {
            addStyleElement(id, cssStylesString) {
                if(styleMap.has(id)) return;

                const cssStylesElement = createStyleElement(id, cssStylesString);
                styleMap.set(id, cssStylesElement);
                return cssStylesElement;
            },

            add(id, selector, styles) {
                if (styleMap.has(id)) this.remove(id);

                let css = '';
                if (typeof styles === 'string') {
                    css = styles;
                } else {
                    css = buildRule(selector, styles);
                }

                const el = createStyleElement(id, css);
                styleMap.set(id, el);
            },

            update(id, selector, newStyles) {
                this.add(id, selector, newStyles);
            },

            remove(id) {
                const el = styleMap.get(id);
                if (el) {
                    el.remove();
                    styleMap.delete(id);
                }
            },

            clear() {
                for (const id of styleMap.keys()) {
                    this.remove(id);
                }
            },

            has(id) {
                return styleMap.has(id);
            },

            list() {
                return Array.from(styleMap.keys());
            }
        };
    })(),


    attrs(attr, template, cb) {
        template = template ?? document;

        const elems = Array.from(template.querySelectorAll('[' + attr + ']'));
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
    },

    /**
     *
     * css( '.header', {color: 'red', 'font-size': '120%'} )
     * // or
     * css( '.header', 'color', 'red' )
     *
     * @param {HTMLElement|String|Array|Object|{}} selector
     * @param {CSSStyleDeclaration|{}} properties
     *
     * @returns {null|undefined}
     */
    css(selector, properties) {
        if (!selector || !properties) return;
        if (arguments.length === 3) {
            const prop = {};
            prop[properties] = arguments[2];
            return css(selector, prop);
        }

        let i, k, elements = null,
            typeSelector = Ut.typeOf(selector),
            typeProperties = Ut.typeOf(properties),
            parse = function (str) {
                let i, p1 = str.split(';'), p2, pn, ix, o = {};
                for (i = 0; i < p1.length; i++) {
                    p2 = p1[i].split(':');
                    pn = p2[0].trim();
                    ix = pn.indexOf('-');
                    if (ix !== -1)
                        pn = pn.substring(0, ix) + pn[ix + 1].toUpperCase() + pn.substring(ix + 2);
                    if (p2.length === 2)
                        o[pn] = p2[1].trim()
                }
                return o;
            };


        switch (typeSelector) {
            case 'string':
                elements = Doom.queryAll(selector);
                break;

            case 'object':
                if (Ut.isNode(selector))
                    elements = [selector];
                break;

            case 'array':
                elements = selector;
                break;
        }

        if (elements) {

            if (typeProperties === 'string')
                properties = parse(properties);

            for (i in elements)
                for (k in properties)
                    elements[i].style[k] = properties[k];
        }

        return elements
    },

    /**
     * Convert String to Object
     * CSS Style
     *
     * @param str
     * @returns {{[p: string]: any}}
     */
    parseCSS2Object: str => typeof str === 'string' && str.length > 0 ? Object.fromEntries(
        str.split(";")
            .map(r => r.split(":").map(s => s && s.trim()))
            .filter(([k,v]) => k && v)
            .map(([k,v]) => [k.replace(/-([a-z])/g, (_,c) => c.toUpperCase()), v])
    ) : {},

    /**
     * Convert Object to String
     * CSS Style
     *
     * @param obj
     * @returns {string}
     */
    parseCSS2String: obj => Ut.isObject(obj)
        ? Object.entries(obj).map(([k,v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v};`).join(' ')
        : '',

    parseCSS2String2(styleObject) {
        const cssProperties = [];
        for (const key in styleObject) {
            if (Object.prototype.hasOwnProperty.call(styleObject, key)) {
                const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
                const value = styleObject[key];
                cssProperties.push(`${cssKey}: ${value};`);
            }
        }
        return cssProperties.join(' ');
    },

    /**
     * ```
     *
     * Doom.onDOMContentLoaded(() => {
     *     register.setup().then();
     * });
     *
     * await Doom.onDOMContentLoaded( async () => {
     *     await register.setup();
     * })
     * ```
     * @param callback
     */
    onDOMContentLoaded(callback) {
        Doom.onDOMContentLoadedAsync().then(() => callback())
    },

    /**
     * ```
     * await Doom.onDOMContentLoaded();
     * await register.setup();
     *
     * Doom.onDOMContentLoaded().then(() => register.setup());
     * ```
     * @returns {Promise<unknown>}
     */
    onDOMContentLoadedAsync() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve, {once: true});
            } else {
                resolve();
            }
        });
    },

    queryAll(selector, from = document.body, callback = null, context = null) {
        if (selector instanceof Element)
            return [selector];

        if (typeof from === 'string')
            from = document.body.querySelector(from);

        const elements = from instanceof Element ? Array.from(from.querySelectorAll(selector)) : [];

        if (typeof callback === 'function') {
            for (const el of elements) {
                callback.call(context ?? {}, el);
            }
        }

        return elements;
    },

    query(selector, from = document.body, callback = null, context = null) {

        const all = queryAll(selector, from, callback, context);

        return /**  @type {HTMLElement} */ all[0] ?? null;
    },

    queryUp(selector, from, callback) {
        const searched = Doom.query(selector, from, callback);
        let elem = null;

        if (searched) {
            return searched
        } else {
            if (from.parentElement)
                return Doom.queryUp(selector, from.parentElement);
        }
        return null
    },

    inject(selector, data, append, from) {
        if (Ut.typeOf(selector, 'array')) {
            selector.forEach((elem) => {
                this.inject(elem, data, append, from);
            });
            return null;
        }

        if (Ut.typeOf(selector, 'string'))
            selector = query(selector, from);

        if (!append)
            selector.textContent = '';

        if (Ut.isNode(selector)) {
            if (Ut.isNode(data)) {
                selector.appendChild(data);
            } else if (Ut.typeOf(data, 'array')) {
                let i;
                for (i = 0; i < data.length; i++)
                    this.inject(selector, data[i], true, from);
            } else {
                selector.innerHTML = (!append) ? data : selector.innerHTML + data;
            }
            return selector;
        }
        return null;
    },

    /**
     * ```
     * search ('[data-on]', 'data-on' )
     * ```
     * @param selector
     * @param attr
     * @param from
     * @param stacked
     * @returns {{}}
     */
    search(selector, attr, from, stacked = false) {
        from = Ut.isNode(from) ? from : query(from);
        let i = 0,
            key,
            elements = {},
            query_elements = this.queryAll(selector, from || document.body);

        if (query_elements) {
            while (i < query_elements.length) {
                if (!attr)
                    elements[i] = query_elements[i];
                else {
                    if (query_elements[i].hasAttribute(attr)) {
                        key = query_elements[i].getAttribute(attr);

                        if (stacked && elements[key])
                            Array.isArray(elements[key])
                                ? elements[key].push(query_elements[i])
                                : elements[key] = [elements[key], query_elements[i]];
                        else
                            elements[key] = query_elements[i];
                    }
                }
                i++;
            }
        }
        return elements;
    },

    each(list, callback, instance) {
        let type = Ut.typeOf(list);

        switch (type) {
            case 'array':
                list.forEach((i, v, a) => callback.call(instance, i, v, a));
                break;
            case 'object':
                if (Ut.isNode(list)) {
                    if (list instanceof NodeList)
                        this.each(Array.from(list), callback, instance)
                    else
                        this.each([list], callback, instance)
                } else
                    Object.keys(list).forEach((key) => callback.call(instance, list[key], key, list));
                break;
            case 'string':
                this.each(list.split(""), callback, instance);
                break;
            case 'number':
                this.each(Array.from(Array(list)), callback, instance);
                break;
        }
    },

    /**
     * Here is a function to format a date according to the pattern
     * `yy.mm.dd h:i:s`
     * supporting:
     *      `yy`      - ,
     *      `yyyy`    - ,
     *      `mm`      - ,
     *      `dd`      - ,
     *      `h`       - ,
     *      `hh`      - ,
     *      `i`       - ,
     *      `ii`      - ,
     *      `s`       - ,
     *      `ss`      - .
     *
     * ```
     * const now = new Date();
     *
     * console.log(formatDate(now, "yyyy-mm-dd hh:ii:ss")); // 2025-05-25 14:09:03
     * console.log(formatDate(now, "yy.mm.dd h:i:s"));      // 25.05.25 14:9:3
     * ```
     * @param date
     * @param format
     * @returns {*}
     */
    formatDate(date, format) {
        const pad = (n, len = 2) => n.toString().padStart(len, '0');

        const replacements = {
            yyyy: date.getFullYear(),
            yy: pad(date.getFullYear() % 100),
            mm: pad(date.getMonth() + 1),
            dd: pad(date.getDate()),
            hh: pad(date.getHours()),
            h: date.getHours(),
            ii: pad(date.getMinutes()),
            i: date.getMinutes(),
            ss: pad(date.getSeconds()),
            s: date.getSeconds(),
        };

        return format.replace(/yyyy|yy|mm|dd|hh|h|ii|i|ss|s/g, match => replacements[match]);
    },

    arraysEqual(arr1, arr2) {
        if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) return false;

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }

        return true;
    },

    /**
     *
     * ```
     * Doom.backgroundSprite(
     *   'spritesheet.png',   // image
     *    64, 0,              // sx, sy: обрізати з (64, 0)
     *    32, 32,             // sWidth, sHeight: кадр розміром 32x32
     *    100, 200,           // dx, dy: куди вставити
     *    64, 64              // dWidth, dHeight: відобразити розміром 64x64 (масштаб)
     * );
     * ```
     * @param imageSrc
     * @param sx
     * @param sy
     * @param sWidth
     * @param sHeight
     * @param dx
     * @param dy
     * @param dWidth
     * @param dHeight
     * @param parent
     * @returns {HTMLDivElement}
     */
    backgroundSprite(imageSrc, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, parent = document.body) {

        const div = document.createElement('div');

        Object.assign(div.style, {
            position: 'absolute',
            left: `${dx}px`,
            top: `${dy}px`,
            width: `${dWidth}px`,
            height: `${dHeight}px`,
            backgroundImage: `url(${typeof imageSrc === 'string' ? imageSrc : imageSrc.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `-${sx}px -${sy}px`,
            backgroundSize: 'auto', // за замовчуванням, але зміниться нижче
            imageRendering: 'pixelated' // якщо спрайт — піксель-арт
        });

        // Розрахунок масштабу джерела, якщо треба зменшити або збільшити
        // Наприклад, якщо у тебе велика sprite sheet, а треба тільки її частину

        if (dWidth !== sWidth || dHeight !== sHeight) {
            const scaleX = dWidth / sWidth;
            const scaleY = dHeight / sHeight;

            const img = typeof imageSrc === 'string' ? new Image() : imageSrc;

            if (typeof imageSrc === 'string') img.src = imageSrc;

            img.onload = () => {
                const fullWidth = img.width;
                const fullHeight = img.height;

                div.style.backgroundSize = `${fullWidth * scaleX}px ${fullHeight * scaleY}px`;
            };

            if (img.complete) {
                const fullWidth = img.width;
                const fullHeight = img.height;
                div.style.backgroundSize = `${fullWidth * scaleX}px ${fullHeight * scaleY}px`;
            }
        }

        parent.appendChild(div);
        return div;
    },

    /**
     * ```
     * const elementParams = position( HTMLElement, Element.parentElement )
     * // elementParams { element, x, y, width, height, top, left, right, bottom, parent}
     * ```
     * @param element {HTMLElement}
     * @param from
     * @returns {{parent: ({top: number, left: number, bottom: number, width: number, right: number, height: number}|DOMRect), top: number, left: number, bottom: number, x: number, width: number, y: number, right: number, element, height: number}|null}
     */
    position(element, from = document.body) { //todo
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return console.warn(`{Doom.position} Parameter element is not ELEMENT_NODE type. Current type: [${(typeof element)}]`)
        }


        if (element.isConnected) {
            const css = getComputedStyle(element);
            const elemRect = element.getBoundingClientRect();
            const fromRect = (from === document.body) ? {
                left: 0,
                top: 0,
                right: window.innerWidth,
                bottom: window.innerHeight,
                width: window.innerWidth,
                height: window.innerHeight
            } : from.getBoundingClientRect();

            let x = elemRect.left - fromRect.left;
            let y = elemRect.top - fromRect.top;

            if (css.position === 'absolute') {
                x = parseInt(css.marginLeft);
                y = parseInt(css.marginTop);
            }

            if (css.position === 'fixed') {
                x = parseInt(css.left);
                y = parseInt(css.top);
            }

            return {
                x: x,
                y: y,
                width: elemRect.width,
                height: elemRect.height,
                top: elemRect.top - fromRect.top,
                left: elemRect.left - fromRect.left,
                right: fromRect.right - elemRect.right,
                bottom: fromRect.bottom - elemRect.bottom,
                element: element,
                parent: (document.body === element.parentElement) ? fromRect : Doom.position(element.parentElement),
                isConnected: true,
            }
        }

        return {
            x: 0,
            y: 0,
            width: parseInt(element.style.width) || null,
            height: parseInt(element.style.height) || null,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            element,
            parent: element?.parentElement,
            isConnected: false,
        }
    },

    positionMouse(event, from = document.documentElement) {
        if (!(event instanceof MouseEvent)) {
            console.error('Error: argument is not type the MouseEvent!');
            return;
        }
        const rect = from instanceof HTMLElement
            ? from.getBoundingClientRect()
            : event.target.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    },

    afterConnected(element, callback) {
        if (document.body.contains(element)) {
            callback()
        } else {
            const observer = new MutationObserver(() => {
                if (document.body.contains(element)) {
                    observer.disconnect();
                    callback()
                }
            });
            observer.observe(document.body, {childList: true, subtree: true});
        }
    },

    /**
     * @param {*|string|Element} selector
     * @param {string} eventName
     * @param {function} callback
     * @param {boolean} bubble
     */
    on(selector, eventName, callback, bubble = false) {
        let i, elements = [];

        switch (Ut.typeOf(selector)) {
            case 'string':
                elements = Doom.queryAll(selector);
                break;
            case 'object':
                if (Ut.isNode(selector))
                    elements = [selector];
                break;
            case 'array':
                elements = selector;
                break;
        }

        for (i = 0; i < elements.length; i++) {
            if (elements[i] && elements[i].addEventListener)
                elements[i].addEventListener(eventName, callback, !!bubble);
        }
    },

    /**
     *
     * @param {Object} options
     * @param {string} options.text
     * @param {number} [options.delay=50]
     * @param {HTMLElement} options.element
     * @param {boolean} [options.blink=true]
     */
    typewriter({ text, delay = 50, element, blink = true, onstep = null, onend = null }) {
        let i = 0;
        let cursor = blink ? "|" : "";

        function step() {
            element.textContent = text.slice(0, i) + cursor;
            if (i < text.length) {
                i++;
                if (onstep)
                    onstep();
                setTimeout(step, delay);
            } else if (blink) {
                if (onend)
                    onend()
                // Миготіння курсора
                setInterval(() => {
                    cursor = cursor ? "" : "|";
                    element.textContent = text + cursor;
                }, 500);
            }
        }

        step();
    },

    str2fragment(string) {
        if (document.createRange)
            return document.createRange().createContextualFragment(string);
        else {
            let i,
                fragment = document.createDocumentFragment(),
                container = document.createElement("div");

            container.innerHTML = string;
            while (i = container.firstChild)
                fragment.appendChild(i);

            return fragment;
        }
    },

    str2node(string) {
        let result;
        let fragment = Doom.str2fragment(string);

        switch (fragment.childElementCount) {
            case 0:
                break;
            case 1:
                result = fragment.firstElementChild;
                break;
            default:
                let container = document.createElement("span");
                container.appendChild(fragment);
                result = container;
        }
        return result;
    },

    node2str(element) {
        const container = document.createElement("div");
        container.appendChild(element.cloneNode(true));
        return container.innerHTML;
    },

    async load(sources) {
        const _audio = sources.audio ?? {};
        const _image = sources.image ?? {};
        const _svg = sources.svg ?? {};
        const _json = sources.json ?? {};
        const repository = {audio: {}, image: {}, svg: {}, json: {}};

        for (let key in _audio) {
            repository.audio[key] = await Doom.load.audio(_audio[key]);
        }
        for (let key in _image) {
            repository.image[key] = await Doom.load.image(_image[key]);
        }
        for (let key in _svg) {
            repository.svg[key] = await Doom.load.svg(_svg[key]);
        }
        for (let key in _json) {
            repository.json[key] = await Doom.load.json(_json[key]);
        }

        return repository;
    },

    capitalize: (text) => text.charAt(0).toUpperCase() + text.slice(1),

    // todo rm
    yamlrec (templateString, state) {
        return ReactiveTemplate.renderStatic(templateString, state)
    },

    componentCount: 0,

    /** @return {ReactiveTemplate|{}|*} */
    component ({template, css, cssId, state = {}, props, nodeType = 'span'}) {
        if (!(typeof template === 'string') || template.length < 1)
            console.warn(`Param templateString is not String. Expected YAML Template`)

        // ReactiveTemplate
        const yaml = new ReactiveTemplate({
            template,
            state,
            props,
            createNodeType: nodeType,
        })

        if (cssId) Doom.Styles.remove(cssId)
        else cssId = 'doom_comp_'+Doom.componentCount;

        if (typeof template === 'string')
            Doom.Styles.addStyleElement(cssId, css)

        Doom.componentCount ++;

        yaml.render();
        return yaml;
    },

}


Doom.load.audio = async function (src) {
    const audio = new Audio(src);
    return new Promise((resolve, reject) => {
        audio.addEventListener("canplaythrough", () => {
            resolve(audio);
        });
        audio.addEventListener("error", () => {
            reject();
            throw new Error('Error load.audio [' + src + ']');
        });
    });
};
Doom.load.image = async function (src) {
    const img = new Image();
    return new Promise((resolve, reject) => {
        img.addEventListener("load", () => {
            resolve(img);
        });
        img.addEventListener("error", () => {
            reject();
            throw new Error('Error load.image [' + src + ']');
        });
        img.src = src;
    });
};
Doom.load.text = async function (url) {
    const response = await fetch(url);
    return await response.text();
}
Doom.load.json = async function (url) {
    const response = await fetch(url);
    return await response.json();
}
Doom.load.svg = async function (src, width = 100, height = 100, callback) {
    const svg = new DOMParser().parseFromString(await load.fetchText(src), 'image/svg+xml').firstElementChild;
    svg.setAttribute('width', width + 'px');
    svg.setAttribute('height', height + 'px');
    if (callback) {
        callback.call(svg, svg);
    }
    return svg;
};

/**
 * Silence save file to User Download folder
 * ```
 * await saveFile({ name: "Test", value: 42 }, 'json', 'data.json');
 * await saveFile("Hello World", 'text', 'hello.txt');
 * ```
 */
Doom.saveFile = function (data, type = 'text', filename = 'file.txt') {
    let blob;

    if (type === 'json') {
        blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    } else if (type === 'text') {
        blob = new Blob([data], {type: 'text/plain'});
    } else if (type === 'html') {
        blob = new Blob([data], {type: 'text/html'});
    } else if (type === 'csv') {
        blob = new Blob([data], {type: 'text/csv'});
    } else if (type === 'binary') {
        blob = new Blob([data], {type: 'application/octet-stream'});
    } else {
        blob = new Blob([data], {type: type}); // дозволяє вказати повністю свій MIME
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
};
/**
 * ```
 * const data = await Doom.loadFileForm('json'); // 'text', 'dataURL', 'arrayBuffer'
 * console.log(data);
 *
 * Doom.loadFileForm('json').then(
 * type: "json",
 * onLoad: ({event, json, file, reader}) => {
 *     console.log('{json}', json)
 *     console.log('{event}', event)
 *     console.log('{file}', file)
 *     console.log('{reader}', reader)
 * })
 * ```
 * @param srcd
 * @returns {Promise<unknown>}
 */
Doom.loadFileForm = async function (srcd = 'text') {
    let fileType = Ut.isObject(srcd) && Ut.isString(srcd.type)
        ? srcd.type
        : srcd

    const onLoad = srcd?.onLoad || null;
    const onError = srcd?.onError || null;

    // if (Ut.isObject(type) && Ut.isString(type.type)) {
    //     fileType = type.type;
    //     onLoad = type.onLoad
    // }
    // else
    //     fileType = type
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';

        input.onchange = (event) => {
            const file = input.files[0];
            if (!file) return reject('No file selected');

            const reader = new FileReader();

            reader.onload = () => {

                if (fileType === 'json') {
                    try {
                        const json = JSON.parse(reader.result)
                        resolve(json);

                        onLoad?.({event, json, file, reader})

                    } catch (e) {
                        onError?.({event, error: e, result: reader.result, file, reader})
                        reject(e);
                    }

                } else {
                    resolve(reader.result);
                }
            };

            reader.onerror = () => reject(reader.error);

            switch (fileType) {
                case 'text':
                case 'json':
                    reader.readAsText(file);
                    break;
                case 'arrayBuffer':
                    reader.readAsArrayBuffer(file);
                    break;
                case 'dataURL':
                    reader.readAsDataURL(file);
                    break;
                case 'binaryString':
                    reader.readAsBinaryString(file);
                    break;
                default:
                    reject(new Error('Unknown type: ' + fileType));
            }
        };

        input.click();
    });
};
/**
 * ```
 * Doom.saveFileForm(JSON.stringify(tasks), 'json', fileName ).then(()=>{
 *     console.log('file manager is closed! ')
 * });
 * ```
 */
Doom.saveFileForm = async function (data, type = 'text', filename = 'file.txt') {
    const options = {
        suggestedName: filename,
        types: [{
            description: `${type.toUpperCase()} file`,
            accept: {
                'text/plain': ['.txt'],
                'application/json': ['.json'],
                'text/html': ['.html'],
                'text/csv': ['.csv'],
                'application/octet-stream': ['.bin']
            }[type] || {'*/*': ['.txt', '.text', '.json']}
        }]
    };

    try {
        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();

        let content = data;

        if (type === 'json' && typeof data !== 'string') {
            content = JSON.stringify(data, null, 2);
        }

        await writable.write(content);
        await writable.close();

        return true;

    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Save failed:', err);
        }
    }
};

