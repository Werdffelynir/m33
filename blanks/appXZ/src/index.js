import {Application} from "./Application.js";
import {IndexScreen} from "./screens/IndexScreen.js";
import {IndexController} from "./controllers/IndexController.js";
import {HUDModule} from "./modules/HUDModule.js";
import {EscMenuComponent} from "./components/EscMenuComponent.js";
import {NotifyComponent} from "./components/NotifyComponent.js";


window.GLogLevel = 6; // window.GLevelAppLow;


const app = new Application();

app.registerControllers({
    IndexController: new IndexController(app),
})

app.registerScreens({
    IndexScreen: new IndexScreen(app),
})

app.registerComponents({
    NotifyComponent: new NotifyComponent(app),
    EscMenuComponent: new EscMenuComponent(app),
})

app.registerModules({
    HUDModule: new HUDModule(app),
})

// Plugins installed in config.js

await app.setup();