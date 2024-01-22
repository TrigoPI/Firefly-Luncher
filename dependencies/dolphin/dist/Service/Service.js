"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = exports.FileFormEncoded = exports.Get = exports.Post = exports.WebParam = exports.WebObject = exports.WebNumber = exports.WebString = exports.WebMacro = exports.Service = void 0;
const HttpClassManager_1 = __importDefault(require("../Manager/HttpClassManager"));
const MACRO_TYPE_MAP = {
    '$REQ_IP': 'string',
    '$URL': 'string',
    '$PARAMS': 'object'
};
const Service = (name, route, ip, port) => {
    return (target) => {
        return class extends target {
            GetName() {
                return name;
            }
            GetRoute() {
                return route;
            }
            GetIp() {
                return ip;
            }
            GetPort() {
                return port;
            }
        };
    };
};
exports.Service = Service;
const WebMacro = (macro) => {
    return (0, exports.WebParam)(macro, MACRO_TYPE_MAP[macro]);
};
exports.WebMacro = WebMacro;
const WebString = (name) => {
    return (0, exports.WebParam)(name, 'string');
};
exports.WebString = WebString;
const WebNumber = (name) => {
    return (0, exports.WebParam)(name, 'number');
};
exports.WebNumber = WebNumber;
const WebObject = (name) => {
    return (0, exports.WebParam)(name, 'object');
};
exports.WebObject = WebObject;
const WebParam = (name, type) => {
    return (target, functionName, index) => {
        const manager = HttpClassManager_1.default.GetInstance();
        const className = target.constructor.name;
        if (!manager.ClassExist(className))
            manager.AddClass(className);
        if (!manager.FunctionExist(className, functionName))
            manager.AddFunction(className, functionName);
        manager.AddFunctionParam(className, functionName, name, type, index);
    };
};
exports.WebParam = WebParam;
const Post = (target, functionName, descriptor) => {
    const manager = HttpClassManager_1.default.GetInstance();
    const className = target.constructor.name;
    if (!manager.ClassExist(className))
        manager.AddClass(className);
    if (!manager.FunctionExist(className, functionName))
        manager.AddFunction(className, functionName);
    manager.SetFunctionHttpMethod(className, functionName, 'post');
};
exports.Post = Post;
const Get = (target, functionName, descriptor) => {
    const manager = HttpClassManager_1.default.GetInstance();
    const className = target.constructor.name;
    if (!manager.ClassExist(className))
        manager.AddClass(className);
    if (!manager.FunctionExist(className, functionName))
        manager.AddFunction(className, functionName);
    manager.SetFunctionHttpMethod(className, functionName, 'get');
};
exports.Get = Get;
const FileFormEncoded = (filename, multiple) => {
    return (target, functionName) => {
        const manager = HttpClassManager_1.default.GetInstance();
        const className = target.constructor.name;
        if (!manager.ClassExist(className))
            manager.AddClass(className);
        if (!manager.FunctionExist(className, functionName))
            manager.AddFunction(className, functionName);
        manager.SetFunctionFileFormEncoded(className, functionName, true, filename, multiple);
    };
};
exports.FileFormEncoded = FileFormEncoded;
const Route = (route) => {
    return (target, functionName) => {
        const manager = HttpClassManager_1.default.GetInstance();
        const className = target.constructor.name;
        if (!manager.ClassExist(className))
            manager.AddClass(className);
        if (!manager.FunctionExist(className, functionName))
            manager.AddFunction(className, functionName);
        manager.SetFunctionRoute(className, functionName, route);
    };
};
exports.Route = Route;
//# sourceMappingURL=Service.js.map