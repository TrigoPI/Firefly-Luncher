"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_STATE = void 0;
var SERVER_STATE;
(function (SERVER_STATE) {
    SERVER_STATE[SERVER_STATE["STOPPED"] = 0] = "STOPPED";
    SERVER_STATE[SERVER_STATE["LOADING"] = 1] = "LOADING";
    SERVER_STATE[SERVER_STATE["RUNNING"] = 2] = "RUNNING";
})(SERVER_STATE || (exports.SERVER_STATE = SERVER_STATE = {}));
