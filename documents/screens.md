


# Basic
```js

class Example_0_Screen  extends Screen {
    constructor(register) {
        super(register);
    }

    change(params) {
        this.state = params.state;

        const tplMain = ReactiveTemplateYAML.renderStatic(``);

        this.append(tplMain.template)
    }
}

class Example_1_Screen extends Screen {

    async change(params) {
        this.replace(this.createTemplate(`<h1>Game Started</h1>`));
    }

    regulate() {
        GLog('Regulating screen layout...');
    }

    destroy() {
        super.destroy();
        // додаткове очищення
    }

    createTemplate(html = '') {
        const container = document.createElement('div');
        container.innerHTML = html.trim();
        return container.firstElementChild;
    }
}

class Example_2_Screen extends Screen {

    regulate() {
        GLog('Regulating screen layout...');
    }
    create() {
        GLog('Regulating screen layout...');
    }

    async render() {
        this.rcom.mount(this.root);
        console.log(`[${this.constructor.name}.render]`,  )
    }

    async change(params) {
        await super.change();
        console.log(`[${this.constructor.name}.change]`,)
    }

    destroy() {
        super.destroy();
        this.rcom.unmount();
    }
}

```




## Basic Screen
```js
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
    async change(params) {
        this.state = params.state;

        const tplMain = ReactiveTemplateYAML.renderStatic(`div: "Hello ${this.constructor.name}"`);

        this.append(tplMain.template)
    }

    bindEvents() {
    }

    setup(params) {
    }

    render({parent, root}) {
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





```

```js

const ScreenView = `
div:
  div.fillScreen.back[data-id=back]:
  div.canvases.fillScreen[data-id=canvases]:
`;
export class GameScreen extends Screen {

    constructor(register) {
        super(register);

    }

    render(){

        this.reactt = ReactiveTemplateYAML.renderStatic(ScreenView);
        this.root = this.reactt.template;

        this.register.layers.each((layer) => {
            this.reactt.elements.canvases.append(layer.canvas)
        })
    }

    async change({layers}) {
    }
}

```












## Simple Reactive Screen

```js

const ScreenView = `
div:
  div.fillScreen.back[data-id=back]:
  div.canvases.fillScreen[data-id=canvases]:
`;
export class GameScreen extends Screen {

    constructor(register) {
        super(register);

    }

    create() {
        this.react = ReactiveTemplateYAML.renderStatic(ScreenView);
        this.root = this.react.template;
    }

    render(){
        // 
    }

    async change(props) {
        
    }
}


```





```js
const DemoScreenTpl = `
div#ReaComponentReaComponent:
  div.title: "Title"
  div.content: "Content"
`;

export class DemoScreen extends Screen {
    // root = document.createElement('div');
    setup() {
        // add custom reactive template copmonent 
        const react = Ut.reactiveYAML(DemoScreenTpl, { });
        this.state = react.state
        react.state.title = this.constructor.name;
        react.state.content = 'Hello my Screen';

        this.append(react.template)
        // this.replace(react.template)

        console.log(`[${this.constructor.name}.setup]` )
    }
    render() {
        // with await super.render();
        // this.append([HTMLElement]) / this.replace([HTMLElement])
        
        // without await super.render();
        // this.root = [HTMLElement]
        console.log(`[${this.constructor.name}.render]` )
    }
    async change(params) {
        await super.change();
        console.log(`[${this.constructor.name}.change]`, params)
        
        react.state.content = params?.data || 'Default data'
    }
    destroy() {
        super.destroy();
    }
}
```





```js


const DemoScreenTpl = `
div#DemoScreen_box:
  div.DemoScreen_header:
    h1: "Demo: {{screen}}"
    h2: "{{controller}}"
  div#action:
    div:
      span.inline-block.width-50px: "{{game.fuel}}"
      span: "fuel"
    div:
      span.inline-block.width-50px: "{{game.battery}}"
      span: "battery"
    div:
      span.inline-block.width-50px: "{{game.hull}}"
      span: "hull"
    div:
      span.inline-block.width-50px: "{{game.shield}}"
      span: "shield"
`;

export class DemoScreen extends Screen {
    // root = document.createDocumentFragment();

    setup() {
        const react = Ut.reactiveYAML(DemoScreenTpl, {
            game: {
                engineOn: 'false',
                fuel: 88.3,
                battery: 78,
                hull: 95,
                shield: 80,
                throttle: 0,
                vx: 0,
                vy: 0,
                x: 2123.4,
                y: 894.2,
                temperature: 34,
                power: {shield: false, weapon: false, nav: true, lifeSupport: true},
                name: 'PL-001 Voyager',
                id: 'abc-1234',
                log: [],
                logs: '',
            }
        });
        this.state = react.state
        react.state.screen = this.constructor.name;
        react.state.controller = 'Vessel values';

        this.append(react.template)
        // this.replace(react.template)

        console.log(`[${this.constructor.name}.setup]` )
    }
    render() {
        // with await super.render();
        // this.append([HTMLElement])
        // this.replace([HTMLElement])

        // without await super.render();
        // this.root = [HTMLElement]
    }

    async change(params) {
        await super.change(params);
        console.log(`[${this.constructor.name}.change]`)

        this.timer = timer(() => {
            this.state.game.fuel = (parseFloat(this.state.game.fuel) - 0.08).toFixed(2)
            this.state.game.battery = (parseFloat(this.state.game.battery) - 0.12).toFixed(2)
            this.state.game.hull = (parseFloat(this.state.game.hull) - 0.02).toFixed(2)
            this.state.game.shield = (parseFloat(this.state.game.shield) - 0.16).toFixed(2)
        }, 800)
        
        this.timer.start()
    }

    destroy() {
        super.destroy();
        this.timer.stop()
    }
}

export class DemoController extends Controller {
    async init(params) {
        await super.init();

        await this.register.screenManager.change('DemoScreen');
    }
    async setup() {
        super.setup();
    }
    destroy() {
        super.destroy();
    }
}

```




```js

const DemoCockpitTpl = `
div#DemoScreen_box:
  div.DemoScreen_header:
    h1: "Demo: {{title}}"
    h3: "{{game.name}} {{game.id}}"
  div#action.table:
    span.width-50:
      div: ""
      div.button[data-click=engineSwitch]: "engineSwitch"
    span.width-50:
      div: ""
      div: "{{game.engineOn}}"
  div#action.uiDesktop.table:
    span.width-25:
      div.uiBorder: "{{game.power.shield}}"
      div.button.block[data-click=shield]: "shield"
    span.width-25:
      div.uiBorder: "{{game.power.weapon}}"
      div.button.block[data-click=weapon]: "weapon"
    span.width-25:
      div.uiBorder: "{{game.power.nav}}"
      div.button.block[data-click=nav]: "nav"
    span.width-25:
      div.uiBorder: "{{game.power.lifeSupport}}"
      div.button.block[data-click=lifeSupport]: "lifeSupport"
  div#logs:
    div.uiBorder:
      pre: "{{game.logs}}"
`;
export class DemoTruckScreen extends Screen {

    rcom = new ReaComponent({}, {
        state: {
            title: 'ReaComponent',
            game: {
                engineOn: 'false',
                fuel: 88.3,
                battery: 78,
                hull: 95,
                shield: 80,
                throttle: 0,
                vx: 0,
                vy: 0,
                x: 2123.4,
                y: 894.2,
                temperature: 34,
                power: {shield: false, weapon: false, nav: true, lifeSupport: true},
                name: 'PL-001 Voyager',
                id: 'abc-1234',
                log: [],
                logs: '',
            }
        },
        parent: null,
        template: DemoCockpitTpl,
    })

    setup () {
        super.setup();
        const logger = () => {
            this.rcom.state.game.logs =  [...this.rcom.state.game.log].join('\n')
        }
        this.compPowerActions = ( {event, target, data, name} ) => {
            const re = this.rcom.state.game.power[data] === 'on' ? 'off' : 'on'
            this.rcom.react.setState('game.power.'+data, re);
            this.rcom.state.game.log.push(re === 'on' ? `Power ${data} activated`: `Power ${data} set ${re}`)
            logger();
        }
        this.compEngineActions = ( {event, target, data, name} ) => {
            const re = this.rcom.state.game.engineOn === 'on' ? 'off' : 'on'
            this.rcom.react.setState('game.engineOn', re)
            this.rcom.state.game.log.push(re === 'on' ? 'Engine online' : 'Engine offline')
            logger();
        }

        // not need unsubscribe if page reopened
        this.register.eventBus.subscribe('ui:click:lifeSupport', this.compPowerActions);
        this.register.eventBus.subscribe('ui:click:weapon', this.compPowerActions);
        this.register.eventBus.subscribe('ui:click:nav', this.compPowerActions);
        this.register.eventBus.subscribe('ui:click:shield', this.compPowerActions);
        this.register.eventBus.subscribe('ui:click:engineSwitch', this.compEngineActions);
    }

    async render() {
        this.rcom.mount(this.root);
        console.log(`[${this.constructor.name}.render]`,  )
    }

    async change(params) {
        await super.change();
        console.log(`[${this.constructor.name}.change]`,)
    }

    destroy() {
        super.destroy();
        this.rcom.unmount();
    }
}

export class DemoTruckController extends Controller {
    async init(params) {
        await super.init(params);
        await this.register.screenManager.change('DemoTruckScreen', params);
    }
    async setup() {
        super.setup();
    }
    destroy() {
        super.destroy();
    }
}

```













```js

```






