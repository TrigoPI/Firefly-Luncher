"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class Logger {
    constructor(className) {
        this.className = className;
        this.write = false;
        this.logFile = undefined;
    }
    WriteLog(a) {
        this.write = a;
    }
    SetLogPath(path) {
        this.logFile = path;
    }
    Error(a) {
        this.Log(a, 31);
    }
    Warning(a) {
        this.Log(a, 33);
    }
    Info(a) {
        this.Log(a, 32);
    }
    Print(a) {
        this.Log(a, 97);
    }
    Log(text, color) {
        const format = this.GetDate();
        const content = `[${this.className}-${format}] : ${text}`;
        console.log(`\x1b[${color}m${content}\x1b[0m`);
        if (this.write)
            this.WriteLogToFile(content);
    }
    WriteLogToFile(content) {
        if (!this.logFile)
            return;
        (0, fs_1.appendFileSync)(this.logFile, `${content}\r\n`, 'utf-8');
    }
    GetDate() {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();
        const heuresStr = h < 10 ? '0' + h : h.toString();
        const minutesStr = m < 10 ? '0' + m : m.toString();
        const secondesStr = s < 10 ? '0' + s : s.toString();
        return `${heuresStr}:${minutesStr}:${secondesStr}`;
    }
}
exports.default = Logger;
