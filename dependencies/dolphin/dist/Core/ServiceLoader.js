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
const FileSystem_1 = require("../Lib/File/FileSystem");
const Logger_1 = __importDefault(require("../Lib/Log/Logger"));
const HttpClassManager_1 = __importDefault(require("../Manager/HttpClassManager"));
const ServiceClass_1 = __importDefault(require("../Service/ServiceClass"));
class ServiceLoader {
    constructor(dirPath) {
        this.logger = new Logger_1.default(ServiceLoader.name);
        this.dirPath = dirPath;
    }
    LoadFromPath(path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Print(`Loading : ${path}`);
            try {
                return yield this.LoadModule(path);
            }
            catch (err) {
                this.logger.Warning(`Cannot load module ${path}`);
                this.logger.Error(err.stack);
            }
        });
    }
    Load() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Print("Loading services");
            const services = [];
            const directorys = yield FileSystem_1.FileSystem.ReadDir(this.dirPath);
            for (const dir of directorys.GetContent()) {
                try {
                    const service = yield this.LoadModule(`${this.dirPath}/${dir.name}`);
                    services.push(service);
                }
                catch (err) {
                    this.logger.Warning(`Cannot load module ${dir.path}`);
                    this.logger.Error(err.stack);
                }
            }
            ;
            return services;
        });
    }
    LoadModule(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const manager = HttpClassManager_1.default.GetInstance();
            const servicePath = `${path}/service`;
            const module = (yield Promise.resolve(`${servicePath}`).then(s => __importStar(require(s)))).default;
            if (!module)
                throw new Error(`Module ${servicePath} doesn't have default export`);
            const service = new module();
            if (!(service instanceof ServiceClass_1.default))
                throw new Error(`Module ${servicePath} is not instance of ServiceClass`);
            const className = Object.getPrototypeOf(service.constructor).name;
            this.logger.Print(`Clearing cache for ${servicePath}`);
            delete require.cache[require.resolve(servicePath)];
            this.logger.Info(`Service(${servicePath}) loaded`);
            this.logger.Print(`  |--> Name : ${service.GetName()}`);
            this.logger.Print(`      |--> Base path : ${service.GetRoute()}`);
            this.logger.Print(`      |--> Ip : ${service.GetIp()}`);
            this.logger.Print(`      |--> Port : ${service.GetPort()}`);
            this.logger.Print(`      |--> Class : ${className}`);
            if (!manager.ClassExist(className))
                return { className: className, service: service, functions: [], path: "" };
            const httpClass = manager.GetClass(className);
            const httpFunctions = httpClass.GetFunctions();
            const functions = [];
            httpFunctions.forEach((func) => {
                if (!func.HasRoute()) {
                    this.logger.Print(`         |--> function : ${func.GetName()}`);
                    this.logger.Error(`         |--> Error`);
                    this.logger.Error(`             |--> route : undefined`);
                    return;
                }
                if (!func.HasMethod()) {
                    this.logger.Print(`         |--> function : ${func.GetName()}`);
                    this.logger.Error(`         |--> Error`);
                    this.logger.Error(`             |--> method : undefined`);
                    return;
                }
                const params = func.GetParams();
                this.logger.Print(`         |--> function : ${func.GetName()}`);
                this.logger.Print(`             |--> route : ${func.GetRoute()}`);
                this.logger.Print(`             |--> method : ${func.GetMethod()}`);
                this.logger.Print(`             |--> params`);
                params.forEach((param) => {
                    this.logger.Print(`                 |--> param`);
                    this.logger.Print(`                     |--> name : ${param.name}`);
                    this.logger.Print(`                     |--> type : ${param.type}`);
                    this.logger.Print(`                     |--> index ${param.index}`);
                });
                functions.push(func);
            });
            return { className, functions, service, path };
        });
    }
}
exports.default = ServiceLoader;
//# sourceMappingURL=ServiceLoader.js.map