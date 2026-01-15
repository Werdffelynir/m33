import {ReaComponent} from "engine/ReaComponent.js";
import {IndexController} from "../../controllers/IndexController.js";
import {Theater2DController} from "../../controllers/Theater2DController.js";
import {Theater3DController} from "../../controllers/Theater3DController.js";
import {Doom} from "engine/utils/Doom.js";
import {EventBus} from "engine/EventBus.js";
import {SettingsComponent} from "./SettingsComponent.js";
import {ReactiveTemplate} from "../../../engine/ReactiveTemplate.js";


const CSS_FONTS = `
@import url("/assets/cssme/animated.css") layer(animated);
@import url("/assets/cssme/transform.css") layer(transform);

@layer page {

    @scope(#StartpageComponent) {
        .menu{
        }
        .menuitem {
            margin-top: 20px;
            width: 200px;
            color: var(--cc8);
        }
        .menuitem:hover {
            color: var(--cc5);
        }
        [data-id=menucontent]{
            width: 600px;
            height: 600px;
            border: 3px solid var(--cc5);
            padding: 10px;
            margin-right: 100px;
        }
        
        .menucontent-format {
            display: flex;
            width: 100%;
            height: 100%;
            flex-direction: column;
        }
        .menucontent-format {}
        .load-row {
            margin-top: 10px;
            padding: 10px;
            border: 3px solid var(--cc5);
        }
    }
}    
`;


const HTML_FONTS = `
div.absolute.fill.cut
  h1.header.center.fontsize-300.h-20: "{{title}}"
  div.menu.fx-center-start.h-50
    div.animated.pop.relative.center.fontsize-200[data-id=menulist]
    div.animated.relative.left.fontsize-100[data-id=menucontent]: "Content data"
    
`;

const HTML_NEW_GAME = `
div.menucontent-format 
  div
    h1: "NEW GAME"
  div.w-100.h-90
    div.fx-between-center.w-100
      div: "Select Character"
      div
        select.text-left.w-200px[name=character][onchange=@onSelectCharacter]
          option[value=character1]: "Character 1"
          option[value=character2]: "Character 2"
          option[value=character3]: "Character 3"
    div.table.pad-t-20px
      div.w-100px: "{{characterImage}}"
      div.vtop.pad-5px: "{{characterDescription}}"
  div.text-right
    div.button[onclick=@onStart]: "Start"
`

const HTML_LOAD = `
div.menucontent-format 
  div
    h1: "LOAD GAME"
  div.w-100.h-90
    div.table.load-row
      div: 
        div.fontsize-130: "Save name [save-date] [game time]"
      div.button[onclick=@onLoad]: "Load"
    div.table.load-row
      div: 
        div.fontsize-130: "Save name [save-date] [game time]"
      div.button[onclick=@onLoad]: "Load"
`

export class StartpageComponent extends ReaComponent {
    create() {
        this.name = this.constructor.name;
        this.children = new Map()

        super.create({
            template: HTML_FONTS,
            css: CSS_FONTS,
            state: {
                title: "Startpage"
            },
        });
    }

    constructor(/**@type Register */register, props) {
        super(register, props);


        const switchController = async (className) => {
            if (this.register.controllers.current?.constructor?.name !== className) {
                await this.register.switchController(className)
            }
        }


        Doom.css(this.elements["menucontent"], {'opacity': '0' })

        let wakeContentTimer;
        let wakeContentTimeout = 100;
        const wakeContent = (content) => {
            if (wakeContentTimer) {
                clearTimeout(wakeContentTimer);
                this.elements["menucontent"].classList.remove('slideInLeft');
                this.elements["menucontent"].classList.add('slideOutLeft');
                wakeContentTimeout = 1000
            }

            wakeContentTimer = setTimeout(() => {
                Doom.css(this.elements["menucontent"], {'display': 'block'})
                this.elements["menucontent"].classList.remove('slideOutLeft');
                this.elements["menucontent"].classList.add('slideInLeft');

                this.elements["menucontent"].textContent = ''
                this.elements["menucontent"].appendChild(content)
            }, wakeContentTimeout);
        }


        this.menulist = [
            {
                title: 'New game',
                onclick: async ({target, event}) => {
                    const rea = ReactiveTemplate.renderStatic(HTML_NEW_GAME,  {
                        characterImage: "",
                        characterDescription: "",
                        onSelectCharacter: (event, target) => {
                            const chars = {
                                character1: {img: '/resources/icons/material.png', desc: 'Biography of Character 1'},
                                character2: {img: '/resources/icons/material.png', desc: 'Biography of Character 2'},
                                character3: {img: '/resources/icons/material.png', desc: 'Biography of Character 3'},
                            }
                            const data = chars[target.options[target.options.selectedIndex].value]
                            const img = new Image(100, 100)
                            img.src = data.img
                            rea.state.characterImage = img
                            rea.state.characterDescription = data.desc
                        },
                        onStart: async () => {
                            await switchController(Theater2DController.name)
                        }
                    })
                    wakeContent(rea.template);

                    // Default load
                    rea.state.onSelectCharacter({}, {options: {0: {value:"character1"}, selectedIndex: 0} })
                }
            },



            {
                title: 'Load game',
                onclick: async (payload) => {
                    const rea = ReactiveTemplate.renderStatic(HTML_LOAD,  {
                        onLoad: async () => {
                            await switchController(Theater2DController.name)
                        }
                    })
                    wakeContent(rea.template);
                }
            },



            {
                title: 'Settings',
                onclick: async (payload) => {
                    const settingsComponent = this.register.components.get('SettingsComponent')
                    wakeContent(settingsComponent.root);
                }
            },
        ];


        this.menulist.forEach(({title, onclick}, i) => {

            const el = Doom.create('div', {
                'class': 'menuitem pointer pop',
                'data-id': 'menu',
            }, title);

            el.onclick = (e) => onclick?.(e)
            this.elements['menulist'].appendChild(el);
        })


    }

}
