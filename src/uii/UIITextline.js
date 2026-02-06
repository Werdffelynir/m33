import {UIIMultitext} from "./UIIMultitext.js";

/**
 * ```
 * this.ui108 = new UIITextline( uii, 'ui108', {
 *     x: 0,
 *     y: 0,
 *     width: 350,
 *     content: 'UIITextline a tool for content creation',
 *     max: 30,
 *
 *     editable: true,
 * })
 * ```
 */
export class UIITextline extends UIIMultitext {

    constructor(uii, key, props) {
        super(uii, key, props);

        this.width = props?.width || 180;
        this.height = props?.height || 30;
        this.props.min = props?.min || 0;

        this.type = 'textline';
        this.props.cssClasses = [...['UII', 'UIITextline', 'UIIInput'], ...props?.cssClasses || []];
       //  this.element = super.create();

        this._eventInputEnterDisable = (e) => {
            if (e.key === "Enter" || e.inputType === "insertParagraph") {
                e.preventDefault();
            }
        }
        this._bindTextlineEvents();
    }

    cleanString(dataString) {
        return this.cleanStringLine(dataString)
    }

    _bindTextlineEvents() {
        this.element.addEventListener("keydown", this._eventInputEnterDisable);
        this.element.addEventListener("beforeinput", this._eventInputEnterDisable);
    }

    destroy() {
        super.destroy();

        this.element.removeEventListener("keydown", this._eventInputEnterDisable);
        this.element.removeEventListener("beforeinput", this._eventInputEnterDisable);
    }
}





