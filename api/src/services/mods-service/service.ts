import serverConf from "../../../conf/app.conf.json"
import serviceConf from "../../../conf/service.conf.json";

import { Get, Post, Response, Route, Service, ServiceClass, WebObject, WebString } from "dolphin";
import { ModList, Mod, ModSide } from "shared/types/minecraft"
import { readdir, rename, rm } from "fs/promises";

@Service("mods-service", "/mods", serviceConf.mods_service.ip, serviceConf.mods_service.port)
export default class ModsService extends ServiceClass {
    private serverFolderPath: string;
    private clientFolderPath: string;
    private mods: ModList;

    public override async OnStart(): Promise<void> {
        this.serverFolderPath = `${serverConf.app_path}/server`;
        this.clientFolderPath = `${serverConf.app_path}/client`;
        this.mods = await this.GetMods();
    }

    private FindMod(name: string, side: ModSide): Mod | undefined {
        const mods: Mod[] = (side == "client")? this.mods.client : this.mods.server;
        const index: number = mods.findIndex((mod: Mod) => mod.name == name);
        if (index == -1) return undefined;
        return mods[index];
    }

    private async GetMods(): Promise<ModList> {
        const serverModsEnable: Mod[] = (await readdir(`${this.serverFolderPath}/mods`)).map((name: string) => {
            const enable: boolean = true;
            const side: ModSide = 'server';
            return { name, enable, side };
        });

        const serverModsDisable: Mod[] = (await readdir(`${this.serverFolderPath}/disable`)).map((name: string) => {
            const enable: boolean = false;
            const side: ModSide = 'server';
            return { name, enable, side };
        });

        const clientModsEnable: Mod[] = (await readdir(`${this.clientFolderPath}/mods`)).map((name: string) => {
            const enable: boolean = true;
            const side: ModSide = 'client';
            return { name, enable, side };
        });

        const clientModsDisable: Mod[] = (await readdir(`${this.clientFolderPath}/disable`)).map((name: string) => {
            const enable: boolean = false;
            const side: ModSide = 'client';
            return { name, enable, side };
        });

        const client: Mod[] = [ ...clientModsEnable, ...clientModsDisable ];
        const server: Mod[] = [ ...serverModsEnable, ...serverModsDisable ];

        return { client, server };
    }

    @Get
    @Route("/list")
    public async OnGetMods(): Promise<Response> {
        return Response.Json<ModList>(this.mods);
    }

    @Get
    @Route("/:side/:name")
    public async OnGetMod(
        @WebString("side") side: string,
        @WebString("name") name: string
    ): Promise<Response> {
        if (side != "client" && side != "server") return Response.NotFound();
        const mod: Mod | undefined = this.FindMod(name, side);
        if (!mod) return Response.NotFound();
        return Response.Json(mod);
    }

    @Post
    @Route("/add")
    public async OnModAdded(
        @WebObject("mods-data") modsData: Record<string, string[]>
    ): Promise<Response> {
        for (const name of modsData.client) {
            const side: ModSide = "client";
            const enable: boolean = true;
            this.mods.client.push({ name, side, enable });
        } 

        for (const name of modsData.server) {
            const side: ModSide = "server";
            const enable: boolean = true;
            this.mods.server.push({ name, side, enable });
        } 

        return Response.Ok();
    }

    @Post
    @Route("/delete/:side/:name")
    public async OnModDeleted(
        @WebString("name") name: string,
        @WebString("side") side: string
    ): Promise<Response> {
        if (side != "client" && side != "server") return Response.NotFound();
        
        const mod: Mod | undefined = this.FindMod(name, side);
        if (!mod) return Response.NotFound();

        const path: string = `${(side == "client")? this.clientFolderPath : this.serverFolderPath}/${mod.enable? "mods" : "disable"}`;
        await rm(`${path}/${name}`);
        
        this.mods = await this.GetMods();

        return Response.Ok();
    }

    @Post
    @Route("/disable/:side/:name")
    public async OnModDisabled(
        @WebString("side") side: string,
        @WebString("name") name: string
    ): Promise<Response> {
        if (side != "client" && side != "server") return Response.NotFound();

        const mod: Mod | undefined = this.FindMod(name, side);
        const path: string = (side == "client")? this.clientFolderPath : this.serverFolderPath;
        if (!mod) return Response.NotFound();
        
        try {
            mod.enable = false;
            await rename(`${path}/mods/${name}`, `${path}/disable/${name}`);
            return Response.Ok();
        } catch (e: any) {
            console.log(e);
            return Response.InternalServerError();
        }
    }

    @Post
    @Route("/enable/:side/:name")
    public async OnModEnable(
        @WebString("side") side: string,
        @WebString("name") name: string
    ): Promise<Response> {
        if (side != "client" && side != "server") return Response.NotFound();

        const mod: Mod | undefined = this.FindMod(name, side);
        const path: string = (side == "client")? this.clientFolderPath : this.serverFolderPath;
        if (!mod) return Response.NotFound();        
        
        try {
            mod.enable = true;
            await rename(`${path}/disable/${name}`, `${path}/mods/${name}`);
            return Response.Ok();
        } catch (e: any) {
            console.log(e);
            return Response.InternalServerError();
        }
    }
}