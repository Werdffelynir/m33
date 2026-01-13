import {IState} from "../../../engine/IState.js";
import {ReaComponent} from "../../../engine/ReaComponent.js";
import {LayerManager} from "../../../engine/LayerManager.js";
import {BasicSandboxComponent} from "./BasicSandboxComponent.js";


class PageState extends IState {

}

const CSS = `

@layer page {

    #PageComponent {
        --borderStyle: 3px solid color-mix(in srgb, var(--cc18), transparent  40%);
        
        position: absolute;
        width: 100vw;
        height: 100vh;
        
        .top{}
        .basement{
            align-content: end;
        }
        .left, .right{
            width: 300px;
        }
    }
    
}    
`;

const HTML = `
div
  div.top.text-center
    div[data-id=topmenu]
  div.container.table
    div.vtop.left
      div[data-id=sidebar-left]
    div.vtop.content
      div[data-id=central]
    div.vtop.right
      div[data-id=sidebar]
`;

export class PageComponent extends ReaComponent {
    installed = false;
    constructor(register, props) {
        super(register, props);
        this.screen = props.screen;
    }

    create() {
        if (this.installed) return;
        this.installed = true;

        this.name = this.constructor.name;
        this.children = new Map()

        super.create({
            template: HTML,
            css: CSS,
            state: new PageState({
                title: this.constructor.name,
            }),
        });

        this.children.set('sidebar-left', new LeftSidebarComponent(this.register, {
            parent: this.elements['sidebar-left'],
            state: this.state,
        }));
        this.children.set('sidebar', new SidebarComponent(this.register, {
            parent: this.elements['sidebar'],
            state: this.state,
        }));
        this.children.set('topmenu', new TopmenuComponent(this.register, {
            parent: this.elements['topmenu'],
            state: this.state,
        }));
        this.children.set('central', new BasicSandboxComponent(this.register, {
            parent: this.elements['central'],
            state: this.state,
        }));

    }
    onMount(){
        this.children.forEach(comp => comp.mount())
    }
    onUnmount(){
        this.children.forEach(comp => comp.unmount())
    }
}




const CSS_SIDEBAR = ``;
const HTML_SIDEBAR = `
div: "{{title}}"
  div[data-id=compos]
`;
class SidebarComponent extends ReaComponent {
    create() {
        this.name = this.constructor.name;
        this.children = new Map()

        super.create({
            template: HTML_SIDEBAR,
            css: CSS_SIDEBAR,
            state: {title: this.constructor.name}
        });

        this.children.set('fonts', new FontsComponent(this.register, {
            parent: this.elements['compos'],
        }));
        this.children.set('popups', new PopupsComponent(this.register, {
            parent: this.elements['compos'],
        }));
        this.children.set('inputs', new InputsComponent(this.register, {
            parent: this.elements['compos'],
        }));
        this.children.set('cssAnimation', new CssAnimationComponent(this.register, {
            parent: this.elements['compos'],
        }));
    }
    onMount(){
        this.children.forEach(comp => comp.mount())
    }
    onUnmount(){
        this.children.forEach(comp => comp.unmount())
    }
}


const CSS_TOPMENU = ``;
const HTML_TOPMENU = `
div: "{{title}}"
`;
class TopmenuComponent extends ReaComponent {
    create() {
        this.name = this.constructor.name;
        this.children = new Map()

        super.create({
            template: HTML_TOPMENU,
            css: CSS_TOPMENU,
            state: {...this.props.state, ...{title: this.constructor.name} },
        });
    }
}


const CSS_FONTS = ``;
const HTML_FONTS = `
div: "{{title}}"
`;
class FontsComponent extends ReaComponent {
    create() {
        this.name = this.constructor.name;
        this.children = new Map()

        super.create({
            template: HTML_FONTS,
            css: CSS_FONTS,
            state: {...this.props.state, ...{title: this.constructor.name} },
        });
    }
}


const CSS_POPUPS = ``;
const HTML_POPUPS = `
div: "{{title}}"
`;
class PopupsComponent extends ReaComponent {
    create() {
        this.name = this.constructor.name;
        this.children = new Map()

        super.create({
            template: HTML_POPUPS,
            css: CSS_POPUPS,
            state: {...this.props.state, ...{title: this.constructor.name} },
        });
    }
}


const CSS_INPUTS = ``;
const HTML_INPUTS = `
div: "{{title}}"
  div
    input[type=number][step=1]
`;
class InputsComponent extends ReaComponent {
    create() {
        this.name = this.constructor.name;
        this.children = new Map()

        super.create({
            template: HTML_INPUTS,
            css: CSS_INPUTS,
            state: {...this.props.state, ...{title: this.constructor.name} },
        });
    }
}


const CSS_CSS_ANIMATION = ``;
const HTML_CSS_ANIMATION = `
div: "{{title}}"
`;
class CssAnimationComponent extends ReaComponent {
    create() {
        this.name = this.constructor.name;
        this.children = new Map()

        super.create({
            template: HTML_CSS_ANIMATION,
            css: CSS_CSS_ANIMATION,
            state: {...this.props.state, ...{title: this.constructor.name} },
        });
    }
}






const CSS_LEFT_SIDEBAR = ``;
const HTML_LEFT_SIDEBAR = `
div: "{{title}}"
  div
    img.w200px[src=/resource/images/picture.png]
`;
class LeftSidebarComponent extends ReaComponent {
    create() {
        this.name = this.constructor.name;
        this.children = new Map()

        super.create({
            template: HTML_LEFT_SIDEBAR,
            css: CSS_LEFT_SIDEBAR,
            state: {...this.props.state, ...{title: this.constructor.name} },
        });
    }
}





/*                     EXAMPLES                       */

class StaticLayersComponent extends ReaComponent {
    create() {
        this.name = this.constructor.name;
        this.children = new Map()

        super.create({
            template: HTML_CENTRAL,
            css: CSS_CENTRAL,
            state: {...this.props.state, ...{title: this.constructor.name} },
        });

        this.layerman = new LayerManager(this.register);
        this.mouseman = {}// new MouseManager(this.register);

        this.layerman.configured({
            width: 800,
            height: 800,
            parent: this.elements['canvases'],
        })

        this.layerman.attach();
        this.layerman.bg = this.layerman.get('bg')
        this.layerman.game = this.layerman.get('game')
        this.layerman.ui = this.layerman.get('ui')

        this.layerman.game.ctx.fillStyle = '#52f67a'
        this.layerman.game.ctx.font = '36px Giger, Orpheus, system-ui '
        this.layerman.game.ctx.textAlign = 'center'
        this.layerman.game.ctx.fillText(`Hello my friend! Static layerman tails`,
            this.layerman.game.width/2, 200, 800);

        console.log(this.layerman.game)

    }

    onMount(){
        this.layerman.attach()
    }
    onUnmount(){
        this.layerman.detach()
    }
}


