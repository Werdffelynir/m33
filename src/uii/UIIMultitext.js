import {UIIText} from "./UIIText.js";

/**
 * ```
 * ui108 = new UIIMultitext( uii, 'ui108', {
 *     x: 0,
 *     y: 0,
 *     width: 190,
 *     height: 190,
 *     content: 'Multitext a tool for content creation',
 *     editable: true,
 *     max: 0,
 *     cssClasses: [],
 * })
 * ```
 */
export class UIIMultitext extends UIIText {
    constructor(uii, key, props) {
        super(uii, key, props);

        this.width = props?.width || 180;
        this.height = props?.height || 70;

        // todo: optimize!
        let text = this.cleanString(typeof this.props.content === "string" ? this.props.content : '');
        if (this.props.max > 0 && this.props.content.length > this.props.max) {
            text = text.slice(0, this.props.max);
            this.props.content = text;
        }

        this.type = 'multitext';
        this.props.cssClasses =  [...['UII', 'UIIMultitext', 'UIIInput'], ...props?.cssClasses || []];
        this.props.editable = false;
        this.props.max = props?.max || 0;
        this.element = super.create();

        this.eventsCopy = new Set();
        this.eventsPaste = new Set();
        this.eventsInput = new Set();
        this.eventsChange = new Set();
        this.eventsFocus = new Set();
        this.eventsBlur = new Set();

        this.editable = props?.editable;

        if (props?.onchange && typeof props.onchange === 'function') this.onChange(props.onchange)
    }

    set editable(value) {
        if (value) this._editableOn();
        else this._editableOff()
    }

    _editableOff() {
        this.props.editable = false;
        this.element.removeEventListener('focus', this._focus);
        this.element.removeEventListener('blur', this._blur);
        this.element.removeEventListener('paste', this._paste);
        this.element.removeEventListener('copy', this._copy);
        this.element.removeEventListener('input', this._input);

        this.element.removeAttribute('contenteditable');
    }

    _editableOn() {
        if (this.props.editable) {
            return;
        }
        this.props.editable = true;

        this.element.setAttribute('contenteditable', 'true');
        this.element.setAttribute('autocomplete', 'false');
        this.element.setAttribute('spellcheck', 'false');

        this._paste = (e) => {
            e.preventDefault();
            let text = (e.clipboardData || window.clipboardData).getData('text/plain');

            this.eventsPaste.forEach(callback => {
                const replaceText = callback(text, e)
                if (replaceText) {
                    text = replaceText;
                }
            });

            document.execCommand('insertText', false, text);
        }
        this._copy = (e) => {
            const selection = window.getSelection();
            let text = selection.toString();

            this.eventsCopy.forEach(callback => {
                const replaceText = callback(text, e)
                if (replaceText) {
                    text = replaceText;
                }
            });

            e.clipboardData.setData('text/plain', text);
            e.preventDefault();
        }
        this._input = (e) => {
            if (e.inputType !== "insertText") return;

            let textSymbol = e.data;

            let text = this.cleanString(this.content);

            if (this.props.max > 0 && this.content.length > this.props.max) {
                text = text.slice(0, this.props.max);
                this.content = text;
                this.setCursorAt(this.content.length);
            }

            this.eventsInput.forEach(callback => callback(e, textSymbol, text));
        }
        this._focus = (e) => {

            this.eventsFocus.forEach(callback => callback(e, e.target));
        }
        this._blur = (e) => {
            let text = this.cleanString(this.content);

            if (this.props.max > 0 && text.length > this.props.max) {
                text = text.slice(0, this.props.max)
            }

            if (this.props.content !== text) {
                this.props.content = text;

                this.eventsChange.forEach(callback => callback(e, text));
            }

            this.eventsBlur.forEach(callback => callback(e, e.target));
        }

        this.element.addEventListener('focus', this._focus);
        this.element.addEventListener('blur', this._blur);
        this.element.addEventListener('paste', this._paste);
        this.element.addEventListener('copy', this._copy);
        this.element.addEventListener('input', this._input);
    }

    onCopy(callback) {
        this.eventsCopy.add(callback)
    }

    onPaste(callback) {
        this.eventsPaste.add(callback)
    }

    onInput(callback) {
        this.eventsInput.add(callback)
    }

    onChange(callback) {
        this.eventsChange.add(callback)
    }

    onFocus(callback) {
        this.eventsFocus.add(callback)
    }

    onBlur(callback) {
        this.eventsBlur.add(callback)
    }

    setCursorAt(charIndex) {
        const node = this.element.firstChild;
        if (!node || node.nodeType !== 3) return;

        const range = document.createRange();
        const sel = window.getSelection();

        range.setStart(node, charIndex);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
    }

    turnOnLED() {
        this.classList.add('UIIInputLED')
    }

    turnOffLED() {
        this.classList.remove('UIIInputLED')
    }

    destroy() {
        super.destroy();
        super._editableOff();
    }
}





