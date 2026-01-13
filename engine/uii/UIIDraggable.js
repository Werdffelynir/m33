import {Ut} from "../Ut.js";
import {Temporary} from "../utils/Temporary.js";



export class UIIDraggable {

    constructor(uiie) {
        this.uiie = uiie;
        this.isDragging = false;
        this.isDraggable = uiie?.props?.draggable || false;
        this.draggableElement = uiie.element;
        this.draggableCallbacks = new Set();
        this.shiftX = 0;
        this.shiftY = 0;
        this._bindDraggableEvents();

        if (uiie?.props?.ondrag && typeof uiie.props.ondrag === 'function' ) {
            this.draggableCallbacks.add(uiie.props.ondrag);
        }
    }

    _bindDraggableEvents () {

        this._dragMousemove = (e) => {
            if (!this.isDragging) return;

            let x = e.clientX - this.shiftX;
            let y = e.clientY - this.shiftY;

            this.draggableCallbacks.forEach((callback) => callback({x, y}))

            this.uiie.x = x;
            this.uiie.y = y;
        };

        this._dragMouseout = (e) => {
            this.isDragging = false;
            this.destroy();
        };

        this._dragMousedown = (e) => {
            if(!this.isDraggable) return;
            this.isDragging = true;

            this.shiftX = (e.clientX - this.uiie.x);
            this.shiftY = (e.clientY - this.uiie.y);

            document.addEventListener('mousemove', this._dragMousemove);
            document.addEventListener('mouseup', this._dragMouseout);
        }
    }

    destroy () {
        document.removeEventListener('mousemove', this._dragMousemove);
        document.removeEventListener('mouseup', this._dragMouseout);
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

        this.draggableElement.addEventListener('mousedown', this._dragMousedown)

        if (Ut.isFunction(callback))
            this.draggableCallbacks.add(callback);
    }
}

/*
        const pos = Doom.position(template);
        const dragger = new UIIDraggable({
            x: pos.x,
            y: pos.y,
            draggable: true,
            element: template,
        });

        dragger.drag(holder, (left, top) => {
            console.log('dragger.drag', left, top)
            this.setPosition(name, left, top);
        });

        console.log()
        console.dir(dragger)

* */



