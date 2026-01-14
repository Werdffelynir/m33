import {ReaComponent} from "engine/ReaComponent.js";
import {EventBus} from "engine/EventBus.js";



const CSS = `
@layer page {

    @scope(#SettingsComponent) {
    
    }
}    
`;
const HTML = `
div.menucontent-format 
  div
    h1: "SETTINGS"
  div.w-100.h-90
    div: "___settings_params___"
  div.text-right
    div.button[onclick=@onSave]: "Save"
`;

export class SettingsComponent extends ReaComponent {
    create() {
        this.name = this.constructor.name;
        this.children = new Map()
        this.bus = new EventBus()

        super.create({
            template: HTML,
            css: CSS,
            state: {
                onSave: this.saveSettings,
            }
        });

        this.bus.busme(this.root, ['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu'])


        this.bus.subscribe(`click:id:sett`, ( {event, target, data, name} ) => {
            console.log({event, target, data, name})
        })
    }

    saveSettings () {
        console.log(this)
    }
}