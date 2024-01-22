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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ServiceLoader_1 = __importDefault(require("./ServiceLoader"));
const HttpServerManager_1 = __importDefault(require("../Manager/HttpServerManager"));
const Logger_1 = __importDefault(require("../Lib/Log/Logger"));
const HttpClassManager_1 = __importDefault(require("../Manager/HttpClassManager"));
class ServiceLuncher {
    constructor(servicePath) {
        this.servicePath = servicePath;
        this.httpServerManager = new HttpServerManager_1.default();
        this.services = new Map();
        this.logger = new Logger_1.default(ServiceLuncher.name);
    }
    IsRunning(name) {
        if (!this.services.has(name))
            throw new Error(`Cannot find service ${name}`);
        const service = this.services.get(name);
        return this.httpServerManager.IsRunning(service.service.GetIp(), service.service.GetPort());
    }
    ServiceExist(name) {
        return this.services.has(name);
    }
    GetService(name) {
        if (!this.services.has(name))
            throw new Error(`Cannot find service ${name}`);
        const service = this.services.get(name);
        const ip = service.service.GetIp();
        const base_path = service.service.GetRoute();
        const port = service.service.GetPort();
        const status = this.httpServerManager.IsRunning(ip, port) ? "running" : "stopped";
        return { name, ip, port, base_path, status };
    }
    GetServicesDesc() {
        const names = [];
        this.services.forEach((value, name) => {
            const ip = value.service.GetIp();
            const base_path = value.service.GetRoute();
            const port = value.service.GetPort();
            const status = this.httpServerManager.IsRunning(ip, port) ? "running" : "stopped";
            names.push({ name, ip, port, base_path, status });
        });
        return names;
    }
    GetServiceNames() {
        const names = [];
        this.services.forEach((_, key) => names.push(key));
        return names;
    }
    LoadServices() {
        return __awaiter(this, void 0, void 0, function* () {
            const servicesLoader = new ServiceLoader_1.default(this.servicePath);
            const services = yield servicesLoader.Load();
            services.forEach((value) => {
                this.services.set(value.service.GetName(), value);
                this.CreateHttpServer(value);
            });
        });
    }
    ReloadService(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.services.has(name))
                throw new Error(`Cannot find service ${name}`);
            const manager = HttpClassManager_1.default.GetInstance();
            const service = this.services.get(name);
            const servicesLoader = new ServiceLoader_1.default(this.servicePath);
            const ip = service.service.GetIp();
            const port = service.service.GetPort();
            if (this.httpServerManager.IsRunning(ip, port))
                yield this.httpServerManager.Stop(ip, port);
            manager.RemoveClass(service.className);
            const newService = yield servicesLoader.LoadFromPath(service.path);
            this.services.set(name, newService);
            this.httpServerManager.RemoveServer(ip, port);
            this.CreateHttpServer(newService);
        });
    }
    StopService(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.services.has(name))
                throw new Error(`Cannot find service ${name}`);
            const service = this.services.get(name);
            yield this.OnStopService(service);
            yield this.httpServerManager.Stop(service.service.GetIp(), service.service.GetPort());
        });
    }
    StopAllService() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [_, service] of this.services)
                yield this.OnStopService(service);
            yield this.httpServerManager.StopAll();
        });
    }
    StartService(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.services.has(name))
                throw new Error(`Cannot find service ${name}`);
            const service = this.services.get(name);
            yield this.OnStartServices(service);
            yield this.httpServerManager.Start(service.service.GetIp(), service.service.GetPort());
        });
    }
    StartAllService() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [_, service] of this.services)
                yield this.OnStartServices(service);
            yield this.httpServerManager.StartAll();
        });
    }
    OnStopService(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield data.service.OnStop();
            }
            catch (err) {
                this.logger.Error(`Failed to execute OnStop ${data.service.GetName()}`);
                this.logger.Error(err);
            }
        });
    }
    OnStartServices(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield data.service.OnStart();
            }
            catch (err) {
                this.logger.Error(`Failed to execute OnStart ${data.service.GetName()}`);
                this.logger.Error(err);
            }
        });
    }
    CreateHttpServer(data) {
        const service = data.service;
        const functions = data.functions;
        this.httpServerManager.CreateServer(service.GetIp(), service.GetPort());
        this.httpServerManager.AddRouter(service.GetIp(), service.GetPort(), service.GetRoute());
        functions.forEach((httpFunction) => {
            const params = httpFunction.GetParams();
            this.httpServerManager.AddSubRoute(service.GetIp(), service.GetPort(), service.GetRoute(), httpFunction.GetRoute(), httpFunction.GetMethod(), httpFunction.GetName(), httpFunction.GetFileDesc(), (...args) => service[httpFunction.GetName()](...args));
            this.httpServerManager.SetParam(service.GetIp(), service.GetPort(), service.GetRoute(), httpFunction.GetRoute(), httpFunction.GetMethod(), params);
        });
    }
    static GetInstance() {
        if (!ServiceLuncher.sInstance)
            throw new Error("Luncher already not created");
        return ServiceLuncher.sInstance;
    }
    static Create(servicePath) {
        if (ServiceLuncher.sInstance)
            throw new Error("Luncher already created");
        ServiceLuncher.sInstance = new ServiceLuncher(servicePath);
    }
}
exports.default = ServiceLuncher;
//# sourceMappingURL=ServiceLuncher.js.map