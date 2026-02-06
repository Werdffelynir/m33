import {IManager} from "./IManager.js";
import {ReactiveTemplate} from "./ReactiveTemplate.js";


export class TemplateManager extends IManager {

    /**
     *
     * @property {String} templateString
     * @property {EventBus} eventBus
     * @property {ReactiveTemplateYAML} reactiveTemplate
     * @property Object state
     * @property Object elements
     *
     * @property {HTMLElement} root
     * @property {HTMLElement} template
     */

    get root() {
        return this._root;
    }

    configured(params) {
        this.eventBus = params?.eventBus;
        this.templateString = params.template;
    }

    async init(params) {
        this.setup();
    }

    destroy() {
        if (this._root.parentElement === document.body) {
            this._root.remove();
        }
    }

    setup() {
        this.reactiveTemplate = new ReactiveTemplate({
            template: this.templateString,
            state: {}
        });
        this.reactiveTemplate.render();

        this._root = this.reactiveTemplate.template;
        this.elements = this.reactiveTemplate.elements;
        this.state = this.reactiveTemplate.state;

        return this.reactiveTemplate.template
    }

    /**
     * @param view {HTMLElement}
     * @returns {HTMLElement}
     */
    append(view) {
        if (view && !this.root.contains(view)) {
            this.root.appendChild(view);
            this.eventBus?.publish(`template:append`, {name: 'template:append', element: view});
        }
        return view;
    }


    attach() {
        this.destroy();
        document.body.insertAdjacentElement('afterbegin', this._root);
    }
}
