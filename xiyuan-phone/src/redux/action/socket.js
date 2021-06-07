import {SETSOCKET, DELSOCKET} from "../allConstValue";

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