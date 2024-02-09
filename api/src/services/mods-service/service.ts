import serverConf from "../../../conf/app.conf.json"
import serviceConf from "../../../conf/service.conf.json";

import { Get, Post, Response, Route, Service, ServiceClass, WebObject, WebString } from "dolphin";
import { ModList, Mod, ModSide } from "shared/types/minecraft"
import { readdir, rename, rm } from "fs/promises";

@Service("mods-service", "/mods", serviceConf.mods_service.ip, serviceConf.mods_service.port)
export default class ModsService extends ServiceClass {
    private modsPath: string;
    private mods: ModList;

    public override async OnStart(): Promise<void> {
        this.modsPath = serverConf.app_path + "/mods";
        this.mods = await this.GetMods();
    }

    private FindMod(name: string, side: ModSide): Mod | undefined {
        const mods: Mod[] = (side == "client")? this.mods.client : this.mods.server;
        const index: number = mods.findIndex((mod: Mod) => mod.name == name);
        if (index == -1) return undefined;
        return mods[index];
    }

    private GetModWithoutExtension(mod: Mod): string {
        return mod.name.replace(".jar", "");
    }

    private ModEnableToString(mod: Mod): string {
        return mod.enable? "enable" : "disable";
    }

    private async GetMods(): Promise<ModList> {
        const client: Mod[] = [];
        const server: Mod[] = [];
        
        (await readdir(this.modsPath)).forEach((nameRaw: string) => {
            const nameSplit: string[] = nameRaw.split(".");
            const desc: string[] = nameSplit[nameSplit.length - 2].split("-");
            const side: ModSide = <ModSide>desc[desc.length - 2];
            const enable: boolean = desc[desc.length - 1] == "enable";
            const name: string = nameRaw.replace(`-${side}-${desc[desc.length - 1]}`, "");

            let arrayPtr: Mod[] = (side == "client")? client : server;

            arrayPtr.push({ name, side, enable });
        });

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
    public async OnModAdded(): Promise<Response> {
        this.mods = await this.GetMods();
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

        const enableString: string = this.ModEnableToString(mod);
        const modName: string = this.GetModWithoutExtension(mod);

        await rm(`${this.modsPath}/${modName}-${side}-${enableString}.jar`);
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
        if (!mod) return Response.NotFound();

        const enableString: string = this.ModEnableToString(mod);
        const modName: string = this.GetModWithoutExtension(mod);
        
        try {
            mod.enable = false;
            await rename(`${this.modsPath}/${modName}-${side}-${enableString}.jar`, `${this.modsPath}/${modName}-${side}-disable.jar`);
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
        if (!mod) return Response.NotFound();

        const enableString: string = this.ModEnableToString(mod);
        const modName: string = this.GetModWithoutExtension(mod);

        try {
            mod.enable = true;
            await rename(`${this.modsPath}/${modName}-${side}-${enableString}.jar`, `${this.modsPath}/${modName}-${side}-enable.jar`);
            return Response.Ok();
        } catch (e: any) {
            console.log(e);
            return Response.InternalServerError();
        }
    }
}