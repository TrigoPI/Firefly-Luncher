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
const Logger_1 = __importDefault(require("../Lib/Log/Logger"));
const HttpServer_1 = __importDefault(require("../Server/HttpServer"));
class HttpServerManager {
    constructor() {
        this.logger = new Logger_1.default(HttpServerManager.name);
        this.servers = new Map();
    }
    IsRunning(ip, port) {
        const key = `${ip}:${port}`;
        if (!this.servers.has(key))
            throw new Error(`Server : ${key} not found`);
        const server = this.servers.get(key);
        return server.IsRunning();
    }
    RemoveServer(ip, port) {
        const key = `${ip}:${port}`;
        if (!this.servers.has(key))
            throw new Error(`Server : ${key} not found`);
        const server = this.servers.get(key);
        this.logger.Info(`Removing http server : ${key}`);
        if (server.IsRunning())
            throw new Error(`Cannot remove ${key} when is running`);
        this.servers.delete(key);
    }
    CreateServer(ip, port) {
        const key = `${ip}:${port}`;
        if (this.servers.has(key))
            throw new Error(`Server : ${key} already exist`);
        this.logger.Info(`Creating new http server : ${key}`);
        this.servers.set(key, new HttpServer_1.default(ip, port));
    }
    AddRouter(ip, port, route) {
        const key = `${ip}:${port}`;
        if (!this.servers.has(key))
            throw new Error(`Server : ${key} not found`);
        const server = this.servers.get(key);
        server.CreateRouter(route);
    }
    AddSubRoute(ip, port, route, subRoute, method, name, fileDesc, handler) {
        const key = `${ip}:${port}`;
        if (!this.servers.has(key))
            throw new Error(`Server : ${key} not found`);
        const server = this.servers.get(key);
        server.AddSubRoute(route, subRoute, method, name, fileDesc, handler);
    }
    SetParam(ip, port, route, subRoute, method, params) {
        const key = `${ip}:${port}`;
        if (!this.servers.has(key))
            throw new Error(`Server : ${key} not found`);
        const server = this.servers.get(key);
        server.SetRouteParams(route, subRoute, method, params);
    }
    Stop(ip, port) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${ip}:${port}`;
            if (!this.servers.has(key))
                throw new Error(`Server : ${key} not found`);
            try {
                const server = this.servers.get(key);
                yield server.Stop();
            }
            catch (e) {
                this.logger.Error(`Error while running http server : ${key} : `);
                this.logger.Error(e);
            }
        });
    }
    StopAll() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [key, server] of this.servers) {
                try {
                    yield server.Stop();
                }
                catch (e) {
                    this.logger.Error(`Error while running http server : ${key} : `);
                    this.logger.Error(e);
                }
            }
            ;
        });
    }
    Start(ip, port) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${ip}:${port}`;
            if (!this.servers.has(key))
                throw new Error(`Server : ${key} not found`);
            try {
                const server = this.servers.get(key);
                yield server.Listen();
            }
            catch (e) {
                this.logger.Error(`Error while running http server : ${key} : `);
                this.logger.Error(e);
            }
        });
    }
    StartAll() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [key, server] of this.servers) {
                try {
                    yield server.Listen();
                }
                catch (e) {
                    this.logger.Error(`Error while running http server : ${key} : `);
                    this.logger.Error(e);
                }
            }
            ;
        });
    }
}
exports.default = HttpServerManager;
//# sourceMappingURL=HttpServerManager.js.map