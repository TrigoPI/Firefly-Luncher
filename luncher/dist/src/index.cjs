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
const conf_json_1 = __importDefault(require("../conf.json"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const core_1 = require("@xmcl/core");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const IO = __importStar(require("socket.io"));
const cors_1 = __importDefault(require("cors"));
const Logger_cjs_1 = __importDefault(require("./Logger.cjs"));
const McInstaller_cjs_1 = require("./McInstaller.cjs");
const Utils_cjs_1 = require("./Utils.cjs");
const logger = new Logger_cjs_1.default("MAIN");
const port = 3000;
const host = "localhost";
const appdata = (0, Utils_cjs_1.GetAppData)();
const appdir = `${appdata}/firefly-luncher`;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const origin = `*`;
const io = new IO.Server(server, { cors: { origin } });
const total_step = 4;
let socket = undefined;
logger.SetLogPath(`${appdir}/logs/log.txt`);
logger.WriteLog(true);
function ClearLog() {
    (0, fs_1.writeFileSync)(`${appdir}/logs/log.txt`, "");
}
function CreateAppDirectory() {
    const dirs = Object.keys(conf_json_1.default.dirs);
    for (const key of dirs) {
        const dir = `${appdir}/${conf_json_1.default.dirs[key]}`;
        if (!(0, fs_1.existsSync)(dir)) {
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        }
    }
}
function StartHttpServer() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            app.use(express_1.default.json());
            app.use((0, cors_1.default)());
            app.post("/play", (req, res) => __awaiter(this, void 0, void 0, function* () {
                StartMinecraft();
                res.status(200).send();
            }));
            app.post("/close", (req, res) => __awaiter(this, void 0, void 0, function* () {
                res.status(200).send().addListener('finish', () => {
                    logger.Info("Closing socket server");
                    io.close();
                    logger.Info("Closing http server");
                    server.close();
                });
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
        const [res, err] = yield (0, Utils_cjs_1.Get)("http://localhost:8080/api/client-conf", "json");
        if (err) {
            if ((0, fs_1.existsSync)(`${appdir}/game.json`)) {
                const buffer = (0, fs_1.readFileSync)(`${appdir}/game.json`);
                return JSON.parse(buffer.toString());
            }
            else {
                logger.Error("Aucune configuration trouvé en offline");
                throw new Error("Aucune version du jeu est installé en mode offline");
            }
        }
        const resString = JSON.stringify(res);
        const buffer = Buffer.from(resString);
        (0, fs_1.writeFileSync)(`${appdir}/game.json`, buffer);
        return res;
    });
}
function GetMods() {
    return __awaiter(this, void 0, void 0, function* () {
        const [res, err] = yield (0, Utils_cjs_1.Get)("http://localhost:8080/api/mods/list", "json");
        if (err)
            return undefined;
        return res.client;
    });
}
function InstallMinecraft() {
    return __awaiter(this, void 0, void 0, function* () {
        const conf = yield GetClientConf();
        const mcInstaller = new McInstaller_cjs_1.McInstaller(conf.version, "windows", `${appdir}/versions/${conf.name}`);
        const mcSize = yield mcInstaller.GetSize();
        let mcAdvencement = 0;
        mcInstaller.AddStepCallback((s) => {
            mcAdvencement += s;
            const advancement = mcAdvencement / mcSize;
            const sizeMb = Math.floor((mcSize / 1000000) * 10) / 10;
            const advancementMb = Math.floor((mcAdvencement / 1000000) * 10) / 10;
            const display = `${advancementMb} / ${sizeMb}Mb`;
            const step = 0;
            socket.emit('step', { display, advancement, total_step, step });
        });
        yield mcInstaller.InstallVersion();
    });
}
function InstalForge() {
    return __awaiter(this, void 0, void 0, function* () {
        const conf = yield GetClientConf();
        const forgeInstaller = new McInstaller_cjs_1.ForgeInstaller(conf.version, conf.forge, `${appdir}/versions/${conf.name}`);
        const forgeSize = yield forgeInstaller.GetSize();
        const processor = yield forgeInstaller.GetNumberOfClientProcessor();
        let forgeAdvencement = 0;
        forgeInstaller.AddStepCallback((s, step) => {
            if (step == "lib") {
                const advancement = forgeAdvencement / forgeSize;
                const sizeMb = Math.floor((forgeSize / 1000000) * 10) / 10;
                const advancementMb = Math.floor((forgeAdvencement / 1000000) * 10) / 10;
                const display = `${advancementMb} / ${sizeMb}Mb`;
                const step = 1;
                socket.emit('step', { display, advancement, total_step, step });
            }
            if (step == "processor") {
                const advancement = s / processor;
                const display = `Processor : ${s} / ${processor}`;
                const step = 2;
                socket.emit('step', { display, advancement, total_step, step });
            }
        });
        yield forgeInstaller.InstallVersion();
    });
}
function InstallMods() {
    return __awaiter(this, void 0, void 0, function* () {
        const conf = yield GetClientConf();
        const mods = yield GetMods();
        const modsPath = `${appdir}/${conf_json_1.default.dirs.versions}/${conf.name}/mods`;
        if (!mods)
            return;
        if ((0, fs_1.existsSync)(modsPath))
            yield (0, promises_1.rm)(modsPath, { recursive: true });
        yield (0, promises_1.mkdir)(modsPath);
        const modsEnable = mods.filter((mod) => mod.enable);
        for (let i = 0; i < modsEnable.length; i++) {
            const mod = modsEnable[i];
            const display = `Mods: ${i} / ${modsEnable.length}`;
            const advancement = i;
            const step = 3;
            yield (0, Utils_cjs_1.DownloadFile)(`http://localhost:8080/api/mods/download/${mod.name}`, modsPath, mod.name);
            socket.emit('step', { display, advancement, total_step, step });
        }
    });
}
function LunchMinecraft() {
    return __awaiter(this, void 0, void 0, function* () {
        const conf = yield GetClientConf();
        const process = yield (0, core_1.launch)({ version: conf.fullname, gamePath: `${appdir}/${conf_json_1.default.dirs.versions}/${conf.name}`, javaPath: "java" });
        process.on("spawn", () => {
            socket.emit("start");
        });
        process.stdout.on("data", (chunk) => {
            const msg = chunk.toString().replace("\r\n", "");
            logger.Print(msg);
        });
        process.on("exit", () => {
            logger.Print("Closing backend");
            io.disconnectSockets();
            io.close();
            server.closeAllConnections();
            server.close();
        });
    });
}
function StartMinecraft() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const conf = yield GetClientConf();
            if (!(0, fs_1.existsSync)(`${appdir}/${conf_json_1.default.dirs.versions}/${conf.name}`))
                (0, fs_1.mkdirSync)(`${appdir}/${conf_json_1.default.dirs.versions}/${conf.name}`);
            yield InstallMinecraft();
            yield InstalForge();
            yield InstallMods();
            yield LunchMinecraft();
        }
        catch (e) {
            logger.Error(e);
            if (e.stack)
                logger.Error(e.stack);
            socket.emit("backend-error", "Une erreur est survenue lors de l'installation :\r\n" + e + "\r\n" + e.stack);
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    CreateAppDirectory();
    ClearLog();
    yield StartHttpServer();
}))();
