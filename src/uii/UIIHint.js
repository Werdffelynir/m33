import {Ut} from "../Ut.js";
import {Doom} from "../utils/Doom.js";
import {UIIBlock} from "./UIIBlock.js";


/**
 * ```
 * this.uii.create(UIIHint, 'hint_btn2', {
 *      parent: btn2.element,
 *      content: 'btn2',
 *      corner: 'bottom', // Default: bottom. Allowed: top, bottom, left, right
 *      width: 300,
 *      height: 100,
 *      offsetX: 0,
 *      offsetY: 0,
 *      delay: 500,
 *      enable: true,
 *      style: {},
 *  })
 * ```
 */
export class UIIHint extends UIIBlock {
    constructor(uii, key, props) {
        super(uii, key, props);
        if (!Ut.isNode(props.parent)) {
            throw new Error(`props.parent must have type HTMLElement`)
        }
        this.type = 'hint';
        this.props.cssClasses = ['UII', 'UIIHint'];
        this.props.offsetX = props.x || 0;
        this.props.offsetY = props.y || 0;
        this.props.delay = props?.delay || 1000;
        this.props.width = props?.width || 180;
        this.props.height = props?.height || 'auto';
        this.props.corner = props?.corner || 'bottom'; // top, bottom, left, right
        this.props.parent = props.parent || false;

        if (!Ut.isNode(this.props.parent))
            throw new Error(`UIIHint required parent node, set parameter {parent: HTMLNode}`);

        this.props.enable = props?.enable || true;
        this.props.active = false;

        this.element = super.create();
        this.createContentElement();
        this._bindHintEvent();
    }

    set enable(value) {
        this.props.enable = !!value
    }

    set delay(value) {
        this.props.delay = value
    }

    createContentElement() {
        this.css({
            // zIndex: 1000,
            position: 'fixed',
            // height: 'fit-content',
        });

        if (!this.props.active)
            this.hide();
    }

    // top, bottom, left, right | 0 10
    corner(cornerString, offsetX, offsetY) {
        const parentStat = Doom.position(this.props.parent)

        if (!offsetX) offsetX = this.props.offsetX;
        if (!offsetY) offsetY = this.props.offsetY;

        switch (cornerString) {
            case 'top':
                this.x = parentStat.left + offsetX;
                this.y = parentStat.top - this.height + offsetY;
                if (this.y < 0) {
                    this.y = -Math.abs(offsetY);
                }
                break;

            case 'bottom':
                this.x = parentStat.left + offsetX;
                this.y = parentStat.top + parentStat.height + offsetY;
                if (this.y + this.height > window.innerHeight) {
                    this.y = window.innerHeight - this.height - Math.abs(offsetY);
                }
                break;

            case 'left':
                this.x = parentStat.left - this.width + offsetX;
                this.y = parentStat.top + offsetY;
                if (this.x < 0) {
                    this.x = Math.abs(offsetX);
                }
                break;

            case 'right':
                this.x = parentStat.left + parentStat.width + offsetX;
                this.y = parentStat.top + offsetY;
                if (this.x + this.width > window.innerWidth) {
                    this.x = window.innerWidth - (this.width + Math.abs(offsetX));
                }
                break;
        }
    }

    _bindHintEvent() {
        this._timer = timer(() => {
            if (!this.props.active) {
                this.props.active = true;
                this.show();
                this.corner(this.props.corner);
            }
        }, this.props.delay);

        this._eventMouseover = (e) => {
            if (!this.props.enable) return;
            this.turnOn();
            // this._timer.stop();
            // this._timer.start();
            this.props.active = false;
            // console.log('show', this.element, this.statistic)
        };
        this._eventMouseout = (e) => {
            if (!this.props.enable) return;
            this.turnOff();
            // this._timer.stop();
            // this.hide();
            // console.log('hide')
        };

        this.props.parent.addEventListener('mouseover', this._eventMouseover, {capture: true});
        this.props.parent.addEventListener('mouseout', this._eventMouseout);
    }

    turnOff(){
        if (!this.props.enable) return;
        this._timer.stop();
        this.hide();
    }

    turnOn(){
        if (!this.props.enable) return;
        this._timer.stop();
        this._timer.start();
    }

    destroy() {
        super.destroy();
        this._timer.stop();
        this.props.parent.removeEventListener('mouseover', this._eventMouseover, {capture: true});
        this.props.parent.removeEventListener('mouseout', this._eventMouseout);
    }

    content(data, x = null, y = null) {
        this.html = this.props.content = data;

        if (x) this.x = x;
        if (y) this.y = y;
    }

}




