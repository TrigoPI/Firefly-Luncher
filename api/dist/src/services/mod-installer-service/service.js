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
const mcserver_conf_json_1 = __importDefault(require("../../../conf/mcserver.conf.json"));
const service_conf_json_1 = __importDefault(require("../../../conf/service.conf.json"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const dolphin_1 = require("dolphin");
let ModInstallerService = class ModInstallerService extends dolphin_1.ServiceClass {
    OnStart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.serverPath = `${mcserver_conf_json_1.default.path}/${mcserver_conf_json_1.default.name}/${mcserver_conf_json_1.default.version}`;
            this.modsPath = `${mcserver_conf_json_1.default.path}/${mcserver_conf_json_1.default.name}/mods`;
            this.logger = new dolphin_1.Logger("mod-installer-service");
        });
    }
    GetMods() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, promises_1.readdir)(`${this.serverPath}/mods`);
        });
    }
    OnServerStart(mods) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverMods = yield this.GetMods();
            for (const modName of serverMods) {
                yield (0, promises_1.rm)(`${this.serverPath}/mods/${modName}`);
            }
            for (const mod of mods) {
                const modName = `${mod.name.replace(".jar", "")}-server-enable.jar`;
                if ((0, fs_1.existsSync)(`${this.modsPath}/${modName}`)) {
                    yield (0, promises_1.copyFile)(`${this.modsPath}/${modName}`, `${this.serverPath}/mods/${mod.name}`);
                }
                else {
                    this.logger.Warning(`Cannot find mod ${modName}`);
                }
            }
            return dolphin_1.Response.Ok();
        });
    }
};
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/install/mods"),
    __param(0, (0, dolphin_1.WebObject)("mods"))
], ModInstallerService.prototype, "OnServerStart", null);
ModInstallerService = __decorate([
    (0, dolphin_1.Service)("mod-installer-service", "/installer", service_conf_json_1.default.mod_installer.ip, service_conf_json_1.default.mod_installer.port)
], ModInstallerService);
exports.default = ModInstallerService;
