import {UII_ATTR} from "./UII.js";
import {Ut} from "../Ut.js";
import {Doom} from "../utils/Doom.js";


/**
 * ```
 * UIIBlock = new UIIBlock ( uii, 'keyName', {
 *      x: 0,
 *      y: 0,
 *      z: 0,
 *      width: 30,
 *      height: 30,
 *      fixed: true,
 *      content: true,
 *      style: {},
 *      cssClasses: ['UII', 'UIIBlock'],
 *      userSelect: 'text',
 *
 *      // if in uii instance sets events
 *      onclick: (event, target) => {},
 *      ondblclick: (event, target) => {},
 *      oncontextmenu: (event, target) => {},
 *      onmousemove: (event, target) => {},
 *      onmousedown: (event, target) => {},
 *      onmouseup: (event, target) => {},
 * })
 *
 * UIIBlock.create()        internal
 * UIIBlock.update()
 * UIIBlock.attachTo()
 * UIIBlock.attach()
 * UIIBlock.isVisibly()
 * UIIBlock.hide()
 * UIIBlock.show(optional[styleDisplay])
 * UIIBlock.css(style = {color: 'red', backgroundColor: 'black'})
 * UIIBlock.cssPosition( {right: 5, top: 100, } )
 * UIIBlock.moveTo(x,y)
 * UIIBlock.classList        getter
 * UIIBlock.fixed            getter | setter
 * UIIBlock.x                getter | setter
 * UIIBlock.y                getter | setter
 * UIIBlock.z                getter | setter
 * UIIBlock.width            getter | setter
 * UIIBlock.height           getter | setter
 * UIIBlock.radius           getter | setter
 * UIIBlock.content          getter | setter
 * UIIBlock.html             getter | setter
 * UIIBlock.statistic        getter
 * ```
 */
export class UIIBlock {
    constructor(uii, key, props) {
        /**@type {UII} */
        this.uii = uii;
        /**@type {EventBus} */
        this.eventBus = uii.eventBus;
        this.parent = props?.parent // todo: ?? uii.parent;
        this.type = props?.type ?? 'block';
        this.rootNodeType = props?.rootNodeType ?? 'div';
        this.key = key;
        this.props = {
            ...{
                x: 0,
                y: 0,
                z: 0,
                width: 30,
                height: 30,
                hide: false,
                fixed: true,
                content: true,
                userSelect: 'none',
                // parent: null,
                // wrap: null,
                style: {},
                cssClasses: ['UII', 'UIIBlock'],
            }, ...uii.props, ...props
        };

        this.element = this.create(this.props?.element);

        ;[
            'click',
            'dblclick',
            'contextmenu',
            'mousemove',
            'mousedown',
            'mouseup',
            'mouseleave',
            'mouseenter',
            'mouseout',
            'mouseover',
        ].forEach(eve=>{
            const propEventCallback = props?.[`on${eve}`];
            if (propEventCallback && typeof propEventCallback === 'function')
                this.on(eve, propEventCallback)
        })

/*        if (props?.onclick && typeof props.onclick === 'function') this.on('click', props.onclick)
        if (props?.ondblclick && typeof props.ondblclick === 'function') this.on('dblclick', props.ondblclick);
        if (props?.oncontextmenu && typeof props.oncontextmenu === 'function') this.on('contextmenu', props.oncontextmenu)
        if (props?.onmousemove && typeof props.onmousemove === 'function') this.on('mousemove', props.onmousemove)
        if (props?.onmousedown && typeof props.onmousedown === 'function') this.on('mousedown', props.onmousedown)
        if (props?.onmouseup && typeof props.onmouseup === 'function') this.on('mouseup', props.onmouseup)
        if (props?.onmouseleave && typeof props.onmouseleave === 'function') this.on('mouseleave', props.onmouseleave)
        if (props?.onmouseenter && typeof props.onmouseenter === 'function') this.on('mouseenter', props.onmouseenter)
        if (props?.onmouseout && typeof props.onmouseout === 'function') this.on('mouseout', props.onmouseout)
        if (props?.onmouseover && typeof props.onmouseover === 'function') this.on('mouseover', props.onmouseover)*/
        // if (this.props?.wrap && typeof this.props.wrap.nodeType === Node.ELEMENT_NODE) {
        //     this.elementRect = Doom.create('div', {class: 'UIIMonitorRect'});
        // }
        // if (this.props.hide === true) {
        //     this.hide();
        // }

        // Added to Master UI
        uii.addComponent(this);
    }
    /**
     *
     * Types: 'click', 'dblclick', 'contextmenu', 'mousemove', 'mousedown', 'mouseup'
     * ```
     * on(eventType, callback)
     * ```
     * @param eventType
     * @param callback
     */
    on(eventType, callback) {

        this.uii.eventsElementsListeners.get(eventType).set(this.key,  {
            key: this.key,
            path: `${eventType}:${UII_ATTR}:${this.key}`,
            instance: this,
            callback: (event, target) => {
                callback(event, target)
            },
        })
    }

    create(element) {
        element = element || document.createElement(this.rootNodeType || 'div');
        element.dataset[UII_ATTR] = this.key;

        this.props.cssClasses.forEach(cls => element.classList.add(cls));

        if (this.props.style) {
            Object.keys(this.props.style).forEach(_prop => {
                element.style[_prop] = this.props.style[_prop];
            })
        }
        if (this.props.fixed === true) {
            element.style.position = 'absolute';
            element.style.left = this.props.x + 'px';
            element.style.top = this.props.y + 'px';
        }

        element.style.userSelect = this.props.userSelect ?? 'none';
        element.style.zIndex = this.props.z;

        // if (Ut.isNumeric(this.props.width)) element.style.width = this.props.width + 'px';
        // if (Ut.isNumeric(this.props.height)) element.style.height = this.props.height + 'px';

        // console.log(this.props.width, this.props.height )
        element.style.width = Ut.isNumeric(this.props.width) ? this.props.width + 'px' : this.props.width
        element.style.height = Ut.isNumeric(this.props.height) ? this.props.height + 'px' : this.props.height

        this.insertContentTo(this.props.content, element)

        /*
        if (Ut.isHTMLString(this.props.content)) element.innerHTML = this.props.content;
                else if (Ut.isString(this.props.content)) element.textContent = this.props.content;
                else if (Ut.isNode(this.props.content)) element.appendChild(this.props.content);*/
        return element;
    }

    update() {
        const forUpdate = [
            'x', 'y', 'z', 'width','height','content',
        ];
        Object.keys(this.props).forEach((name) => {
            if (forUpdate.includes(name)) {
                this[name] = this.props[name]
            }
        })
    }

    attachTo(parent) {
        console.log(this.element.isConnected, parent)
        if (!this.element.isConnected)
            parent.appendChild(this.element);

        // todo ??
       // else  parent.appendChild(this.element);
    }

    attach() {
        if (!this.element.isConnected) {
            // console.log('attach', this.parent, this.element)
            this.parent.appendChild(this.element);
        } else {
            try {
                this.parent.appendChild(this.element);
            } catch (e) {console.warn(e)}
        }
    }

    append(uiie) {
        if (uiie instanceof UIIBlock) {
            uiie = uiie.element
        }
        if (Ut.isNode(uiie)) {
            return this.element.appendChild(uiie)
        }
        console.warn(`Type error. The parameter when "append" must be of type UIIBlock or HTMLElement.`)
    }

    destroy() {
        this.element.remove();
        delete this;
    }

    hide = function () {
        let originDisplayStyle = getComputedStyle(this.element).display;

        if (originDisplayStyle && originDisplayStyle !== 'none')
            this.props.style.display = originDisplayStyle;

        this.element.style.display = 'none'
    };

    isVisibly () {
        return this.element.style.display !== 'none'
    }

    show = function (styleDisplay) {
        if (styleDisplay) {
            return  this.element.style.display = styleDisplay;
        }

        if (this.props.style.display && this.props.style.display !== 'none') {
            this.element.style.display = this.props.style.display;
        } else {
            this.element.style.display = 'block'
        }
    };

    css = function (styles) {
        Doom.css(this.element, styles)
    };

    /**
     * ```
     * cssPosition( {right: 5, top: 100, } )
     * cssPosition( {right: 5, bottom: 5, } )
     * cssPosition( {left: 5, bottom: 5, } )
     * ```
     * @param pos
     */
    cssPosition(pos) {
        if (!pos) return;
        pos = {...{top: 'unset', right: 'unset', left: 'unset', bottom: 'unset'}, ...pos};
        Object.keys(pos).forEach(k => {
            pos[k] = Ut.isNumber(pos[k]) ? (pos[k] + 'px') : pos[k];
        })
        pos.position = 'fixed';
        this.css(pos);
    }

    moveTo = function (x, y) {
        Doom.css(this.element, {
            left: (x ?? 0) + 'px',
            top: (y ?? 0) + 'px',
        })
    };

    insertContentTo(content, element) {
        if (Ut.isHTMLString(content)) {
            element.innerHTML = content;
        }
        else if (Ut.isString(content)) {
            if (content.includes('\n')) {
                const text = document.createElement('span')
                text.innerHTML = content.replaceAll('\n', '<br />')
                element.textContent = ''
                element.appendChild(text)
            } else {
                element.textContent = content
            }
        }
        else if (Ut.isNode(content)) {
            element.textContent = ''
            element.appendChild(content)
        }
    }

    set fixed(value) {
        // this.element.style.left = value + 'px';
        this.props.fixed = !!value;
    }

    get fixed() {
        return this.props.fixed
    }

    /** @returns {DOMTokenList|any} */
    get classList() {
        return this.element.classList
    }

    set x(value) {
        this.element.style.left = value + 'px';
        this.props.x = value;
    }

    get x() {
        let value = this.props.x
        if (this.element.isConnected) {
            value = parseInt(getComputedStyle(this.element).left) ?? value;
        }
        return isNaN(value) ? 0 : value
    }

    set y(value) {
        this.element.style.top = value + 'px';
        this.props.y = value;
    }

    get y() {
        let value = this.props.y
        if (this.element.isConnected) {
            value = parseInt(getComputedStyle(this.element).top) ?? value;
        }
        return isNaN(value) ? 0 : value
    }

    set z(value) {
        this.element.style.zIndex = value;
        this.props.z = value
    }

    get z() {
        return this.props.z
    }

    set width(value) {
        if (this.element.tagName === 'CANVAS') {
            this.element.width = value;
        } else {
            this.element.style.width = value + 'px';
        }
        this.props.width = value;
    }

    get width() {
        let value = this.props.width
        if (this.element.isConnected) {
            value = parseInt(getComputedStyle(this.element).width) ?? value;
        }
        return isNaN(value) ? 0 : value
    }

    set height(value) {
        if (this.element.tagName === 'CANVAS') {
            this.element.height = value;
        } else {
            this.element.style.height = value + 'px';
        }
        this.props.height = value;
    }

    get height() {
        let value = this.props.height
        if (this.element.isConnected) {
            value = parseInt(getComputedStyle(this.element).height) ?? value;
        }
        return isNaN(value) ? 0 : value
    }

    set radius(value) {
        this.props.radius = value
    }

    get radius() {
        return this.props.radius
    }

    set content(value) {
        this.props.content = value;

        // Option preform
        //
        //
        // return this.element.textContent = value;

        this.insertContentTo(value, this.element);
    }

    get content() {
        return this.element.textContent
    }

    set html(value) {
        this.props.content = value;
        this.element.innerHTML = value;
    }

    get html() {
        return this.element.outerHTML
    }

    get statistic() {
        const position = Doom.position(this.element);
        const computedStyle = getComputedStyle(this.element);
        const common = {
            isConnected: this.element.isConnected,
            position: computedStyle.position,
            display: computedStyle.display,
        }
        return {
            ...JSON.parse(JSON.stringify(this.props)),
            ...JSON.parse(JSON.stringify(position)),
            ...common,
        }
    }
}