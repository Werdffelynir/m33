


# Simple example
```js

export class IndexScreen extends Screen {
    create() {
        super.create()
        this.page = this.register.components.get("StartpageComponent")
        this.page.parent = this.root
    }

    setup(propsS) {
    }

    render({parent, root}) {

    }

    async change(paramS) {
        this.page.mount()
    }

    destroy() {
        super.destroy();

        if (this.page.isMounted) this.page.unmount()
    }
}



export class IndexController extends Controller {
    async setup(propsC = {}) {}

    async init(paramC = {}) {

        await this.changeScreen(IndexScreen.name, paramS);
    }

    destroy() {

    }

    route(use) {

    }
}


register.registerScreens({
    IndexScreen: new IndexScreen(register, propsS),
});

register.registerControllers({
    IndexController: new IndexController(register, propsC),
});

register.switchController('IndexController', paramC);
```



# Other varius
```js
const register = new Register({config, state})

export class DeadendScreen extends Screen {}

export class DeadendController extends Controller {
    async setup() {
        super.setup();
        // call once
    }
    async init(params) {
        await super.init();
        // calls every time when switchController

        const screen = this.register.screenManager.get('DeadendScreen');
        const view = Doom.create('div', {'class': 'fillScreen'}, `<h1 class="center">Dead End</h1>`)
        screen.root.appendChild(view)

        await this.register.screenManager.change('DeadendScreen', paramsScreen);
    }
    destroy() {
        super.destroy();
    }
}



register.registerScreens({
    DeadendScreen: new DeadendScreen(register),
});

register.registerControllers({
    DeadendController: new DeadendController(register),
});

register.switchController('DeadendController', params);
```





```js

```
