"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpErrorException extends Error {
    constructor(code, body, msg = "") {
        super(msg);
        this.code = code;
        this.body = body;
    }
}
exports.default = HttpErrorException;
