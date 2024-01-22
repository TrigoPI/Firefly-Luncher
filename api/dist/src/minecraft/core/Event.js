"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McConsoleEvent = exports.McServerStateChangedEvent = exports.CmdExitEvent = exports.CmdErrEvent = exports.CmdOutEvent = void 0;
const Event_1 = require("../lib/event/Event");
var CMD_EVENT_NAME;
(function (CMD_EVENT_NAME) {
    CMD_EVENT_NAME["CMD_OUT_EVENT"] = "CMD_OUT_EVENT";
    CMD_EVENT_NAME["CMD_ERR_EVENT"] = "CMD_ERR_EVENT";
    CMD_EVENT_NAME["CMD_EXIT_EVENT"] = "CMD_EXIT_EVENT";
})(CMD_EVENT_NAME || (CMD_EVENT_NAME = {}));
var MC_EVENT_NAME;
(function (MC_EVENT_NAME) {
    MC_EVENT_NAME["MC_SERVER_STATE_CHANGED_EVENT"] = "MC_SERVER_STATE_CHANGED";
    MC_EVENT_NAME["MC_CONSOLE_EVENT"] = "MC_CONSOLE_EVENT";
})(MC_EVENT_NAME || (MC_EVENT_NAME = {}));
let CmdOutEvent = class CmdOutEvent extends Event_1.EventClass {
    constructor(data) {
        super();
        this.data = data;
    }
};
exports.CmdOutEvent = CmdOutEvent;
exports.CmdOutEvent = CmdOutEvent = __decorate([
    (0, Event_1.Event)(CMD_EVENT_NAME.CMD_OUT_EVENT)
], CmdOutEvent);
let CmdErrEvent = class CmdErrEvent extends Event_1.EventClass {
    constructor(err) {
        super();
        this.err = err;
    }
};
exports.CmdErrEvent = CmdErrEvent;
exports.CmdErrEvent = CmdErrEvent = __decorate([
    (0, Event_1.Event)(CMD_EVENT_NAME.CMD_ERR_EVENT)
], CmdErrEvent);
let CmdExitEvent = class CmdExitEvent extends Event_1.EventClass {
    constructor(code) {
        super();
        this.code = code;
    }
};
exports.CmdExitEvent = CmdExitEvent;
exports.CmdExitEvent = CmdExitEvent = __decorate([
    (0, Event_1.Event)(CMD_EVENT_NAME.CMD_EXIT_EVENT)
], CmdExitEvent);
//-----------------------------MC_EVENT-----------------------------
let McServerStateChangedEvent = class McServerStateChangedEvent extends Event_1.EventClass {
    constructor(server, state) {
        super();
        this.state = state;
        this.server = server;
    }
};
exports.McServerStateChangedEvent = McServerStateChangedEvent;
exports.McServerStateChangedEvent = McServerStateChangedEvent = __decorate([
    (0, Event_1.Event)(MC_EVENT_NAME.MC_SERVER_STATE_CHANGED_EVENT)
], McServerStateChangedEvent);
let McConsoleEvent = class McConsoleEvent extends Event_1.EventClass {
    constructor(server, data) {
        super();
        this.server = server;
        this.data = data;
    }
};
exports.McConsoleEvent = McConsoleEvent;
exports.McConsoleEvent = McConsoleEvent = __decorate([
    (0, Event_1.Event)(MC_EVENT_NAME.MC_CONSOLE_EVENT)
], McConsoleEvent);
