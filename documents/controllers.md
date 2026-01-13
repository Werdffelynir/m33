




```js
const register = new Register({config, state})

export class DeadendScreen extends Screen {}

export class DeadendController extends Controller {
    async setup() {
        super.setup();
    }
    async init(paramsController) {
        await super.init();

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

register.switchController('DeadendController', paramsController);
```





```js

```





```js

```





```js

```





```js

```
