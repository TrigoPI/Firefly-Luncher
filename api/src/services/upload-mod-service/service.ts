import serverConf from "../../../conf/app.conf.json"
import serviceConf from "../../../conf/service.conf.json";

import { Mod } from "shared/types/minecraft";
import { FileFormEncoded, Post, Response, Route, Service, ServiceClass, WebObject, WebString } from "dolphin";
import { appendFile, writeFile } from "fs/promises";

@Service("upload-mod-service", "/upload", serviceConf.upload_service.ip, serviceConf.upload_service.port)
export default class UploadModService extends ServiceClass {
    private serverFolderPath: string;
    private clientFolderPath: string;

    public override async OnStart(): Promise<void> {
        this.serverFolderPath = `${serverConf.app_path}/server`;
        this.clientFolderPath = `${serverConf.app_path}/client`;
    }

    private GetFile(mod: any[], name: string): any | undefined {
        return mod.find((value: any) => value.originalname == name);
    }

    private async CreateJar(filename: string, buffer: Buffer): Promise<void> {
        await appendFile(filename, "");
        await writeFile(filename, buffer);
    }

    @Post
    @Route("/jar")
    @FileFormEncoded("jar", true)
    public async OnUpload(
        @WebString("mods-data") modsData: string,
        @WebObject("jar") files: Record<string, any>[]
    ): Promise<Response> {        
        try {
            const modsDataJson: Record<string, string[]> = JSON.parse(modsData);
            const client: Mod[] = [];
            const server: Mod[] = [];

            for (const modName of modsDataJson.client) {
                const file: any | undefined = this.GetFile(files, modName);
                if (file) {
                    await this.CreateJar(`${this.clientFolderPath}/mods/${file.originalname}`, file.buffer);
                    client.push({
                        name: file.originalname,
                        side: "client",
                        enable: true
                    });
                }
            } 
    
            for (const modName of modsDataJson.server) {
                const file: any | undefined = this.GetFile(files, modName);
                if(file) {
                    await this.CreateJar(`${this.serverFolderPath}/mods/${file.originalname}`, file.buffer);
                    server.push({
                        name: file.originalname,
                        side: "server",
                        enable: true
                    });
                }
            } 

            return Response.Json({ client, server });
        } catch (e: any) {
            return Response.InternalServerError();
        }
    }
}