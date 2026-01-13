import {Screen} from "../../engine/Screen.js";
import {Theater2DComponent} from "../components/theater2D/Theater2DComponent.js";



export class Theater2DScreen extends Screen {
    create() {
        super.create()

        this.component = this.register.component('Theater2DComponent');
        this.component.parent = this.root
        this.component.mount()
    }

    async change(params) {
        await super.change(params);
    }

    attach(parent) {
        if (this.component.children.get('sandbox').isPlaying) {}
        return super.attach(parent);
    }
    detach(parent) {
        if (this.component.children.get('sandbox').isPlaying) {
            this.component.children.get('sandbox').state.started = false;
        }

        return super.detach(parent);
    }

}

