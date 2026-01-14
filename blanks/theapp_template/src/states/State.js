import {IState} from "../../engine/IState.js";
import {SPECTACLE_STATUS} from "../../engine/Spectacle.js";


export class State extends IState {

    status =  SPECTACLE_STATUS.VOID;

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
