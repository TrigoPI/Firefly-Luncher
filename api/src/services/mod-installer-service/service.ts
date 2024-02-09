import mcServerConf from "../../../conf/mcserver.conf.json";
import serviceConf from "../../../conf/service.conf.json";
import appConf from "../../../conf/app.conf.json"


import { existsSync } from "fs";
import { copyFile, readdir, rm } from "fs/promises";
import { Logger, Post, Response, Route, Service, ServiceClass, WebObject } from "dolphin";
import { Mod } from "shared/types/minecraft";

@Service("mod-installer-service", "/installer", serviceConf.mod_installer.ip, serviceConf.mod_installer.port)
export default class ModInstallerService extends ServiceClass {
    private modsPath: string;
    private logger: Logger;

    public override async OnStart(): Promise<void> {
        this.modsPath = `${mcServerConf.path}/mods`;
        this.logger = new Logger("mod-installer-service");
    }

    private async GetMods(): Promise<string[]> {
        return await readdir(this.modsPath);
    }

    @Post
    @Route("/install/mods")
    public async OnServerStart(
        @WebObject("mods") mods: Mod[]
    ): Promise<Response> {
        const serverMods: string[] = await this.GetMods();

        for (const modName of serverMods) {
            await rm(`${this.modsPath}/${modName}`);
        }

        for (const mod of mods) {
            const modName: string = `${mod.name.replace(".jar", "")}-server-enable.jar`;
            if (existsSync(`${appConf.app_path}/mods/${modName}`)) {
                await copyFile(`${appConf.app_path}/mods/${modName}`, `${this.modsPath}/${mod.name}`);
            } else {
                this.logger.Warning(`Cannot find mod ${modName}`);
            }
        }

        return Response.Ok();
    }
}