import {Screen} from "../../engine/Screen.js";
import {PageComponent} from "../components/index/PageComponent.js";
import {STATUSES} from "../../engine/Register.js";


export class IndexScreen extends Screen {

    create() {
        super.create()

        this.page = new PageComponent(this.register, {
            parent: this.root
        });
    }

    setup(params) {
    }

    render({parent, root}) {
    }

    async change(params) {
        this.page.mount()

        this.register.setState('status', STATUSES.READY);
    }

    destroy() {
        super.destroy();

        this.page.unmount()
    }
}
