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
const dolphin_1 = require("dolphin");
const promises_1 = require("fs/promises");
let ModsService = class ModsService extends dolphin_1.ServiceClass {
    OnStart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.modsPath = `${mcserver_conf_json_1.default.path}/${mcserver_conf_json_1.default.name}/mods`;
            this.mods = yield this.GetMods();
        });
    }
    FindMod(name, side) {
        const mods = (side == "client") ? this.mods.client : this.mods.server;
        const index = mods.findIndex((mod) => mod.name == name);
        if (index == -1)
            return undefined;
        return mods[index];
    }
    GetModWithoutExtension(mod) {
        return mod.name.replace(".jar", "");
    }
    ModEnableToString(mod) {
        return mod.enable ? "enable" : "disable";
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
    OnGetMods() {
        return __awaiter(this, void 0, void 0, function* () {
            return dolphin_1.Response.Json(this.mods);
        });
    }
    OnGetMod(side, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (side != "client" && side != "server")
                return dolphin_1.Response.NotFound();
            const mod = this.FindMod(name, side);
            if (!mod)
                return dolphin_1.Response.NotFound();
            return dolphin_1.Response.Json(mod);
        });
    }
    OnModAdded() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mods = yield this.GetMods();
            return dolphin_1.Response.Ok();
        });
    }
    OnModDeleted(name, side) {
        return __awaiter(this, void 0, void 0, function* () {
            if (side != "client" && side != "server")
                return dolphin_1.Response.NotFound();
            const mod = this.FindMod(name, side);
            if (!mod)
                return dolphin_1.Response.NotFound();
            const enableString = this.ModEnableToString(mod);
            const modName = this.GetModWithoutExtension(mod);
            yield (0, promises_1.rm)(`${this.modsPath}/${modName}-${side}-${enableString}.jar`);
            this.mods = yield this.GetMods();
            return dolphin_1.Response.Ok();
        });
    }
    OnModDisabled(side, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (side != "client" && side != "server")
                return dolphin_1.Response.NotFound();
            const mod = this.FindMod(name, side);
            if (!mod)
                return dolphin_1.Response.NotFound();
            const enableString = this.ModEnableToString(mod);
            const modName = this.GetModWithoutExtension(mod);
            try {
                mod.enable = false;
                yield (0, promises_1.rename)(`${this.modsPath}/${modName}-${side}-${enableString}.jar`, `${this.modsPath}/${modName}-${side}-disable.jar`);
                return dolphin_1.Response.Ok();
            }
            catch (e) {
                console.log(e);
                return dolphin_1.Response.InternalServerError();
            }
        });
    }
    OnModEnable(side, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (side != "client" && side != "server")
                return dolphin_1.Response.NotFound();
            const mod = this.FindMod(name, side);
            if (!mod)
                return dolphin_1.Response.NotFound();
            const enableString = this.ModEnableToString(mod);
            const modName = this.GetModWithoutExtension(mod);
            try {
                mod.enable = true;
                yield (0, promises_1.rename)(`${this.modsPath}/${modName}-${side}-${enableString}.jar`, `${this.modsPath}/${modName}-${side}-enable.jar`);
                return dolphin_1.Response.Ok();
            }
            catch (e) {
                console.log(e);
                return dolphin_1.Response.InternalServerError();
            }
        });
    }
};
__decorate([
    dolphin_1.Get,
    (0, dolphin_1.Route)("/list")
], ModsService.prototype, "OnGetMods", null);
__decorate([
    dolphin_1.Get,
    (0, dolphin_1.Route)("/:side/:name"),
    __param(0, (0, dolphin_1.WebString)("side")),
    __param(1, (0, dolphin_1.WebString)("name"))
], ModsService.prototype, "OnGetMod", null);
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/add")
], ModsService.prototype, "OnModAdded", null);
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/delete/:side/:name"),
    __param(0, (0, dolphin_1.WebString)("name")),
    __param(1, (0, dolphin_1.WebString)("side"))
], ModsService.prototype, "OnModDeleted", null);
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/disable/:side/:name"),
    __param(0, (0, dolphin_1.WebString)("side")),
    __param(1, (0, dolphin_1.WebString)("name"))
], ModsService.prototype, "OnModDisabled", null);
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/enable/:side/:name"),
    __param(0, (0, dolphin_1.WebString)("side")),
    __param(1, (0, dolphin_1.WebString)("name"))
], ModsService.prototype, "OnModEnable", null);
ModsService = __decorate([
    (0, dolphin_1.Service)("mods-service", "/mods", service_conf_json_1.default.mods_service.ip, service_conf_json_1.default.mods_service.port)
], ModsService);
exports.default = ModsService;
