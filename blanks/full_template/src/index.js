import {Application} from "./Application.js";
import {NotifyComponent} from "./components/NotifyComponent.js";
import {EscMenuComponent} from "./components/EscMenuComponent.js";
import {ExampleController} from "./controllers/ExampleController.js";
import {ExampleScreen} from "./screens/ExampleScreen.js";
import {IndexController} from "./controllers/IndexController.js";
import {IndexScreen} from "./screens/IndexScreen.js";
import {FocusModule} from "./modules/FocusModule.js";
import {DrawModule} from "./modules/DrawModule.js";
import {Theater2DComponent} from "./components/theater2D/Theater2DComponent.js";
import {Theater2DScreen} from "./screens/Theater2DScreen.js";
import {Theater2DController} from "./controllers/Theater2DController.js";
import {Theater3DController} from "./controllers/Theater3DController.js";
import {Theater3DScreen} from "./screens/Theater3DScreen.js";
import {Theater3DComponent} from "./components/theater3D/Theater3DComponent.js";

const app = new Application();

app.registerModules({
    FocusModule: new FocusModule(app),
    DrawModule: new DrawModule(app),
});

app.registerComponents({
    NotifyComponent: new NotifyComponent(app),
    EscMenuComponent: new EscMenuComponent(app),
    Theater2DComponent: new Theater2DComponent(app),
    Theater3DComponent: new Theater3DComponent(app),
});

app.registerControllers({
    IndexController: new IndexController(app),
    ExampleController: new ExampleController(app),
    Theater2DController: new Theater2DController(app),
    Theater3DController: new Theater3DController(app),
});

app.registerScreens({
    IndexScreen: new IndexScreen(app),
    Theater2DScreen: new Theater2DScreen(app),
    Theater3DScreen: new Theater3DScreen(app),
    ExampleScreen: new ExampleScreen(app),
});

await app.setup();
