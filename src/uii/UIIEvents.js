/**
 * Bus event "uii:click:[data-id]"
 * Bus event "uii:dblclick:[data-id]"
 * Bus event "uii:contextmenu:[data-id]"
 */
export class UIIEvents {
    /**
     * @property {EventBus} eventBus
     * */
    constructor(uii, props) {
        this.eventBus = uii.eventBus;
        this.element = uii.parent;
        this.prefix = uii.prefix || 'action';
        this._bused = new Set();

        this._bindEvents();
    }

    publishMouseEvent(event, eventName = 'click', params = {}) {
        const eventBus = this.eventBus;
        const target = event.target.closest(`[data-${this.prefix}]`);

        if (this._bused.has(target) || !target || !eventBus)
            return target;

        const data = target.dataset[this.prefix];

        eventBus.publish(`uii:${eventName}:${data}`, {target, data, event});

        this._bused.add(target)
    }

    _bindEvents() {
        this._onclick = (e) => {
            this.publishMouseEvent(e, 'click');
        };
        this._dblclick = (e) => {
            this.publishMouseEvent(e, 'dblclick')
        };
        this._contextmenu = (e) => {
            // e.preventDefault(); // todo
            this.publishMouseEvent(e, 'contextmenu');
            return false;
        };


        this.element.addEventListener('click', this._onclick);
        this.element.addEventListener('dblclick', this._dblclick);
        this.element.addEventListener('contextmenu', this._contextmenu, false);
    }

    destroy() {
        this.element.removeEventListener('click', this._onclick);
        this.element.removeEventListener('dblclick', this._dblclick);
        this.element.removeEventListener('contextmenu', this._contextmenu, false);
    }

}




