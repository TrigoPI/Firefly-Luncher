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
const firebase_conf_json_1 = __importDefault(require("../../../conf/firebase.conf.json"));
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const database_1 = require("firebase/database");
const dolphin_1 = require("dolphin");
const ServerState_1 = require("../../minecraft/mc-server/ServerState");
const McServer_1 = __importDefault(require("../../minecraft/mc-server/McServer"));
const EventDispatcher_1 = __importDefault(require("../../minecraft/lib/event/EventDispatcher"));
const Event_1 = require("../../minecraft/core/Event");
let McServerService = class McServerService extends dolphin_1.ServiceClass {
    OnStart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.serverPath = `${mcserver_conf_json_1.default.path}/${mcserver_conf_json_1.default.name}/${mcserver_conf_json_1.default.version}`;
            this.cmdId = 0;
            this.mcServer = new McServer_1.default(this.serverPath, mcserver_conf_json_1.default.name, mcserver_conf_json_1.default.version);
            this.mcServer.SetCustomStartCommand(mcserver_conf_json_1.default.cmd);
            this.mcServer.AddEventListener(e => this.OnMcServerEvent(e));
            yield this.AuthToFirebase();
        });
    }
    ServerStateToString(state) {
        switch (state) {
            case ServerState_1.SERVER_STATE.STOPPED: return 'stopped';
            case ServerState_1.SERVER_STATE.LOADING: return 'loading';
            case ServerState_1.SERVER_STATE.RUNNING: return 'running';
        }
    }
    AuthToFirebase() {
        return __awaiter(this, void 0, void 0, function* () {
            const app = (0, app_1.initializeApp)(firebase_conf_json_1.default);
            const auth = (0, auth_1.getAuth)();
            const database = (0, database_1.getDatabase)();
            try {
                yield (0, auth_1.signInAnonymously)(auth);
                (0, auth_1.onAuthStateChanged)(auth, (user) => __awaiter(this, void 0, void 0, function* () {
                    if (!user)
                        return;
                    const serverName = this.mcServer.GetName();
                    const state = 'stopped';
                    this.serverStateRef = (0, database_1.ref)(database, `server-state/${serverName}`);
                    this.serverLogRef = (0, database_1.ref)(database, `server-log`);
                    yield (0, database_1.set)(this.serverStateRef, { state });
                    yield (0, database_1.set)(this.serverLogRef, {});
                }));
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    OnMcServerEvent(e) {
        const dispatcher = new EventDispatcher_1.default(e);
        dispatcher.Dispatch(Event_1.McServerStateChangedEvent, e => this.OnMcServerStateChanged(e));
        dispatcher.Dispatch(Event_1.McConsoleEvent, e => this.OnMcConsoleOut(e));
    }
    OnMcServerStateChanged(e) {
        const state = this.ServerStateToString(e.state);
        (0, database_1.set)(this.serverStateRef, { state });
    }
    OnMcConsoleOut(e) {
        const database = (0, database_1.getDatabase)();
        const cmdReference = (0, database_1.ref)(database, `server-log/${this.cmdId}`);
        this.cmdId++;
        (0, database_1.set)(cmdReference, e.data);
    }
    OnGetProperties() {
        return __awaiter(this, void 0, void 0, function* () {
            return dolphin_1.Response.Json(this.mcServer.GetServerProperties());
        });
    }
    OnGetBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            return dolphin_1.Response.Json(this.mcServer.GetBuffer());
        });
    }
    OnServerCommand(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mcServer.Write(cmd);
                return dolphin_1.Response.Ok();
            }
            catch (e) {
                return dolphin_1.Response.Unauthorized();
            }
        });
    }
    OnServerStart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cmdId = 0;
            yield (0, database_1.set)(this.serverLogRef, {});
            try {
                this.mcServer.Start();
                return dolphin_1.Response.Ok();
            }
            catch (e) {
                return dolphin_1.Response.Unauthorized();
            }
        });
    }
    OnServerStop() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mcServer.Stop();
                return dolphin_1.Response.Ok();
            }
            catch (e) {
                return dolphin_1.Response.Unauthorized();
            }
        });
    }
};
__decorate([
    dolphin_1.Get,
    (0, dolphin_1.Route)("/properties")
], McServerService.prototype, "OnGetProperties", null);
__decorate([
    dolphin_1.Get,
    (0, dolphin_1.Route)("/buffer")
], McServerService.prototype, "OnGetBuffer", null);
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/command"),
    __param(0, (0, dolphin_1.WebString)("cmd"))
], McServerService.prototype, "OnServerCommand", null);
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/start")
], McServerService.prototype, "OnServerStart", null);
__decorate([
    dolphin_1.Post,
    (0, dolphin_1.Route)("/stop")
], McServerService.prototype, "OnServerStop", null);
McServerService = __decorate([
    (0, dolphin_1.Service)("mc-server-service", "/mc-server", service_conf_json_1.default.mc_server.ip, service_conf_json_1.default.mc_server.port)
], McServerService);
exports.default = McServerService;
