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
const mcserver_conf_json_1 = __importDefault(require("../../../conf/mcserver.conf.json"));
const promises_1 = require("fs/promises");
const dolphin_1 = require("dolphin");
let DownloadService = class DownloadService extends dolphin_1.ServiceClass {
    OnStart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.modsPath = `${mcserver_conf_json_1.default.path}/${mcserver_conf_json_1.default.name}/mods`;
        });
    }
    GetMods() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = [];
            const server = [];
            (yield (0, promises_1.readdir)(this.modsPath)).forEach((nameRaw) => {
                const nameSplit = nameRaw.split(".");
                const desc = nameSplit[nameSplit.length - 2].split("-");
                const side = desc[desc.length - 2];
                const enable = desc[desc.length - 1] == "enable";
                const name = nameRaw.replace(`-${side}-${desc[desc.length - 1]}`, "");
                let arrayPtr = (side == "client") ? client : server;
                arrayPtr.push({ name, side, enable });
            });
            return { client, server };
        });
    }
    ModExist(mods, name) {
        return mods.findIndex((mod) => mod.name == name) != -1;
    }
    GetMod(mods, name) {
        return mods.find((mod) => mod.name == name);
    }
    OnDownloadMod(mod_name) {
        return __awaiter(this, void 0, void 0, function* () {
            const mods = (yield this.GetMods()).client;
            if (!this.ModExist(mods, mod_name))
                return dolphin_1.Response.NotFound();
            const mod = this.GetMod(mods, mod_name);
            if (!mod)
                return dolphin_1.Response.NotFound();
            if (!mod.enable)
                return dolphin_1.Response.NotFound();
            const path = `${mcserver_conf_json_1.default.path}/${mcserver_conf_json_1.default.name}/mods/${mod.name.replace(".jar", "")}-client-enable.jar`;
            const filename = mod.name;
            const json = { path, filename };
            return dolphin_1.Response.Json(json);
        });
    }
};
__decorate([
    dolphin_1.Get,
    (0, dolphin_1.Route)("/:mod_name"),
    __param(0, (0, dolphin_1.WebString)("mod_name"))
], DownloadService.prototype, "OnDownloadMod", null);
DownloadService = __decorate([
    (0, dolphin_1.Service)("download", "/download", service_conf_json_1.default.download.ip, service_conf_json_1.default.download.port)
], DownloadService);
exports.default = DownloadService;
