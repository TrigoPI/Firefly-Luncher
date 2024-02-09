import appConf from "../luncher.conf.json";

import cors from "cors";

import axios, { ResponseType } from "axios";
import express, { Express, Request, Response } from "express";

import { Server, createServer } from "http";
import { launch } from "@xmcl/core"
import { existsSync, mkdirSync } from "fs";
import * as IO from "socket.io";

import Logger from "./Logger";

import { ClientConf } from "shared/types/minecraft"
import { ForgeInstaller, McInstaller } from "./McInstaller";
import { Forge } from "./Types";
import { Get } from "./Utils";

const port: number = 3000;
const host: string = "localhost"; 

const logger: Logger = new Logger("MAIN");
const app: Express = express();
const server: Server = createServer(app);

let socket: IO.Socket | undefined = undefined;

const io: IO.Server = new IO.Server(server, { 
    cors: { 
        origin: `http://localhost:5173`,
        credentials: true
    }
});

function CreateVersionDirectory(): void {
    if (existsSync(appConf.root)) return;
    mkdirSync(appConf.root);
}

async function StartHttpServer(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        app.use(express.json());
        app.use(cors());
    
        app.post("/play", async (req: Request, res: Response) => {
            await InstallMinecraft();
            res.status(200).send();
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
    if (err) throw err;
    return res
}

async function InstallMinecraft(): Promise<void> {
    const mcInstaller: McInstaller = new McInstaller();
    const forgeInstaller: ForgeInstaller = new ForgeInstaller();

    const conf: ClientConf = await GetClientConf();
    const size: number = await mcInstaller.GetSize(conf.version, "windows");

    let current: number = 0;

    if (!existsSync(`${appConf.root}/${conf.name}`)) mkdirSync(`${appConf.root}/${conf.name}`);

    mcInstaller.AddStepCallback((s: number) => {
        current += s;
        socket.emit('step', { current, size });
    });

    await mcInstaller.InstallVersion(conf.version, `${appConf.root}/${conf.name}`, "windows");
    launch({ version: conf.version, gamePath: `${appConf.root}/${conf.name}`,  javaPath: "java" });
}

(async () => {
    CreateVersionDirectory();
    await StartHttpServer();
})();