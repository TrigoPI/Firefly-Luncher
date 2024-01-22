"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Exception extends Error {
    constructor(msg, type, context = {}) {
        super(msg);
        this.type = type;
        this.context = context;
    }
    GetError() {
        return this.context.error;
    }
    InstanceOf(a) {
        if (this.type != Exception.ERROR)
            return false;
        return this.context.error instanceof a;
    }
    ToString() {
        return `cause : ${this.message}\ncontext: ${JSON.stringify(this.context)}`;
    }
    static EnsureError(err) {
        if (err instanceof Exception)
            return err;
        if (err instanceof Error)
            return new Exception(err.message, Exception.ERROR, { error: err });
        let stringified = '[Unable to stringify the thrown value]';
        try {
            stringified = JSON.stringify(err);
        }
        catch (_a) {
            return new Exception(`This value was thrown as is, not through an Error: ${stringified}`, Exception.ERROR, { error: err });
        }
        return new Exception(`This value was thrown as is, not through an Error: ${stringified}`, Exception.ERROR, { error: err });
    }
    static TryFunction(cb, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield cb(...args);
                return [result, undefined];
            }
            catch (e) {
                const exception = Exception.EnsureError(e);
                return [undefined, exception];
            }
        });
    }
}
Exception.ERROR = "ERROR";
exports.default = Exception;
