"use strict";
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
}
Exception.ERROR = "ERROR";
exports.default = Exception;
//# sourceMappingURL=Exception.js.map