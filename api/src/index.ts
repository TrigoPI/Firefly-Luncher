import serverConf from "../conf/app.conf.json"

import path from "path";
import { EntryPoint, ServiceLuncher } from "dolphin";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";

@EntryPoint(path.resolve(".", "services"))
export default class Main {
    public async Start() {
        const luncher: ServiceLuncher = ServiceLuncher.GetInstance();
        
        await this.CreateAppFolder();
        await luncher.LoadServices();
        await luncher.StartAllService();
    }

    private async CreateAppFolder(): Promise<void> {
        if (!existsSync(`${serverConf.app_path}/server`)) await mkdir(`${serverConf.app_path}/server`);
        if (!existsSync(`${serverConf.app_path}/client`)) await mkdir(`${serverConf.app_path}/client`);

        if (!existsSync(`${serverConf.app_path}/server/mods`))    await mkdir(`${serverConf.app_path}/server/mods`);
        if (!existsSync(`${serverConf.app_path}/server/disable`)) await mkdir(`${serverConf.app_path}/server/disable`);

        if (!existsSync(`${serverConf.app_path}/client/mods`))    await mkdir(`${serverConf.app_path}/client/mods`);
        if (!existsSync(`${serverConf.app_path}/client/disable`)) await mkdir(`${serverConf.app_path}/client/disable`);
    }

    public static async CreateApplication(): Promise<void> {
        const app: Main = new Main();
        await app.Start();
    }
}