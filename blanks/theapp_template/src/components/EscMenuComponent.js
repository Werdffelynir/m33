import {ReaComponent} from "engine/ReaComponent.js";
import {Doom} from "engine/utils/Doom.js";
import {IndexController} from "../controllers/IndexController.js";
import {ExampleController} from "../controllers/ExampleController.js";



const CSS = `

@import url('assets/cssme/transform.css') layer(transform);

@layer esc-menu-component {

    #EscMenuComponent {
        width: 100vw;
        height: 100vh;
        background-color: rgba(0,0,0,0.5);
        position: fixed;
        top:0;
        left:0;
    }
    #EscMenuComponent > *{
        color:  var(--cc4);
    }
    
    #EscMenuComponent .manuWin{
        width: 300px;
        height: fit-content;
        background-color: var(--cc14);
        border: 1px solid var(--cc8);
        margin: 15% calc(50% - 150px);
    }
    #EscMenuComponent .menuList{
    
    }
    #EscMenuComponent .menuList > div{
        text-align: center;
        cursor: pointer;
        padding: 4px;
        width: 100%;
        
        perspective-origin: 50% 100%;
    }
    #EscMenuComponent .button {
        font-family: var(--fontPlay), system-ui;
        font-weight: bold;
        font-size: 26px;
        height: 50px;
        padding: 0 15px;
        width: fit-content;
        align-content: center;
        transition: all 0.3s, transform 0.15s ease-in-out;
        transform: translateZ(10px); 
        z-index: 1;
    }
    #EscMenuComponent .button:active { background-color: var(--cc12); }
    #EscMenuComponent .button:hover { color: var(--cg4); }
    
    #EscMenuComponent .button:nth-child(2n):hover { 
        transform: rotateZ(1deg) rotateY(-2deg);
     }
    #EscMenuComponent .button:nth-child(2n+1):hover { 
        color: var(--cr8);
        transform: rotateZ(-2deg) rotateY(1deg);
    }
}
`;
const HTML = `
div
  div.manuWin
    div.menuList[data-id=menuList]
`;

export class EscMenuComponent extends ReaComponent {
    installed = false;

    constructor(register, props) {
        super(register, props);

    }

    create() {
        if (this.installed) return;
        this.installed = true;

        this.name = 'manu';

        super.create({
            template: HTML,
            css: CSS,
            state: {
                scene: null,
                actor: null,
            },
        });

        /**@type {UIManager} */
        this.uiman = this.register.uiman;

        const switchController = async (className) => {
            if (this.register.controman.current?.constructor?.name !== className) {
                await this.register.switchController(className)
            }
            this.hide();
        }

        this.menulist = [
            {
                title: 'Index (simple app)',
                onclick: async (payload) =>  await switchController(IndexController.name)
            },
            {
                title: 'Theater (2D Scene)',
                onclick: async (payload) => await switchController(IndexController.name)
            },
            {
                title: 'Hotkeys on focus layer',
                onclick: async (payload) => await switchController(ExampleController.name)
            },
            {
                title: 'Theater3D (2.5D)',
                onclick: async (payload) =>  await switchController(IndexController.name)
            },
        ];

        this.menulist.forEach((it, i) => {
            const el = Doom.create('div', {
                'class': 'button block tf',
                'data-click': 'btnMenu',
                'data-index': i,
            }, it.title);
            this.elements['menuList'].classList.add('tf-3d')
            this.elements['menuList'].appendChild(el);
        })

        this.bindEvent();
    }


    setup(name) {
        this.uiman.registerView(EscMenuComponent.name, this.root)

        this.uiman.uiclick(EscMenuComponent.name, 'btnMenu', ({target, event, click}) => {
            const _menu = this.menulist[target.dataset.index];
            _menu.onclick(_menu)
        })

    }

    show() {
        this.opened = true;
        this.uiman.show(EscMenuComponent.name)
    }

    hide() {
        this.opened = false;
        this.uiman.hide(EscMenuComponent.name)
    }

    toggle() {
        if (this.opened ) this.hide();
        else this.show();
    }

    bindEvent() {}

}