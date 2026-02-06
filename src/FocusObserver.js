/**
 * ```
 *
 * const canvases = document.querySelectorAll("canvas");
 * const state = { focus: null };
 *
 * const eventBus = {
 *     _events: {},
 *     on(event, cb) {
 *         (this._events[event] ||= []).push(cb);
 *     },
 *     emit(event, data) {
 *         (this._events[event] || []).forEach(cb => cb(data));
 *     }
 * };
 *
 * const observer = new FocusObserver(elements, eventBus, state);
 *
 * eventBus.subscribe("element:focus", (canvas) => {
 *     console.log("Focus on canvas:", canvas.id);
 * });
 *
 * eventBus.subscribe("element:blur", (canvas) => {
 *     console.log("Blur on canvas:", canvas.id);
 * });
 *
 * mapped = Map( [ [element: DATA], ... ])
 * ```
 */
export class FocusObserver {
    constructor({elements= [], mapped, eventBus, state, onfocusin, onfocusout} = {}) {
        /**@type {EventBus} */
        this.eventBus = eventBus
        this.onfocusin = onfocusin
        this.onfocusout = onfocusout
        this.focusElement = null
        this.state = state ?? {focus: null}

        this.mapped = mapped ?? new Map()

        this.bindEvents();
        this.init();
    }
    bindEvents(){
        this._handleFocus =  (e) => this._handle(e, true);
        this._handleBlur =  (e) => this._handle(e, false);
    }

    init() {
        const elements = [...this.mapped.keys()]

        elements.forEach(element => {
            this.setElement(element, this.mapped.get(element));
        });
    }
    setFocus(element){
        this.focusElement = element
        this.state.focus = element
    }

    setElement(element, data) {
        if (!this.mapped.has(element))
            this.mapped.set(element, data);

        if (!element.hasAttribute("tabindex")) {
            element.setAttribute("tabindex", "0");
        }

        element.addEventListener("focus",  (e) => this._handle(e, true));
        element.addEventListener("blur", (e) => this._handle(e, false));
    }

    getElement(searchedData) {
        for (const [element, payload] in Object.entries(this.mapped)) {
            if (searchedData === payload)
                return element;
        }
    }
    destroy() {
        [...this.mapped.keys()].forEach(element => {
            element.removeEventListener("focus",this._handleFocus);
            element.removeEventListener("blur", this._handleBlur);
        });
    }

    _handle (event, infocus) {
        if (infocus) {
            const element = event.target
            const prev = this.focusElement

            let pubdata = {
                type: 'focus',
                element: element,
                prev: prev,
                data: this.mapped.get(element),
            };

            this.setFocus(element)

            if (this.onfocusin)
                this.onfocusin(pubdata)

            this.eventBus?.publish("element:focus", pubdata)

        } else {
            const element = event.target
            const prev = this.focusElement

            if (this.focusElement === element) {
                let pubdata = {
                    type: 'blur',
                    element: null,
                    prev: prev,
                    data: this.mapped.get(element),
                }

                this.setFocus(null)

                if (this.onfocusout)
                    this.onfocusout(pubdata)

                this.eventBus?.publish("element:blur", pubdata)
            }
        }
    }

}

