import {Register} from "../engine/Register.js";
import {IndexComponent} from "./components/index/IndexComponent.js";
import {DefaultComponent} from "./components/DefaultComponent.js";


const config = {
    seed: 'specialWord',
    viewsPath: './views',
    pluginsPath: './plugins',
    pluginsList: [],
}
const state = {}
const register = new Register({config, state});
register.registerModules({});
register.registerComponents({
    DefaultComponent: new DefaultComponent(register),
});

register.setup()

const indexComponent = new IndexComponent(register);

indexComponent.mount(register.rootScreenElement)

