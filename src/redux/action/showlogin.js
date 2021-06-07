import {SHOWLOGIN, COLSELOGIN} from "./allConstValue";

export function showlogin() {
    return ({
        type : SHOWLOGIN,
    });
}

export function closelogin() {
    return ({
        type : COLSELOGIN,
    });
}