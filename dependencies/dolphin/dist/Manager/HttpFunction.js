"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Stack_1 = __importDefault(require("../Lib/Array/Stack"));
class HttpFunction {
    constructor(name) {
        this.params = new Stack_1.default;
        this.name = name;
        this.isFileFormEncoded = false;
        this.fileDesc = undefined;
        this.method = undefined;
        this.route = undefined;
    }
    IsFileFormEncoded() {
        return this.isFileFormEncoded;
    }
    GetFileDesc() {
        return this.fileDesc;
    }
    GetParams() {
        const params = [];
        this.params.ForEach((param) => params.push(param));
        return params;
    }
    GetMethod() {
        if (!this.method)
            throw new Error("HTTP method is undefined");
        return this.method;
    }
    GetRoute() {
        if (!this.route)
            throw new Error("Route is undefined");
        return this.route;
    }
    GetName() {
        return this.name;
    }
    HasRoute() {
        return this.route != undefined;
    }
    HasMethod() {
        return this.method != undefined;
    }
    SetFileFormEncoded(a, name, multiple) {
        this.isFileFormEncoded = a;
        this.fileDesc = { name, multiple };
    }
    SetMethod(method) {
        this.method = method;
    }
    SetRoute(route) {
        this.route = route;
    }
    AddParam(name, type, index) {
        this.params.Push({ name, type, index });
    }
}
exports.default = HttpFunction;
//# sourceMappingURL=HttpFunction.js.map