"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const Event_1 = require("./Event");
class Command {
    constructor(cmd = "") {
        this.cwd = ".";
        this.cmd = cmd;
        this.child = undefined;
        this.eventHandler = undefined;
    }
    SetCommand(cmd) {
        this.cmd = cmd;
    }
    SetLocation(path) {
        this.cwd = path;
    }
    AddEventListener(listener) {
        this.eventHandler = listener;
    }
    Write(message) {
        if (!this.child)
            throw new Error(`Command: ${this.cmd} not executed`);
        this.child.stdin.write(message + "\n");
    }
    Exec() {
        this.child = (0, child_process_1.spawn)("cmd", ["/c", `${this.cmd}`], { cwd: this.cwd });
        if (!this.eventHandler)
            return;
        this.child.stdout.setEncoding('utf-8');
        this.child.stderr.setEncoding('utf-8');
        this.child.stdout.on('data', (buffer) => {
            const data = buffer.toString('utf-8').replace("\n", "").replace("\r", "");
            const event = new Event_1.CmdOutEvent(data);
            this.eventHandler(event);
        });
        this.child.stderr.on('data', (buffer) => {
            const data = buffer.toString('utf-8').replace("\n", "").replace("\r", "");
            const event = new Event_1.CmdErrEvent(data);
            this.eventHandler(event);
        });
        this.child.on('exit', (code) => {
            const event = new Event_1.CmdExitEvent(code);
            this.eventHandler(event);
        });
    }
}
exports.default = Command;
