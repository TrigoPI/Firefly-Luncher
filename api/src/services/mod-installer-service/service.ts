import mcServerConf from "../../../conf/mcserver.conf.json";
import serviceConf from "../../../conf/service.conf.json";
import appConf from "../../../conf/app.conf.json"


import { copyFile, readdir, rm } from "fs/promises";
import { Post, Response, Route, Service, ServiceClass, WebObject } from "dolphin";
import { Mod } from "shared/types/minecraft";

@Service("mod-installer-service", "/installer", serviceConf.mod_installer.ip, serviceConf.mod_installer.port)
export default class ModInstallerService extends ServiceClass {
    private modPath: string;
    private modsList: string[];

    public override async OnStart(): Promise<void> {
        this.modPath = `${mcServerConf.path}/mods`;
        this.modsList = await this.GetMods();
    }

    private async GetMods(): Promise<string[]> {
        return await readdir(this.modPath);
    }

    private async AddMod(name: string): Promise<void> {
        const path: string = `${appConf.app_path}/server/mods/${name}`;
        await copyFile(path, `${this.modPath}/${name}`);
    }

    private async DeleteMod(name: string): Promise<void> {
        const path: string = `${this.modPath}/${name}`;
        await rm(path);
    }

    @Post
    @Route("/install/mods")
    public async OnServerStart(
        @WebObject("mods") mods: Mod[]
    ): Promise<Response> {
        for (const mod of mods) {
            try {
                const indexOfMod: number = this.modsList.indexOf(mod.name);
                if (mod.enable) {
                    if (indexOfMod == -1) {
                        await this.AddMod(mod.name);
                        this.modsList.push(mod.name);
                    }
                } else {
                    if (indexOfMod != -1) {
                        await this.DeleteMod(mod.name);
                        this.modsList.splice(indexOfMod, 1);
                    }
                }
            } catch (e: any) {
                console.log(`Error while trying to install/remove ${mod.name}`);
            }
        }

        const modToRemove = this.modsList.filter((name: string) => { 
            return mods.find((mod: Mod) => mod.name == name) == undefined;
        });

        for (const name of modToRemove) {
            const index: number = this.modsList.indexOf(name);
            this.modsList.splice(index, 1);
            await this.DeleteMod(name);
        }

        return Response.Ok();
    }
}