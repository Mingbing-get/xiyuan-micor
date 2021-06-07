import {SHOWLOGIN, COLSELOGIN} from "../action/allConstValue";

function showlogin(state = false, action) {
    switch (action.type) {
        case SHOWLOGIN :
            return true;
        case COLSELOGIN:
            return false;
        default : return state;
    }
}

export default showlogin