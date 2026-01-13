import {Ut} from "../Ut.js";
import {Doom} from "../utils/Doom.js";
import {UIIElement} from "./UIIElement.js";


export class UIIText extends UIIElement {
    constructor(uii, key, props) {
        super(uii, key, {
            ...{width: 100}, ...props
        });
        this.type = 'text';
        this.props.cssClasses =  [...['UII', 'UIIText'], ...props?.cssClasses || []];
        this.element = super.create();
    }

    append(data) {
        if (Ut.isNode(data)) {
            return this.element.appendChild(data);
        }

        if (!Ut.isString(data)) {
            console.warn(`{UIIText.append} parameter - data of invalid type`)
            return;
        }

        if (Ut.isHTMLString(data)) {
            this.element.innerHTML = data;
        } else {
            return this.element.appendChild(document.createTextNode(data));
        }
    }

    clean() {
        this.element.textContent = ''
    }

    cleanString(dataString = '') {
        return dataString
            .replace(/[^\S\r\n]+/g, ' ')
            .replace(/[^\x20-\x7E\n\r]/g, '')
            .replace(/ +\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    cleanStringLine(dataString = '') {
        return dataString
            .replace(/[^\S\r\n]+/g, ' ')
            .replace(/[^\x20-\x7E\n\r]/g, '')
            .trim();
    }

    getContent() {
        return this.element.textContent
    }

    setContent(data, append = false) {
        this.element.textContent = append ? (this.element.textContent + data) : data
    }

    setHTML(data, append = false) {
        if (append) {
            this.append(Doom.create('div', {}, data).firstElementChild);
        } else {
            this.element.innerHTML = data
        }
    }

}

/*
        container = this.decorate(container);
        const element = container.element;
        const props = container.props;
        element.autocomplete = false;
        element.spellcheck = false

        container.inject = function (element, append = 'append') {
            // this.element.appendChild(element)
            Doom.inject(element, append, this.element)

        };
        container.clean = function () {
            this.element.textContent = ''
        };
        container.getText = function () {
            return this.element.textContent
        };
        container.setText = function (data, append = false) {
            this.element.textContent = append ? (this.element.textContent + data) : data;
        };
        container.setHTML = function (data, append = false) {
            if (append) {

                this.append(Doom.create('div', {}, data).firstElementChild);

                //let _div = document.createElement('div');
                //_div.innerHTML = data;
                // this.append(_div.firstElementChild)
            } else {
                this.element.innerHTML = data
            }
        };
        container.enableEditable () {
            element.setAttribute('contenteditable', 'true');

            element.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                document.execCommand('insertText', false, text);
            });
            element.addEventListener('copy', (e) => {
                const selection = window.getSelection();
                const text = selection.toString();
                e.clipboardData.setData('text/plain', text);
                e.preventDefault();
            });

        };
        return container;*/




