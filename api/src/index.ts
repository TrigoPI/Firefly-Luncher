import serverConf from "../conf/mcserver.conf.json";

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
        if (!existsSync(`${serverConf.path}/${serverConf.name}/mods`)) await mkdir(`${serverConf.path}/${serverConf.name}/mods`, { recursive: true });
    }

    public static async CreateApplication(): Promise<void> {
        const app: Main = new Main();
        await app.Start();
    }
}