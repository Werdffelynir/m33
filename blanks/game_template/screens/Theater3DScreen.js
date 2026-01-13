import {Screen} from "engine/Screen.js";



export class Theater3DScreen extends Screen {
    create() {
        super.create()

        /**
         * @type {Theater3DComponent}
         */
        this.component = this.register.component('Theater3DComponent');
        this.component.parent = this.root
    }

    async change(params) {
        await super.change(params);

        if(this.component.isMounted) this.component.unmount()
        this.component.mount()
    }

    detach(parent) {
        super.detach(parent);

        this.component.unmount()
    }

}

