import {Doom} from "../../engine/utils/Doom.js";
import {config} from "../config.js";
import {Storage} from "../../engine/utils/Storage.js";

export default {
    id: 'VersionInfoPlugin',

    /**
     *
     * @param register {Register|*}
     */
    setup(register) {
        this.register = register;
        // if (Storage.get('show_version') === 'none') return

        this.button = this.createButton();
        document.body.appendChild( this.button );
    },

    onClickButton() {
        this.button.remove();
        // Storage.set('show_version', 'none')
    },

    createButton() {
        const btn = document.createElement('button');
        Doom.css(btn, {
            position: 'absolute',
            padding: '10px',
            bottom: '10px',
            right: '10px',
            zIndex: '999',
            color: 'rgb(230 230 230 / 70%)',
            backgroundColor: 'rgb(0 0 0 / 50%)',
        });

        btn.textContent = `v ${config.version}`;
        btn.onclick = () => {
            this.onClickButton();
        };

        return btn;
    },

};
