import {SETSOCKET, DELSOCKET} from "../allConstValue";

function setsocket(state = null, action) {
    switch (action.type) {
        case SETSOCKET :
            return action.socket;
        case DELSOCKET:
            return null;
        default : return state;
    }
}

export default setsocket