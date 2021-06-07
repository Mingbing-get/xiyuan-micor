import {LOGIN, LOGOUT} from "../allConstValue";

export function login(user) {
    return ({
        type : LOGIN,
        user
    });
}

export function logout() {
    return ({
        type : LOGOUT,
    });
}