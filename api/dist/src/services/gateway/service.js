"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
const service_conf_json_1 = __importDefault(require("../../../conf/service.conf.json"));
const dolphin_1 = require("dolphin");
const rest_client_1 = require("rest-client");
let GatewayService = class GatewayService extends dolphin_1.ServiceClass {
    GetMod(mod, name) {
        return mod.find((value) => value.name == name);
    }
    OnGetClientConf() {
        return __awaiter(this, void 0, void 0, function* () {
            const [res, err] = yield rest_client_1.RestClient.Get(service_conf_json_1.default.client_conf.url);
            if (err)
                return new dolphin_1.Response(err.body, dolphin_1.MediaType.PLAIN_HTML, err.code);
            return dolphin_1.Response.Json(res.Json());
        });
    }
    OnGetProperties() {
        return __awaiter(this, void 0, void 0, function* () {
            const [res, err] = yield rest_client_1.RestClient.Get(`${service_conf_json_1.default.mc_server.url}/properties`);
            if (err)
                return new dolphin_1.Response(err.body, dolphin_1.MediaType.PLAIN_HTML, err.code);
            return dolphin_1.Response.Json(res.Json());
        });
    }
    OnGetBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            const [res, err] = yield rest_client_1.RestClient.Get(`${service_conf_json_1.default.mc_server.url}/buffer`);
            if (err)
                return new dolphin_1.Response(err.body, dolphin_1.MediaType.PLAIN_HTML, err.code);
            return dolphin_1.Response.Json(res.Json());
        });
    }
    OnServerCommand(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            const [_, err] = yield rest_client_1.RestClient.Post(`${service_conf_json_1.default.mc_server.url}/command`, { cmd });
            if (err)
                return new dolphin_1.Response(err.body, dolphin_1.MediaType.PLAIN_HTML, err.code);
            return dolphin_1.Response.Ok();
        });
    }
    OnMcServerStart(action) {
        return __awaiter(this, void 0, void 0, function* () {
            if (action != "start" && action != "stop")
                return dolphin_1.Response.NotFound();
            if (action == "start") {
                const [modListRes, modListErr] = yield rest_client_1.RestClient.Get(`${service_conf_json_1.default.mods_service.url}/list`);
                if (modListErr)
                    return new dolphin_1.Response(modListErr.body, dolphin_1.MediaType.PLAIN_HTML, modListErr.code);
                const modList = modListRes.Json();
                const mods = modList.server;
                const [_1, installErr] = yield rest_client_1.RestClient.Post(`${service_conf_json_1.default.mod_installer.url}/install/mods`, { mods });
                if (installErr)
                    return new dolphin_1.Response(installErr.body, dolphin_1.MediaType.PLAIN_HTML, installErr.code);
            }
            const [_2, startErr] = yield rest_client_1.RestClient.Post(`${service_conf_json_1.default.mc_server.url}/${action}`);
            if (startErr)
                return new dolphin_1.Response(startErr.body, dolphin_1.MediaType.PLAIN_HTML, startErr.code);
            return dolphin_1.Response.Ok();
        });
    }
    OnModEnableOrDisable(action, side, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (action != 'enable' && action != 'disable' && action != 'delete')
                return dolphin_1.Response.NotFound();
            const [_, err] = yield rest_client_1.RestClient.Post(`${service_conf_json_1.default.mods_service.url}/${action}/${side}/${name}`);
            if (err)
                return new dolphin_1.Response(err.body, dolphin_1.MediaType.PLAIN_TEXT, err.code);
            return dolphin_1.Response.Ok();
        });
    }
    OnModsAdded(side, files) {
        return __awaiter(this, void 0, void 0, function* () {
            const [modListRes, modListErr] = yield rest_client_1.RestClient.Get(`${service_conf_json_1.default.mods_service.url}/list`);
            if (modListErr)
                return dolphin_1.Response.InternalServerError();
            const modList = modListRes.Json();
            const formData = new FormData();
            const newClientMod = [];
            const newServerMod = [];
            for (const file of files) {
                formData.append("jar", new Blob([file.buffer]), file.originalname);
                for (const modSide of side.split(";")) {
                    if (modSide == "client") {
                        const mod = this.GetMod(modList.client, file.originalname);
                        if (!mod)
                            newClientMod.push(file.originalname);
                    }
                    if (modSide == "server") {
                        const mod = this.GetMod(modList.server, file.originalname);
                        if (!mod)
                            newServerMod.push(file.originalname);
                    }
                }
            }
            const modsData = { client: newClientMod, server: newServerMod };
            formData.append("mods-data", JSON.stringify(modsData));
            const [uploadRes, uploadErr] = yield rest_client_1.RestClient.PostForm(`${service_conf_json_1.default.upload_service.url}/jar`, formData);
            if (uploadErr)
                new dolphin_1.Response(uploadErr.body, dolphin_1.MediaType.PLAIN_TEXT, uploadErr.code);
            const [_, addModErr] = yield rest_client_1.RestClient.Post(`${service_conf_json_1.default.mods_service.url}/add`);
            if (addModErr)
                return new dolphin_1.Response(addModErr.body, dolphin_1.MediaType.PLAIN_TEXT, addModErr.code);
            return dolphin_1.Response.Json(uploadRes.Json());
        });
    }
};
__decorate([
    dolphin_1.Get,
    (0, dolphin_1.Route)("/client-conf")
], GatewayService.prototype, "OnGetClientConf", null);
__decorate([
    dolphin_1.Get,
    (0, dolphin_1.Route)("/server/properties")
], GatewayService.prototype, "OnGetProperties", null);
__decorate([
    dolphin_1.Get,
    (0, dolphin_1.Route)("/server/buffer")
], GatewayService.prototype, "OnGetBuffer", null);
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/server/command"),
    __param(0, (0, dolphin_1.WebString)("cmd"))
], GatewayService.prototype, "OnServerCommand", null);
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/server/:action"),
    __param(0, (0, dolphin_1.WebString)("action"))
], GatewayService.prototype, "OnMcServerStart", null);
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/mod/:action/:side/:name"),
    __param(0, (0, dolphin_1.WebString)("action")),
    __param(1, (0, dolphin_1.WebString)("side")),
    __param(2, (0, dolphin_1.WebString)("name"))
], GatewayService.prototype, "OnModEnableOrDisable", null);
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/mods/add"),
    (0, dolphin_1.FileFormEncoded)("jar", true),
    __param(0, (0, dolphin_1.WebString)("side")),
    __param(1, (0, dolphin_1.WebObject)("jar"))
], GatewayService.prototype, "OnModsAdded", null);
GatewayService = __decorate([
    (0, dolphin_1.Service)("gateway", "/api", service_conf_json_1.default.gateway.ip, service_conf_json_1.default.gateway.port)
], GatewayService);
exports.default = GatewayService;
