import {ReaComponent} from "../../../engine/ReaComponent.js";
import {EventBus} from "../../../engine/EventBus.js";
import {Doom} from "../../../engine/utils/Doom.js";
import {BasicSandboxComponent} from "./BasicSandboxComponent.js";



const CSS = ``;
const HTML = `
div
  div[data-id=viewport]
  div[data-id=sandbox]
`;

export class Theater2DComponent extends ReaComponent {

    create() {
        this.bus = new EventBus()
        this.name = this.constructor.name

        super.create({
            template: HTML,
            css: CSS,
            state: {
                title: this.name,
            },
        })

        this.elements.viewport.setAttribute('tabindex', '1')
        this.bus.busme(this.root, ['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu'])

        this.children = new Map()

        this.children.set('sandbox', new BasicSandboxComponent(this.register, {
            parent: this.elements['sandbox'],
            state: this.state,
        }));

    }
    onMount(){
        this.children.forEach(comp => comp.mount())

    }
    onUnmount(){
        this.children.forEach(comp => comp.unmount())
    }

    constructor(register, props) {
        super(register, props);
    }

    setup() {
    }
}