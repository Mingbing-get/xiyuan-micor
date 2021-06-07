import {SETNOREAD, DELNOREAD} from "../action/allConstValue.js";

function setsocket(state = 0, action) {
    switch (action.type) {
        case SETNOREAD :
            return state+action.noread;
        case DELNOREAD:
            return 0;
        default : return state;
    }
}

export default setsocket