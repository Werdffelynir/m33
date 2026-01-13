import {Ut} from "../Ut.js";


/**
 * todo
 * ```
 * new Draggable ({
 *      draggable: true,
 *      element: element,
 *      ondrag: ({x, y}) => {},
 * })
 *
 * this.dnd = new Draggable({
 *     draggable: true,
 *     element: this.root,
 *     elementHolder: this.elements['holder'],
 *     ondrag: ({x, y}) => {
 *         console.log(x, y)
 *     },
 * })
 * this.dnd.draggable = true
 * ```
 */
export class Draggable {

    constructor(props) {
        this.isDraggable = props?.draggable || false;
        this.draggableElement = props.element;
        this.elementHolder = props?.elementHolder ?? this.draggableElement;

        this.x = 0;
        this.y = 0;
        this.shiftX = 0;
        this.shiftY = 0;
        this._isDragging = false;
        this._draggableCallbacks = new Set();
        this._bindDraggableEvents();

        if (props?.ondrag && typeof props.ondrag === 'function' ) {
            this._draggableCallbacks.add(props.ondrag);
        }

        this.draggable = this.isDraggable;
    }
    moveTo (x, y) {
        this.x = x; this.y = y;
    }
    _bindDraggableEvents () {

        this._dragMousemove = (e) => {
            if (!this._isDragging) return;

            let x = e.clientX - this.shiftX;
            let y = e.clientY - this.shiftY;

            this._draggableCallbacks.forEach((callback) => callback({x, y}))

            this.moveTo(x, y)
        };

        this._dragMouseout = (e) => {
            this._isDragging = false;
            this.destroy();
        };

        this._dragMousedown = (e) => {
            if(!this.isDraggable) return;
            this._isDragging = true;

            this.shiftX = (e.clientX - this.x);
            this.shiftY = (e.clientY - this.y);

            document.addEventListener('pointermove', this._dragMousemove);
            document.addEventListener('pointerup', this._dragMouseout);
        }
    }

    destroy () {
        document.removeEventListener('pointermove', this._dragMousemove);
        document.removeEventListener('pointerup', this._dragMouseout);

    }

    get draggable() {
        return !!this.isDraggable;
    }

    set draggable(value) {
        this.isDraggable = !!value;

        this.drag();
    }

    drag (element, callback) {

        if (element)
            this.draggableElement = element

        if (!this.isDraggable) {
            this.destroy();
            return;
        }

        this.shiftX = 0;
        this.shiftY = 0;

        this.draggableElement.addEventListener('pointerdown', this._dragMousedown)

        if (Ut.isFunction(callback))
            this._draggableCallbacks.add(callback);
    }
}


