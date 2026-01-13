import {Screen} from "engine/Screen.js";



export class Theater3DScreen extends Screen {
    create() {
        super.create()

        this.component = this.register.component('Theater3DComponent');
        this.component.parent = this.root
        this.component.mount()
    }

    async change(params) {
        await super.change(params);
    }

}

