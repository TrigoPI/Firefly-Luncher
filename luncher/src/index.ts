import appConf from "../conf.json"

import * as IO from "socket.io";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import { Server, createServer } from "http";
import { launch } from "@xmcl/core"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

import Logger from "./Logger";
import { ClientConf, Mod, ModList } from "shared/types/minecraft"
import { ForgeInstaller, McInstaller } from "./McInstaller";
import { DownloadFile, Get, GetAppData } from "./Utils";
import { ChildProcess } from "child_process";
import { mkdir, rm } from "fs/promises";

const logger: Logger = new Logger("MAIN");

const port: number = 3000;
const host: string = "localhost"; 

const appdata: string = GetAppData();
const appdir: string = `${appdata}/firefly-luncher`

const app: Express = express();
const server: Server = createServer(app);

const origin: string = `*`;
const io: IO.Server = new IO.Server(server, { cors: { origin }});
const total_step: number = 4;

let socket: IO.Socket | undefined = undefined;

logger.SetLogPath(`${appdir}/logs/log.txt`);
logger.WriteLog(true);

function ClearLog(): void {
    writeFileSync(`${appdir}/logs/log.txt`, "");
}

function CreateAppDirectory(): void {
    const dirs: string[] = Object.keys(appConf.dirs);
    for (const key of dirs) {
        const dir: string = `${appdir}/${appConf.dirs[key]}`;
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }
}

async function StartHttpServer(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        app.use(express.json());
        app.use(cors());
    
        app.post("/play", async (req: Request, res: Response) => {
            StartMinecraft();
            res.status(200).send();
        });
        
        app.post("/close", async (req: Request, res: Response) => {
            res.status(200).send().addListener('finish', () => {
                logger.Info("Closing socket server");
                io.close();
    
                logger.Info("Closing http server");
                server.close();
            });
        });

        io.on('connection', (sock: IO.Socket) => {
            logger.Info(`new connection ${sock.id}`);
            sock.on('disconnect', () => logger.Info(`disconnected ${sock.id}`));
            socket = sock;
            resolve();
        });
    
        server.listen(port, host, () => {
            logger.Info(`Server started on ${host}:${port}`);
        });
    });
}

async function GetClientConf(): Promise<ClientConf> {
    const [res, err] = await Get<ClientConf>("http://localhost:8080/api/client-conf", "json");
    
    if (err) {
        if (existsSync(`${appdir}/${appConf.dirs.mc_versions_files}/game.json`)) {
            const buffer: Buffer = readFileSync(`${appdir}/${appConf.dirs.mc_versions_files}/game.json`);
            return JSON.parse(buffer.toString());
        } else {
            logger.Error("Aucune configuration trouvé en offline");
            throw new Error("Aucune version du jeu est installé en mode offline");
        }
    }
    
    const resString: string = JSON.stringify(res);
    const buffer: Buffer = Buffer.from(resString);
    writeFileSync(`${appdir}/${appConf.dirs.mc_versions_files}/game.json`, buffer);

    return res
}

async function GetMods(): Promise<Mod[] | undefined> {
    const [res, err] = await Get<ModList>("http://localhost:8080/api/mods/list", "json");
    if (err) return undefined;
    return res.client;
}

async function InstallMinecraft(): Promise<void> {
    const mcInstaller: McInstaller = new McInstaller();
    const conf: ClientConf = await GetClientConf();
    const mcSize: number = conf.mc_size;
    
    let mcAdvencement: number = 0;
    
    mcInstaller.AddStepCallback((s: number) => {
        mcAdvencement += s;
        
        const advancement = mcAdvencement / mcSize;
        const sizeMb: number = Math.floor((conf.mc_size / 1000000) * 10) / 10;
        const advancementMb: number = Math.floor((mcAdvencement / 1000000) * 10) / 10;
        const display: string = `${advancementMb} / ${sizeMb}Mb`;
        const step: number = 0;
        
        socket.emit('step', { display, advancement, total_step, step});
    });
    
    
    mcInstaller.SetSavedFilePath(`${appdir}/${appConf.dirs.mc_versions_files}`);
    await mcInstaller.InstallVersion(conf.version, `${appdir}/${appConf.dirs.versions}/${conf.name}`, "windows");
}

async function InstalForge(): Promise<void> {
    const forgeInstaller: ForgeInstaller = new ForgeInstaller();
    const conf: ClientConf = await GetClientConf();
    const forgeSize: number = conf.forge_size;        

    let forgeAdvencement: number = 0;

    forgeInstaller.AddStepCallback((s: number, step: string) => {
        if (step == "lib") {
            const advancement = forgeAdvencement / forgeSize;
            const sizeMb: number = Math.floor((forgeSize / 1000000) * 10) / 10;
            const advancementMb: number = Math.floor((forgeAdvencement / 1000000) * 10) / 10;
            const display: string = `${advancementMb} / ${sizeMb}Mb`;
            const step: number = 1;

            socket.emit('step', { display, advancement, total_step, step});
        }

        if (step == "processor") {
            const advancement = s / conf.processors;
            const display: string = `Processor : ${s} / ${conf.processors}`;
            const step: number = 2;

            socket.emit('step', { display, advancement, total_step, step});
        }
    });

    await forgeInstaller.InstallVersion(conf.version, conf.forge, `${appdir}/${appConf.dirs.versions}/${conf.name}`);
}

async function InstallMods(): Promise<void> {
    const conf: ClientConf = await GetClientConf();
    const mods: Mod[] | undefined = await GetMods();
    const modsPath: string = `${appdir}/${appConf.dirs.versions}/${conf.name}/mods`;
    if (!mods) return;

    await rm(modsPath, { recursive: true });
    await mkdir(modsPath);

    const modsEnable: Mod[] = mods.filter((mod: Mod) => mod.enable);

    for (let i = 0; i < modsEnable.length; i++) {
        const mod: Mod = modsEnable[i];
        const display: string = `Mods: ${i} / ${modsEnable.length}`;
        const advancement: number = i;
        const step: number = 3;

        await DownloadFile(`http://localhost:8080/api/mods/download/${mod.name}`, modsPath, mod.name);
        socket.emit('step', { display, advancement, total_step, step});
    }
}

async function LunchMinecraft(): Promise<void> {
    const conf: ClientConf = await GetClientConf();
    const process: ChildProcess = await launch({ version: conf.fullname, gamePath: `${appdir}/${appConf.dirs.versions}/${conf.name}`, javaPath: "java" });
        
    process.on("spawn", () => {
        socket.emit("start")
    });

    process.stdout.on("data", (chunk: Buffer) => {
        const msg: string = chunk.toString().replace("\r\n", "");
        logger.Print(msg);
    });

    process.on("exit", () => {
        logger.Print("Closing backend");
        io.disconnectSockets();
        io.close();

        server.closeAllConnections();
        server.close();
    });
}

async function StartMinecraft(): Promise<void> {
    try {        
        const conf: ClientConf = await GetClientConf();
        if (!existsSync(`${appdir}/${appConf.dirs.versions}/${conf.name}`)) mkdirSync(`${appdir}/${appConf.dirs.versions}/${conf.name}`);

        await InstallMinecraft();
        await InstalForge();
        await InstallMods();
        await LunchMinecraft();

    } catch (e: any) {
        logger.Error(e);
        if (e.stack) logger.Error(e.stack)

        socket.emit("backend-error", "Une erreur est survenue lors de l'installation :\r\n" + e + "\r\n" + e.stack);
    }
}

(async () => {
    CreateAppDirectory();
    ClearLog();

    await StartHttpServer();
})();