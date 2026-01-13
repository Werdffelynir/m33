import {IState} from "../../engine/IState.js";
import {STATUSES} from "../../engine/Register.js";

export class State extends IState {

    status =  STATUSES.VOID;

    ui = {
        title: 'Theater',
    };

    theater = {
        started: false,
        focus: null,
    };

    constructor(state) {
        super(state);
    }
}
