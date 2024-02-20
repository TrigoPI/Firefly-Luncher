import serverConf from "../../../conf/mcserver.conf.json"
import serviceConf from "../../../conf/service.conf.json";


import { existsSync } from "fs";
import { copyFile, readdir, rm } from "fs/promises";
import { Get, Logger, Post, Response, Route, Service, ServiceClass, WebObject, WebString } from "dolphin";
import { Mod } from "shared/types/minecraft";

@Service("mod-installer-service", "/installer", serviceConf.mod_installer.ip, serviceConf.mod_installer.port)
export default class ModInstallerService extends ServiceClass {
    private modsPath: string;
    private serverPath: string;
    private logger: Logger;

    public override async OnStart(): Promise<void> {
        this.serverPath = `${serverConf.path}/${serverConf.name}/${serverConf.version}`
        this.modsPath = `${serverConf.path}/${serverConf.name}/mods`;
        this.logger = new Logger("mod-installer-service");
    }

    private async GetMods(): Promise<string[]> {
        return await readdir(`${this.serverPath}/mods`);
    }

    @Post
    @Route("/install/mods")
    public async OnServerStart(
        @WebObject("mods") mods: Mod[]
    ): Promise<Response> {
        const serverMods: string[] = await this.GetMods();

        for (const modName of serverMods) {
            await rm(`${this.serverPath}/mods/${modName}`);
        }

        for (const mod of mods) {
            const modName: string = `${mod.name.replace(".jar", "")}-server-enable.jar`;
            if (existsSync(`${this.modsPath}/${modName}`)) {
                await copyFile(`${this.modsPath}/${modName}`, `${this.serverPath}/mods/${mod.name}`);
            } else {
                this.logger.Warning(`Cannot find mod ${modName}`);
            }
        }

        return Response.Ok();
    }
}