"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
const client_conf_json_1 = __importDefault(require("../../../conf/client.conf.json"));
const service_conf_json_1 = __importDefault(require("../../../conf/service.conf.json"));
const dolphin_1 = require("dolphin");
let ClientConfService = class ClientConfService extends dolphin_1.ServiceClass {
    OnGetConf() {
        return __awaiter(this, void 0, void 0, function* () {
            return dolphin_1.Response.Json(client_conf_json_1.default);
        });
    }
};
__decorate([
    dolphin_1.Get,
    (0, dolphin_1.Route)("/")
], ClientConfService.prototype, "OnGetConf", null);
ClientConfService = __decorate([
    (0, dolphin_1.Service)("client-conf", "/client-conf", service_conf_json_1.default.client_conf.ip, service_conf_json_1.default.client_conf.port)
], ClientConfService);
exports.default = ClientConfService;
