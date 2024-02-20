"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const Response_1 = require("./Response");
const Logger_1 = __importDefault(require("../Lib/Log/Logger"));
const Macro_1 = require("../Service/Macro");
const multer_1 = __importDefault(require("multer"));
class HttpServer {
    constructor(host, port) {
        this.logger = new Logger_1.default(HttpServer.name);
        this.routers = new Map();
        this.routesParams = new Map();
        this.running = false;
        this.host = host;
        this.port = port;
        this.server = undefined;
        this.multer = (0, multer_1.default)();
        this.app = (0, express_1.default)();
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    }
    IsRunning() {
        return this.running;
    }
    GetIp() {
        return this.host;
    }
    GetPort() {
        return this.port;
    }
    Stop() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.IsRunning())
                    throw new Error("Server not started");
                this.logger.Info(`Stoping RestAPI : http://${this.host}:${this.port}`);
                this.server.closeAllConnections();
                this.server.close((err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.logger.Info(`RestAPI : http://${this.host}:${this.port} stopped`);
                    this.running = false;
                    resolve();
                });
            });
        });
    }
    Listen() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.logger.Info(`Starting RestAPI server on : http://${this.host}:${this.port}`);
                this.routers.forEach((router, key) => this.app.use(key, router));
                this.server = this.app.listen(this.port, this.host, () => {
                    this.running = true;
                    resolve();
                });
                this.server.on('error', (err) => reject(err));
            });
        });
    }
    CreateRouter(route) {
        if (this.routers.has(route))
            throw new Error(`Route ${route} already exist`);
        this.logger.Print(`Creating new router for ${route}`);
        this.routers.set(route, (0, express_1.Router)());
    }
    AddSubRoute(route, subRoute, method, name, fileDesc, handler) {
        if (!this.routers.has(route))
            throw new Error(`Route ${route} doesn't exist`);
        const router = this.routers.get(route);
        this.logger.Print(`Adding sub route new router for ${route} --> ${subRoute}`);
        if (!fileDesc) {
            router[method](subRoute, (req, res) => this.HandleRequest(route, subRoute, req, res, name, undefined, handler));
            return;
        }
        if (fileDesc.multiple) {
            router[method](subRoute, this.multer.array(fileDesc.name), (req, res) => this.HandleRequest(route, subRoute, req, res, name, fileDesc, handler));
            return;
        }
        router[method](subRoute, this.multer.single(fileDesc.name), (req, res) => this.HandleRequest(route, subRoute, req, res, name, fileDesc, handler));
    }
    SetRouteParams(route, subRoute, method, params) {
        if (!this.routers.has(route))
            throw new Error(`Route ${route} doesn't exist`);
        const key = `${method}:${route}${subRoute}`;
        if (this.routesParams.has(key))
            throw new Error(`Param ${route} already registered for route ${key}`);
        this.logger.Print(`Adding param for route ${route}${subRoute}`);
        params.forEach((param) => {
            this.logger.Print(`     |--> name : ${param.name}`);
            this.logger.Print(`         |--> type : ${param.type}`);
            this.logger.Print(`         |--> index : ${param.index}`);
        });
        this.routesParams.set(key, params);
    }
    IsRequestValid(dict, params) {
        let valid = true;
        let i = 0;
        if (params.length == 0)
            return true;
        while (valid && i < params.length) {
            const element = dict[params[i].name];
            const param = params[i];
            if (param.type == 'string')
                valid = element != undefined && typeof element == 'string';
            if (param.type == 'number')
                valid = element != undefined && !isNaN(Number(element));
            if (param.type == 'object')
                valid = element != undefined && typeof element == 'object';
            i++;
        }
        return valid;
    }
    CastParams(dict, params) {
        const cpy = Object.assign({}, dict);
        let i = 0;
        while (i < params.length) {
            const element = dict[params[i].name];
            const param = params[i];
            if (element == undefined)
                throw new Error(`Cannot find params ${params[i].name}`);
            if (param.type == 'number') {
                const num = Number(element);
                if (isNaN(num))
                    throw new Error(`Cannot cast ${param.name} into number`);
                cpy[param.name] = num;
            }
            i++;
        }
        return cpy;
    }
    CleanRequest(dict) {
        const cpy = Object.assign({}, dict);
        for (const key in dict) {
            if (!isNaN(Number(key))) {
                delete cpy[key];
            }
        }
        return cpy;
    }
    GenerateFunctionArgs(dict, params) {
        const args = [];
        for (const param of params)
            args.push(dict[param.name]);
        return args;
    }
    GenerateMacros(req, params, datas) {
        let dict = {};
        for (const param of params) {
            if (param.name.includes("$")) {
                if (param.name == Macro_1.SERVICE_MACRO.REQ_IP)
                    dict[Macro_1.SERVICE_MACRO.REQ_IP] = req.ip;
                if (param.name == Macro_1.SERVICE_MACRO.URL)
                    dict[Macro_1.SERVICE_MACRO.URL] = req.url.split("?")[0];
                if (param.name == Macro_1.SERVICE_MACRO.PARAMS)
                    dict[Macro_1.SERVICE_MACRO.PARAMS] = datas;
            }
        }
        return dict;
    }
    HandleRequest(route, subRoute, req, res, name, fileDesc, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${req.method.toLowerCase()}:${route}${subRoute}`;
            const params = this.routesParams.has(key) ? this.routesParams.get(key) : [];
            let dict = {};
            if (req.params)
                dict = Object.assign(Object.assign({}, dict), req.params);
            if (req.query)
                dict = Object.assign(Object.assign({}, dict), req.query);
            if (req.body)
                dict = Object.assign(Object.assign({}, dict), req.body);
            if (fileDesc)
                dict[fileDesc.name] = (fileDesc.multiple) ? req.files : req.file;
            dict = this.CleanRequest(dict);
            dict = Object.assign(Object.assign({}, dict), this.GenerateMacros(req, params, dict));
            if (!this.IsRequestValid(dict, params)) {
                res.status(400).send(`400 BAD REQUEST: invalid parameters for ${route}${subRoute}`);
                return;
            }
            ;
            try {
                dict = this.CastParams(dict, params);
            }
            catch (_a) {
                res.status(400).send(`400 BAD REQUEST: invalid parameters for ${route}${subRoute}`);
                return;
            }
            try {
                const args = this.GenerateFunctionArgs(dict, params);
                const response = yield handler(...args);
                switch (response.type) {
                    case Response_1.MediaType.EMPTY:
                        res.sendStatus(response.code);
                        break;
                    case Response_1.MediaType.PLAIN_TEXT:
                        res.status(response.code).send(response.body);
                        break;
                    case Response_1.MediaType.PLAIN_HTML:
                        res.status(response.code).send(response.body);
                        break;
                    case Response_1.MediaType.APPLICATION_JSON:
                        res.status(response.code).json(JSON.parse(response.body));
                        break;
                    case Response_1.MediaType.FILE:
                        const json = JSON.parse(response.body);
                        const pathSplit = json.path.replace(/\\/g, "/").split("/");
                        const filename = (json.filename.length > 0) ? json.filename : pathSplit[pathSplit.length - 1];
                        res.status(response.code).download(json.path, filename);
                        break;
                }
            }
            catch (err) {
                res.status(500).json({ status: "error", msg: "internal server error" });
                this.logger.Error(`Error in function ${name}`);
                this.logger.Error(err);
                this.logger.Error(err.stack);
            }
        });
    }
}
exports.default = HttpServer;
//# sourceMappingURL=HttpServer.js.map