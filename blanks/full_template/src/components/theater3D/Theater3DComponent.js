import {ReaComponent} from "../../../engine/ReaComponent.js";
import {EventBus} from "../../../engine/EventBus.js";
import {Doom} from "../../../engine/utils/Doom.js";



const CSS = ``;
const HTML = `
div
  div
    h2: "Running: {{title}}"
    div: "demo component say: {{say}}"
`;

export class Theater3DComponent extends ReaComponent {

    create() {
        this.bus = new EventBus()
        this.name = this.constructor.name

        super.create({
            template: HTML,
            css: CSS,
            state: {
                title: this.name,
                say: this.hello(),
            },
        })
        this.root.setAttribute('tabindex', '1')

        this.bus.busme(this.root, ['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu'])
    }

    constructor(register, props) {
        super(register, props);

        // this.setup()
    }

    setup() {
        // this.mount()
    }

    hello(){
        return `Hello!`
    }
}