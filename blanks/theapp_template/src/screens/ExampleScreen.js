import {Screen} from "../../engine/Screen.js";
import {ReactiveTemplateYAML} from "../../engine/ReactiveTemplateYAML.js";
import {ReaComponent} from "../../engine/ReaComponent.js";


export class ExampleScreen extends Screen {

    create() {
        if (this.installed) return;
        this.installed = true;

        this.component = new ReaComponent(this.register, {
            template: `div.component: "My Component ${this.constructor.name}"`,
            css: `.component{}`,
            state: {},
        });

        //
        // register root template
        //
        super.create({
            root:  this.component.root
        });
    }

    bindEvents() {
    }

    setup(params) {
    }

    render({parent, root}) {
    }
    async change(params) {
        await super.change(params);
    }
    destroy() {
        super.destroy();
    }
    attach(parent) {
        super.attach(parent);
    }
    detach(parent) {
        super.detach(parent);
    }
}




class ExampleScreen_2  extends Screen {
    constructor(register) {
        super(register);
    }

    //
    // recreated root template every init
    //
    change(params) {
        this.state = params.state;

        const tplMain = ReactiveTemplateYAML.renderStatic(`div: "Hello ${this.constructor.name}"`);

        this.append(tplMain.template)
    }
}



