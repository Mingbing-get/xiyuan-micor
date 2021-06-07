import {SETSOCKET, DELSOCKET} from "./allConstValue.js";

export function setSocket(socket) {
    return ({
        type : SETSOCKET,
        socket
    });
}

export function delSocket() {
    return ({
        type : DELSOCKET,
    });
}