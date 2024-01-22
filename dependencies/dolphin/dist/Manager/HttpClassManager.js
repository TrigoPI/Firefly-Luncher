"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = __importDefault(require("../Lib/Log/Logger"));
const HttpClass_1 = __importDefault(require("./HttpClass"));
class HttpClassManager {
    constructor() {
        this.logger = new Logger_1.default(HttpClassManager.name);
        this.httpClasses = new Map();
    }
    GetClasses() {
        const classes = [];
        this.httpClasses.forEach((httpClass) => classes.push(httpClass));
        return classes;
    }
    FunctionExist(className, functionName) {
        if (!this.httpClasses.has(className))
            throw new Error(`Class ${className} doesn't exist`);
        const httpClass = this.httpClasses.get(className);
        return httpClass.FunctionExist(functionName);
    }
    ClassExist(name) {
        return this.httpClasses.has(name);
    }
    RemoveClass(className) {
        if (!this.httpClasses.has(className))
            throw new Error(`Class ${className} doesn't exist`);
        this.logger.Print(`Removing class ${className}`);
        this.httpClasses.delete(className);
    }
    GetClass(name) {
        if (!this.httpClasses.has(name))
            throw new Error(`Class ${name} doesn't exist`);
        return this.httpClasses.get(name);
    }
    AddClass(name) {
        if (this.httpClasses.has(name))
            throw new Error(`Class ${name} already exist`);
        this.logger.Print(`Adding class ${name}`);
        this.httpClasses.set(name, new HttpClass_1.default(name));
    }
    AddFunction(className, functionName) {
        if (!this.httpClasses.has(className))
            throw new Error(`Class ${name} doesn't exist`);
        const httpClass = this.httpClasses.get(className);
        this.logger.Print(`Adding function ${functionName} to class ${className}`);
        httpClass.AddFunction(functionName);
    }
    SetFunctionHttpMethod(className, functionName, httpMethod) {
        if (!this.httpClasses.has(className))
            throw new Error(`Class ${className} doesn't exist`);
        const httpClass = this.httpClasses.get(className);
        this.logger.Print(`Setting Http method for ${functionName} in class ${className} --> ${httpMethod}`);
        httpClass.SetFunctionHttpMethod(functionName, httpMethod);
    }
    SetFunctionFileFormEncoded(className, functionName, a, name, multiple) {
        if (!this.httpClasses.has(className))
            throw new Error(`Class ${className} doesn't exist`);
        const httpClass = this.httpClasses.get(className);
        this.logger.Print(`Setting multipart/form-data for function ${functionName} in class ${className}`);
        httpClass.SetFunctionFileFormEncoded(functionName, a, name, multiple);
    }
    SetFunctionRoute(className, functionName, route) {
        if (!this.httpClasses.has(className))
            throw new Error(`Class ${className} doesn't exist`);
        const httpClass = this.httpClasses.get(className);
        this.logger.Print(`Setting Http route for function ${functionName} in class ${className} --> ${route}`);
        httpClass.SetFunctionRoute(functionName, route);
    }
    AddFunctionParam(className, functionName, paramName, type, index) {
        if (!this.httpClasses.has(className))
            throw new Error(`Class ${className} doesn't exist`);
        const httpClass = this.httpClasses.get(className);
        this.logger.Print(`Adding parameter for function ${functionName} in class ${className} --> { name: ${paramName}, type: ${type}, index : ${index} }`);
        httpClass.AddFunctionParam(functionName, paramName, type, index);
    }
    static GetInstance() {
        if (!HttpClassManager.INSTANCE)
            HttpClassManager.INSTANCE = new HttpClassManager();
        return HttpClassManager.INSTANCE;
    }
}
exports.default = HttpClassManager;
//# sourceMappingURL=HttpClassManager.js.map