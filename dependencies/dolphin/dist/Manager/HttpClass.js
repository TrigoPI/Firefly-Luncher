"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpFunction_1 = __importDefault(require("./HttpFunction"));
class HttpClass {
    constructor(name) {
        this.httpFunctions = new Map();
        this.name = name;
    }
    GetName() {
        return this.name;
    }
    GetFunctions() {
        const functions = [];
        this.httpFunctions.forEach((func) => functions.push(func));
        return functions;
    }
    FunctionExist(name) {
        return this.httpFunctions.has(name);
    }
    GetFunction(name) {
        if (!this.httpFunctions.has(name))
            throw new Error(`Class ${this.name} doesn't have function ${name}`);
        return this.httpFunctions.get(name);
    }
    AddFunction(name) {
        if (this.httpFunctions.has(name))
            throw new Error(`Function ${name} already exist in class ${this.name}`);
        this.httpFunctions.set(name, new HttpFunction_1.default(name));
    }
    SetFunctionFileFormEncoded(name, a, filename, multiple) {
        if (!this.httpFunctions.has(name))
            throw new Error(`Class ${this.name} doesn't have function ${name}`);
        const httpFunction = this.httpFunctions.get(name);
        httpFunction.SetFileFormEncoded(a, filename, multiple);
    }
    SetFunctionHttpMethod(name, httpMethod) {
        if (!this.httpFunctions.has(name))
            throw new Error(`Class ${this.name} doesn't have function ${name}`);
        const httpFunction = this.httpFunctions.get(name);
        httpFunction.SetMethod(httpMethod);
    }
    SetFunctionRoute(name, route) {
        if (!this.httpFunctions.has(name))
            throw new Error(`Class ${this.name} doesn't have function ${name}`);
        const httpFunction = this.httpFunctions.get(name);
        httpFunction.SetRoute(route);
    }
    AddFunctionParam(functionName, paramName, type, index) {
        if (!this.httpFunctions.has(functionName))
            throw new Error(`Class ${this.name} doesn't have function ${functionName}`);
        const httpFunction = this.httpFunctions.get(functionName);
        httpFunction.AddParam(paramName, type, index);
    }
}
exports.default = HttpClass;
//# sourceMappingURL=HttpClass.js.map