import {IManager} from "./IManager.js";
import {Doom} from "./utils/Doom.js";
import {Ut} from "./Ut.js";
import {AssetLoader} from "./AssetLoader.js";


/**
 *
 * Events:
 *  -
 * `ui:registered:${key}`
 * `ui:click:${key}`
 * `ui:deleted:${key}`
 * `ui:cleared`
 * `ui:shown:${key}`
 * `ui:hidden:${key}`
 * `ui:loaded:${key}`
 *
 *
 * ```
 * configured( props = {} | {parent, eventBus, viewsPath, modal} )
 *
 *
 *
 * ```
 *
 */
export class UIManager extends IManager {

    configured(props = {}) {
        this.root = props?.parent || document.body;
        this._modal = props?.modal || false;
        this.eventBus = props?.eventBus;

        this.assetLoader = this.register.hasOwnProperty('assetLoader')
            ? this.register.assetLoader
            : new AssetLoader(this.register);

        this.viewsPath = props?.viewsPath || this.register?.config?.viewsPath || './views/';
        this._bused = new Set();
        this._visiblyViews = new Set();
        this._subscribes = new Set();
    }

    set modal(value) {
        this._modal = !!value;
        if (this._modal) {
            this.root.style.display = 'block'
        } else {
            this.root.style.display = 'contents'
        }
    }

    /**
     * @param {String} key
     * @param {HTMLElement} template
     * @returns {HTMLElement|void}
     */
    set(key, template) {
        if (this.stackmanager.has(key))
            return this.stackmanager.get(key);

        if (!Ut.isNode(template)) {
            return console.warn(`{UIManager.registerView} template required type of HTMLElement`);
        }

        this.stackmanager.set(key, template);

        //
        // bused
        //
        if (this.eventBus) {
            this.eventBused(template);
            this.eventBus.publish(`ui:registered:${key}`, {name: key, data: template});
        }

        template.style.zIndex = template?.style?.zIndex || 1;
        return template;
    }

    registerView(key, template) {
        return this.set(key, template);
    }

    /**
     * ```
     *
     * ```
     * @param key View name
     * @param elemKey data-click=elemKey
     * @param callback
     */
    uiclick(key, elemKey, callback) {
        if (!this.stackmanager.has(key)) return;

        this.subscriber = ({event, target, data}) => {
            const template = this.stackmanager.get(key);

            if (template.contains(target)) {
                callback(event, target, data)
            }
        }
        this._subscribes.add(elemKey)
        this.eventBus.subscribe(`ui:click:${elemKey}`, this.subscriber)
    }

    delete(key) {
        this.hide(key);
        this.stackmanager.delete(key);
        this.eventBus.publish(`ui:deleted:${key}`, {name: key, data: null});

        this._subscribes.forEach(ek => this.eventBus.unsubscribe(`ui:click:${ek}`, this.subscriber))

    }

    clear() {
        this.stackmanager.forEach((key, view) => this.hide(key));
        this.stackmanager.clear();
        this.eventBus.publish(`ui:cleared`, {});
    }

    eventBused(template) {

        if (this._bused.has(template))
            return template;

        const eventBus = this.eventBus;

        const listeners = (e) => {
            const target = e.target.closest('[data-click]');

            if (target && eventBus) {
                const data = target.dataset.click;
                eventBus.publish(`ui:click:${data}`, {event: e, target, data, name: 'click'});

                GLog(1, `<${this.constructor.name}.publish>`, `ui:click:${data}`);
            }
        };

        template.removeEventListener('click', listeners);
        template.addEventListener('click', listeners);
        this._bused.add(template)
    }

    show(key, point) {
        const view = this.stackmanager.get(key);

        if (view && !this.root.contains(view)) {

            this.root.appendChild(view);

            this._visiblyViews.add(key);

            if (point && Ut.isString(point) && point === 'center') {
                this.setPositionCenter()
            }

            if (point && Ut.isNumeric(point.x) && Ut.isNumeric(point.y)) {
                this.setPosition(key, point.x, point.y);
            }

            if (Ut.isNumeric(point) && Ut.isNumeric(arguments[2])) {
                this.setPosition(key, point, arguments[2]);
            }

            this.eventBus?.publish(`ui:shown:${key}`, {name: key, data: null});
        }

        if (!view) {

            console.warn(`"${key}" views is not registered! \nList of exists (${this.stackmanager.size})\n` +
                [...this.stackmanager.keys()].join(', \n')
            );
        }
    }

    isVisibly(key) {
        return this._visiblyViews.has(key);
    }
    
    hide(key) {
        if (!key) {
            this.stackmanager.forEach((react, key) => {
                this.hide(key);
            })
            return;
        }

        if (Ut.isString(key)) {

            const view = this.stackmanager.get(key);

            if (view && this.root.contains(view)) {

                this.root.removeChild(view);

                this._visiblyViews.delete(key);

                this.eventBus?.publish(`ui:hidden:${key}`, {name: key, data: view});
            }

            return;
        }

        if (Ut.isArray(key)) {
            key.forEach((key, i) => this.hide(key))
        }
    }

    toggle(key) {
        if (this.isVisibly(key)) this.hide(key);
        else this.show(key);
    }
    
    async loadTemplate(key, url, state = {}) {

        if (this.stackmanager.get(key))
            return this.stackmanager.get(key);

        const templateString = await this.assetLoader.loadText(key, this.viewsPath + url)
        this.eventBus?.publish(`ui:loaded:${key}`, {name: key, data: null});

        const react = Ut.reactiveYAML(templateString, state)
        this.set(key, react.template);

        return react;
    }

    setPosition(key, x, y) {
        const template = this.stackmanager.get(key);

        Doom.css(template, {
            display: 'block',
            position: 'absolute',
            marginTop: 'unset',
            marginLeft: 'unset',
            marginRight: 'unset',
            marginBottom: 'unset',
            top: y + 'px',
            left: x + 'px',
        });
    }

    setPositionRight(key, right = 0, top = 0) {
        const template = this.stackmanager.get(key);

        Doom.css(template, {
            display: 'block',
            position: 'absolute',
            marginTop: 'unset',
            marginLeft: 'unset',
            marginRight: 'unset',
            marginBottom: 'unset',
            top: top + 'px',
            left: 'unset',
            right: right + 'px',
        });
    }

    setPositionBottom(key) {
        const template = this.stackmanager.get(key);
        Doom.css(template, {
            display: 'block',
            position: 'absolute',
            marginTop: 'unset',
            marginLeft: 'unset',
            marginRight: 'unset',
            marginBottom: 'unset',
            top: 'unset',
            left: 0 + 'px',
            right: 'unset',
            bottom: 0 + 'px',
        });
    }

    setPositionRightBottom(key) {
        const template = this.stackmanager.get(key);
        Doom.css(template, {
            display: 'block',
            position: 'absolute',
            marginTop: 'unset',
            marginLeft: 'unset',
            marginRight: 'unset',
            marginBottom: 'unset',
            top: 'unset',
            left: 'unset',
            right: 0 + 'px',
            bottom: 0 + 'px',
        });
    }

    setPositionCenter(key) {
        const template = this.stackmanager.get(key);
        const position = Doom.position(this.stackmanager.get(key));

        if (!template) {
            throw new Error(` setPositionCenter for element: ${template ? '[ELEMENT]' : '[UNDEFINED]'}`);
        }

        Doom.css(template, {
            display: 'block',
            position: 'absolute',
            marginTop: 'unset',
            marginLeft: 'unset',
            marginRight: 'unset',
            marginBottom: 'unset',
            top: (window.innerHeight / 2) - (position.height / 2) + 'px',
            left: (window.innerWidth / 2) - (position.width / 2) + 'px',
        });
    }


    _dragconf = {isDragging: false, mouse: {x: 0, y: 0}, z: 0};

    setDraggable(name, holder = null) {
        const template = this.stackmanager.get(name);
        holder = holder && holder.nodeType === Node.ELEMENT_NODE ? holder : template;

        // Create events functions
        const onMouseMove = (e) => {
            if (!this._dragconf.isDragging) return;

            const left = (e.clientX - this._dragconf.x);
            const top = (e.clientY - this._dragconf.y);

            this.setPosition(name, left, top);
            template.style.zIndex = (this._dragconf.z = this._dragconf.z + 1);
        }
        const onMouseUp = () => {
            this._dragconf.isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        holder.addEventListener('mousedown', (e) => {
            this._dragconf.isDragging = true;
            this._dragconf.x = e.clientX - template.offsetLeft;
            this._dragconf.y = e.clientY - template.offsetTop;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

    }
}

