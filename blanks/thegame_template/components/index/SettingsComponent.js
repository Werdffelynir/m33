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

    div.fx-start-center
      div.w-200px
        input[type=checkbox][name=pixelizate][checked=true]
      div.pad-l-10px: "Pixelizate (scale down)"

    div.marg-t-10px.fx-start-center
      div.w-200px
        input[type=checkbox][name=retro][checked=true]
      div.pad-l-10px: "Retro VCS (noise & fx)"

    div.marg-t-10px.fx-start-center
      div.w-200px
        select[name=resolution]
          option[value=800x600]: "800x600"
          option[value=1024x786]: "1024x786"
          option[value=1920x1080][selected=true]: "1920x1080"
      div.pad-l-10px: "Resolution"


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