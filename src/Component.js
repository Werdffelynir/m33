import {Reactive} from "./Reactive.js";
import {IState} from "./IState.js";
import {ReactiveTemplate} from "./ReactiveTemplate.js";


export class Component {
    constructor(props = {}) {
        props.state = props.state instanceof IState
            ? props.state
            : new IState(props.state || {});

        this.parent = props?.parent || document.body;
        this.root = props?.root || document.createElement('div');

        this.reactive = (props?.state && props.state instanceof Reactive)
            ? props.state : new Reactive( props?.state || {} );

        this.state = this.reactive.state;
    }

    mount() {
        return this.parent.appendChild(this.root);
    }

    unmount() {
        return this.parent.removeChild(this.root);
    }
}


export class TemplateComponent {
    constructor(props = {}) {
        props.state = props.state instanceof IState
            ? props.state
            : new IState(props.state || {});

        this.parent = props?.parent || document.body;
        if (props?.css) {
            ReactiveTemplate.renderStaticCSS(this.constructor.name, props.css)
        }

        this.reactiveTemplate = new ReactiveTemplate({
            template: props.template, state: props.state
        });
        this.reactiveTemplate.render()
        this.reactive = this.reactiveTemplate.reactive
        this.state = this.reactiveTemplate.state;
        this.root = this.reactiveTemplate.template
    }

    mount() {
        return this.parent.appendChild(this.root);
    }

    unmount() {
        return this.parent.removeChild(this.root);
    }
}