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
var Main_1;
Object.defineProperty(exports, "__esModule", { value: true });
const app_conf_json_1 = __importDefault(require("../conf/app.conf.json"));
const path_1 = __importDefault(require("path"));
const dolphin_1 = require("dolphin");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
let Main = Main_1 = class Main {
    Start() {
        return __awaiter(this, void 0, void 0, function* () {
            const luncher = dolphin_1.ServiceLuncher.GetInstance();
            yield this.CreateAppFolder();
            yield luncher.LoadServices();
            yield luncher.StartAllService();
        });
    }
    CreateAppFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, fs_1.existsSync)(`${app_conf_json_1.default.app_path}/server`))
                yield (0, promises_1.mkdir)(`${app_conf_json_1.default.app_path}/server`);
            if (!(0, fs_1.existsSync)(`${app_conf_json_1.default.app_path}/client`))
                yield (0, promises_1.mkdir)(`${app_conf_json_1.default.app_path}/client`);
            if (!(0, fs_1.existsSync)(`${app_conf_json_1.default.app_path}/server/mods`))
                yield (0, promises_1.mkdir)(`${app_conf_json_1.default.app_path}/server/mods`);
            if (!(0, fs_1.existsSync)(`${app_conf_json_1.default.app_path}/server/disable`))
                yield (0, promises_1.mkdir)(`${app_conf_json_1.default.app_path}/server/disable`);
            if (!(0, fs_1.existsSync)(`${app_conf_json_1.default.app_path}/client/mods`))
                yield (0, promises_1.mkdir)(`${app_conf_json_1.default.app_path}/client/mods`);
            if (!(0, fs_1.existsSync)(`${app_conf_json_1.default.app_path}/client/disable`))
                yield (0, promises_1.mkdir)(`${app_conf_json_1.default.app_path}/client/disable`);
        });
    }
    static CreateApplication() {
        return __awaiter(this, void 0, void 0, function* () {
            const app = new Main_1();
            yield app.Start();
        });
    }
};
Main = Main_1 = __decorate([
    (0, dolphin_1.EntryPoint)(path_1.default.resolve(".", "services"))
], Main);
exports.default = Main;
