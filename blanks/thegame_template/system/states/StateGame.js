import {IState} from "engine/IState.js";
import {STATUSES} from "engine/Register.js";




export const GAME_PHASE = {
    idle: 'idle',
    paused: 'paused',
    gameplay: 'gameplay',
}

export class StateGame extends IState {

    status =  STATUSES.VOID;

    game = {
        phase: GAME_PHASE.idle,
    };


}
