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
const app_conf_json_1 = __importDefault(require("../../../conf/app.conf.json"));
const service_conf_json_1 = __importDefault(require("../../../conf/service.conf.json"));
const dolphin_1 = require("dolphin");
const promises_1 = require("fs/promises");
let UploadModService = class UploadModService extends dolphin_1.ServiceClass {
    OnStart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.modsPath = app_conf_json_1.default.app_path + "/mods";
        });
    }
    GetFile(mod, name) {
        return mod.find((value) => value.originalname == name);
    }
    CreateJar(filename, buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, promises_1.appendFile)(filename, "");
            yield (0, promises_1.writeFile)(filename, buffer);
        });
    }
    GetModWithoutExtension(mod) {
        return mod.name.replace(".jar", "");
    }
    OnUpload(modsData, files) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const modsDataJson = JSON.parse(modsData);
                const client = [];
                const server = [];
                for (const modName of modsDataJson.client) {
                    const file = this.GetFile(files, modName);
                    if (file) {
                        const fileName = `${modName.replace(".jar", "")}-client-enable.jar`;
                        yield this.CreateJar(`${this.modsPath}/${fileName}`, file.buffer);
                        client.push({
                            name: file.originalname,
                            side: "client",
                            enable: true
                        });
                    }
                }
                for (const modName of modsDataJson.server) {
                    const file = this.GetFile(files, modName);
                    if (file) {
                        const fileName = `${modName.replace(".jar", "")}-server-enable.jar`;
                        yield this.CreateJar(`${this.modsPath}/${fileName}`, file.buffer);
                        server.push({
                            name: file.originalname,
                            side: "server",
                            enable: true
                        });
                    }
                }
                return dolphin_1.Response.Json({ client, server });
            }
            catch (e) {
                return dolphin_1.Response.InternalServerError();
            }
        });
    }
};
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/jar"),
    (0, dolphin_1.FileFormEncoded)("jar", true),
    __param(0, (0, dolphin_1.WebString)("mods-data")),
    __param(1, (0, dolphin_1.WebObject)("jar"))
], UploadModService.prototype, "OnUpload", null);
UploadModService = __decorate([
    (0, dolphin_1.Service)("upload-mod-service", "/upload", service_conf_json_1.default.upload_service.ip, service_conf_json_1.default.upload_service.port)
], UploadModService);
exports.default = UploadModService;
