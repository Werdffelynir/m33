

```js
class DefaultComponent extends ReaComponent {
    installed = false;
    create() {
        if (this.installed) return
        this.installed = true
        this.bus = new EventBus()
        this.name = this.constructor.name

        super.create({
            template: HTML,
            css: CSS,
            state: {title: 'Theater 3D',},
        })
        this.elements.viewport.setAttribute('tabindex', '1')
        this.bus.busme(this.root, ['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu'])
    }
    constructor(register, props) {
        super(register, props);
        /**@type{Screen}*/ this.screen = props.screen;
        this.setup()
    }
    setup() {
        this.mount(
            this.screen.root
        )
    }

    hello(){
        console.log('hello')
    }
}
```




## ReaComponent

```js
DemoYAMLTemplate = `div.ReaComponent: "{{title}}" {{game.id}} - {{game.name}}`;

rcom = new ReaComponent({}, {
    state: {
        title: 'Vessel',
        game: {
            name: 'PL-001 Voyager',
            id: 'abc-1234',
            fuel: 82.6,
        }
    },
    parent: null,
    template: DemoYAMLTemplate,
})

// set new state
rcom.react.setState('game.fuel', String(fuel));

// increment
rcom.state.game.fuel = (parseFloat(this.state.game.fuel) - 0.08).toFixed(2)
```














```js
class BlankComponent extends ReaComponent {
    constructor(register, props = { state, template, parent, root }) {
        super(register, props);
    }
    create({template, state}) {
        super.create({template, state})
    }
    setup() {
        if (this._installed) return;
        this._installed = true;
        // code
    }
    render() {  }
    update() {  }
    mount(parent) {
        super.mount(parent)
    }
    unmount(parent) {
        super.unmount(parent)
    }
    onMount() { }
    onUnmount() { }
}
bc = BlankComponent(register, {
    state:{},  
    template: ShipStatusTemplate,  
    parent: HTMLElement,           
    root: null|HTMLElement,
});

bc.mount()
```




```js
class HealthBar extends ReaComponent {
    render() {
        this.root.textContent = `HP: ${this.state.hp}`;
    }
    onMount() {
        this.bind('hp', () => this.update());
        this.render();
    }
}
HealthBar(register, {state:{hp: 100}})
```














```js
export class ShipStatusReaComponent extends ReaComponent {
    setup() {
        this.bind('hull', () => this.update());
        this.bind('shield', () => this.update());
    }

    create(params) {
        const el = document.createElement('div');
        el.innerHTML = `<p class="hull"></p><p class="shield"></p>`;
        this.root = el;
    }

    render() {
        this.root.querySelector('.hull').textContent = `Hull: ${this.state.hull}`;
        this.root.querySelector('.shield').textContent = `Shield: ${this.state.shield}`;
    }
}

ShipStatusState = {shield: null, hull: null}
ShipStatusTemplate = `
div.component: "My Component"
  div.line:
    div.hull: "hull" 
  div.line:
    div.shield: "shield" 
`
ShipStatusReaComponent(register, {
    template: ShipStatusTemplate,
    parent: null|HTMLElement,
    root: null|HTMLElement,
    state: ShipStatusState,
})
```











```js

```