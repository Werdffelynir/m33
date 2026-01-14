import {Screen} from "engine/Screen.js";
import {StartpageComponent} from "../components/index/StartpageComponent.js";


export class IndexScreen extends Screen {

    create() {
        super.create()

        this.page = new StartpageComponent(this.register, {
            parent: this.root
        });
    }

    setup(params) {
    }

    render({parent, root}) {
    }

    async change(params) {
        this.page.mount()
    }

    destroy() {
        super.destroy();

        this.page.unmount()
    }
}
