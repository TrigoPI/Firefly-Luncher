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
const app_conf_json_1 = __importDefault(require("../../../conf/app.conf.json"));
const promises_1 = require("fs/promises");
const dolphin_1 = require("dolphin");
let ModInstallerService = class ModInstallerService extends dolphin_1.ServiceClass {
    OnStart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.modPath = `${mcserver_conf_json_1.default.path}/mods`;
            this.modsList = yield this.GetMods();
        });
    }
    GetMods() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, promises_1.readdir)(this.modPath);
        });
    }
    AddMod(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = `${app_conf_json_1.default.app_path}/server/mods/${name}`;
            yield (0, promises_1.copyFile)(path, `${this.modPath}/${name}`);
        });
    }
    DeleteMod(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = `${this.modPath}/${name}`;
            yield (0, promises_1.rm)(path);
        });
    }
    OnServerStart(mods) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mod of mods) {
                try {
                    const indexOfMod = this.modsList.indexOf(mod.name);
                    if (mod.enable) {
                        if (indexOfMod == -1) {
                            yield this.AddMod(mod.name);
                            this.modsList.push(mod.name);
                        }
                    }
                    else {
                        if (indexOfMod != -1) {
                            yield this.DeleteMod(mod.name);
                            this.modsList.splice(indexOfMod, 1);
                        }
                    }
                }
                catch (e) {
                    console.log(`Error while trying to install/remove ${mod.name}`);
                }
            }
            const modToRemove = this.modsList.filter((name) => {
                return mods.find((mod) => mod.name == name) == undefined;
            });
            for (const name of modToRemove) {
                const index = this.modsList.indexOf(name);
                this.modsList.splice(index, 1);
                yield this.DeleteMod(name);
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
