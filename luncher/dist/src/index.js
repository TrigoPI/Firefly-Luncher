"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
const luncher_conf_json_1 = __importDefault(require("../luncher.conf.json"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const core_1 = require("@xmcl/core");
const fs_1 = require("fs");
const IO = __importStar(require("socket.io"));
const Logger_1 = __importDefault(require("./Logger"));
const McInstaller_1 = require("./McInstaller");
const Utils_1 = require("./Utils");
const port = 3000;
const host = "localhost";
const logger = new Logger_1.default("MAIN");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
let socket = undefined;
const io = new IO.Server(server, {
    cors: {
        origin: `http://localhost:5173`,
        credentials: true
    }
});
function CreateVersionDirectory() {
    if ((0, fs_1.existsSync)(luncher_conf_json_1.default.root))
        return;
    (0, fs_1.mkdirSync)(luncher_conf_json_1.default.root);
}
function StartHttpServer() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            app.use(express_1.default.json());
            app.use((0, cors_1.default)());
            app.post("/play", (req, res) => __awaiter(this, void 0, void 0, function* () {
                yield InstallMinecraft();
                res.status(200).send();
            }));
            io.on('connection', (sock) => {
                logger.Info(`new connection ${sock.id}`);
                sock.on('disconnect', () => logger.Info(`disconnected ${sock.id}`));
                socket = sock;
                resolve();
            });
            server.listen(port, host, () => {
                logger.Info(`Server started on ${host}:${port}`);
            });
        });
    });
}
function GetClientConf() {
    return __awaiter(this, void 0, void 0, function* () {
        const [res, err] = yield (0, Utils_1.Get)("http://localhost:8080/api/client-conf", "json");
        if (err)
            throw err;
        return res;
    });
}
function InstallMinecraft() {
    return __awaiter(this, void 0, void 0, function* () {
        const mcInstaller = new McInstaller_1.McInstaller();
        const forgeInstaller = new McInstaller_1.ForgeInstaller();
        const conf = yield GetClientConf();
        const size = yield mcInstaller.GetSize(conf.version, "windows");
        let current = 0;
        if (!(0, fs_1.existsSync)(`${luncher_conf_json_1.default.root}/${conf.name}`))
            (0, fs_1.mkdirSync)(`${luncher_conf_json_1.default.root}/${conf.name}`);
        mcInstaller.AddStepCallback((s) => {
            current += s;
            socket.emit('step', { current, size });
        });
        yield mcInstaller.InstallVersion(conf.version, `${luncher_conf_json_1.default.root}/${conf.name}`, "windows");
        (0, core_1.launch)({ version: conf.version, gamePath: `${luncher_conf_json_1.default.root}/${conf.name}`, javaPath: "java" });
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    CreateVersionDirectory();
    yield StartHttpServer();
}))();
