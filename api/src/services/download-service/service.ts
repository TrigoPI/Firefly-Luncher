import serviceConf from "../../../conf/service.conf.json";
import serverConf from "../../../conf/mcserver.conf.json"

import { readdir } from "fs/promises";
import { ModList, Mod, ModSide } from "shared/types/minecraft";

import { Get, Response, Route, Service, ServiceClass, WebString } from "dolphin";

@Service("download", "/download", serviceConf.download.ip, serviceConf.download.port)
export default class DownloadService extends ServiceClass {

    private modsPath: string;

    public override async OnStart(): Promise<void> {
        this.modsPath = `${serverConf.path}/${serverConf.name}/mods`;
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

    private ModExist(mods: Mod[], name: string): boolean {
        return mods.findIndex((mod: Mod) => mod.name == name) != -1
    }

    private GetMod(mods: Mod[], name: string): Mod | undefined {
        return mods.find((mod: Mod) => mod.name == name);
    }

    @Get
    @Route("/:mod_name")
    public async OnDownloadMod(
        @WebString("mod_name") mod_name: string
    ): Promise<Response> {
        const mods: Mod[] = (await this.GetMods()).client;
        if (!this.ModExist(mods, mod_name)) return Response.NotFound();
        
        const mod: Mod | undefined = this.GetMod(mods, mod_name);
        if (!mod) return Response.NotFound();
        if (!mod.enable) return Response.NotFound();

        const path: string = `${serverConf.path}/${serverConf.name}/mods/${mod.name.replace(".jar", "")}-client-enable.jar`
        const filename: string = mod.name;
        const json: Record<string, string> = { path, filename }
        return Response.Json(json);
    }
}