import {SETNOREAD, DELNOREAD} from "./allConstValue.js";

export function setNoread(noread) {
    return ({
        type : SETNOREAD,
        noread
    });
}

export function delNoread() {
    return ({
        type : DELNOREAD,
    });
}