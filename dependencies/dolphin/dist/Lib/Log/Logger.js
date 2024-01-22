"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    constructor(className) {
        this.className = className;
    }
    Error(a, fun = null) {
        if (!fun) {
            console.error(`\x1b[31m[${this.className}] : ${a}\x1b[0m`);
            return;
        }
        console.error(`\x1b[31m[${this.className}/${fun.name}] : ${a}\x1b[0m`);
    }
    Warning(a, fun = null) {
        if (!fun) {
            console.warn(`\x1b[33m[${this.className}] : ${a}\x1b[0m`);
            return;
        }
        console.warn(`\x1b[33m[${this.className}] : ${a}\x1b[0m`);
    }
    Info(a, fun = null) {
        if (!fun) {
            console.info(`\x1b[32m[${this.className}] : ${a}\x1b[0m`);
            return;
        }
        console.info(`\x1b[32m[${this.className}/${fun.name}] : ${a}\x1b[0m`);
    }
    Print(a, fun = null) {
        if (!fun) {
            console.log(`[${this.className}] : ${a}`);
            return;
        }
        console.log(`[${this.className}/${fun.name}]] : ${a}`);
    }
}
exports.default = Logger;
//# sourceMappingURL=Logger.js.map