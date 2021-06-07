import {LOGIN, LOGOUT} from "../action/allConstValue";

function login(state = {login:false}, action) {
    switch (action.type) {
        case LOGIN :
            return ({
                login:true,
                ...action.user
            });
        case LOGOUT:
            return {login:false};
        default : return state;
    }
}

export default login