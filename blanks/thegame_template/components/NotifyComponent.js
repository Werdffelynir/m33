import {ReaComponent} from "../../engine/ReaComponent.js";
import {Doom} from "../../engine/utils/Doom.js";
import {EventBus} from "../../engine/EventBus.js";



const CSS = ``;
const HTML = `
div
  div
    h2: "Hello {{title}}"
    div: "demo component example "
`;


export class NotifyComponent extends ReaComponent {
    installed = false;
    create() {
        if (this.installed) return
        this.installed = true
        this.bus = new EventBus()
        this.name = this.constructor.name

        super.create({
            template: HTML,
            css: CSS,
            state: {title: 'Theater NotifyComponent',},
        })

        // this.bus.busme(this.root, ['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu'])
    }
    constructor(register, props) {
        super(register, props);

        // /**@type{Screen}*/ this.screen = props.screen;
        // this.setup()

    }
    setup() {
        this.mount(
            this.screen.root
        )
    }

    hello(){
        console.log(4)
    }
}