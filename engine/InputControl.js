
export class InputControl {

    /** @type {Register|*} */
    register;
    /** @type {InputControlManager} */
    manager;

    setup(event) {}

    onWheel(event) {}

    onKeypress(event) {}

    eventHandlers = new Map();

    // Can use: left right click dblclick wheel mousedown mousemove mouseup contextmenu
    //  If {InputControlManager.eventsNames} consists parameter
    addMouseListener(eventName, callback) {
        this.eventHandlers.set(eventName, callback);
    }

}
