import {ReactiveTemplate} from "./ReactiveTemplate.js";


/**
 * reactive component, has systems - state, templates, signals
 * ```js
 * const loadingPage = new ReaComponent({}, {
 *     template:`div.absolute.top.fill.bg-goldenrod.opacity05.text-center: "Loading..."`,
 *     name: "LoadingPage",
 * })
 *
 * loadingPage.mount(document.body)
 * ```
 *
 *
 * ```view
 * input.cssClass[type=text][placeholder=CSS][autocomplete=off][spellcheck=false][onchange=@onchange]
 * input.cssClass[type=number][placeholder=CSS][oninput=@oninput]
 * input.w200px[type=range][value=@height][data-name=height][oninput=@oninput][step=10][min=0][max=100]
 *
 * input.w100[type=checkbox][onclick=state.firsPerson=checked][value=@firsPerson]
 * ```
 *
 * ```js
 * const rea = ReaComponent (register, {
 *     template: 'div.component: "My Component"',
 *     css: `#component{}`,
 *     parent: null,
 *     root: null,
 *     state: IState | {},
 *     events: { click: callback }
 * })
 * .mount(parent)   // setup component
 *
 * .unmount(parent) // remove component
 * .render()
 *
 * .onMount()
 * .onUnmount()
 *
 * .setup()
 * .update()
 *
 * rea.register: {Register}
 * rea.react: ReactiveTemplateYAML (rea.reactive)
 * rea.state:
 * rea.elements:
 * rea.parent: HTMLElement
 * rea.root: HTMLElement (rea.reactive.template)
 * rea.props: {}
 * ```
 *
 * ```
 * // Example class
 * export class CreateComponent extends ReaComponent {
 *     create() {
 *         this.name = this.constructor.name;
 *
 *         super.create({
 *             template: HTML,
 *             css: CSS,
 *             state: {
 *                 title: this.name,
 *             },
 *         });
 *
 *         this.canvasesRoot = this.elements['canvases']
 *         this.toolsRoot = this.elements['tools']
 *     }
 *     constructor(register, props) {
 *         super(register, props);
 *
 *         this.setup()
 *     }
 * }
 * ```
 * @param register {Register|any}
 * @param props {any} ` { parent: null, root: null, state: {}, template: 'div.component: "My Component"', css:  } `
 */
export class ReaComponent {

    constructor(register, props = {}) {
        this.register = register;
        this.props = props;

        this.templateString = props?.template || `div: "Component"`;
        this.cssString = props?.css;
        this.parent = props?.parent;
        this.root = props?.root; // !not use! todo fix replacement by priority

        this._attached = false;
        this._boundListeners = new Map();

        const state = props?.state || {};

        this.create({
            template: this.templateString,
            state: state,
        });
    }

    create({template, css, state}) {

        this.reactiveTemplate = new ReactiveTemplate({
            template: template || `div`,
            state: state,
        });

        this.reactiveTemplate.render();
        this.reactiveTemplate.research()

        this.reactive = this.reactiveTemplate.reactive
        this.state = this.reactiveTemplate.state;

        /** @type {any} */
        this.elements = this.reactiveTemplate.elements;

        /** @type {HTMLElement} */
        this.root = this.reactiveTemplate.template;

        if (css) this.cssString = css;

        // this.constructor.name is polymorphic
        const nameId = this.props?.name ?? this.constructor.name;

        if (this.cssString)
            ReactiveTemplate.renderStaticCSS(nameId, this.cssString);

        this.root.id = nameId;

        return this.root;
    }

    get react () {
        return this.reactive;
    }

    /**
     * passed on mount way
     * @param root
     * @param parent
     */
    render({root, parent}) {
    }

    update() {
    }

    get isMounted () {
        return !!this._attached;
    }

    mount(parent) {
        if (this._attached) return;

        // const template = this.renderTemplate();
        // if (template) this.root.replaceChildren(template);

        if (parent) this.parent = parent;

        if (this.parent && this.root) {
            this.bindEvents();
            this.render({root: this.root, parent: this.parent});
            this.onMount();
            this.parent.appendChild(this.root);
            this._attached = true;
            this._installed = false;
        }
    }

    unmount(parent) {
        if (!this._attached) return;
        if (parent) this.parent = parent;
        if (this.parent && this.root && this.root.parentNode) {
            this.onUnmount();
            this._unbinds();

            this.parent.removeChild( this.root)
            this._attached = false;
        }
    }

    /**
     * To use. Overwrite method
     */
    setup() {
        // example
        if (this._installed) return;
        this._installed = true;
    }

    onMount() {}

    onUnmount() {}

    bind(path, callback) {
        if (!this.state?.on) return;
        this.state.on(path, callback);
        this._boundListeners.set(path, callback);
    }

    _unbinds() {
        if (!this.state?.off) return;
        for (const [path, cb] of this._boundListeners) {
            this.state.off(path, cb);
        }
        this._boundListeners.clear();
    }

    bindEvents() {
        if (!this.props?.events || !this.root) return;
        for (const [event, handler] of Object.entries(this.props.events)) {
            this.root.addEventListener(event, handler);
        }
    }

    onState(path, cb) {this.reactive.on(path, cb)}
    offState(path, cb) {this.reactive.off(path, cb)}
    setState(path, value) {this.reactive.set(path, value)}
    setStateIfDif(path, value) {this.reactive.setIfDif(path, value)}
    getState(path) {return this.reactive.get(path)}
    hasState(path) {return this.reactive.has(path)}
    mixState(newState) {return this.reactive.mix(newState)}
}

