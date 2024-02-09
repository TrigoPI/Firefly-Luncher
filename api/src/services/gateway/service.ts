import serviceConf from "../../../conf/service.conf.json";

import { FileFormEncoded, Get, MediaType, Post, Response, Route, Service, ServiceClass, WebObject, WebString } from "dolphin";
import { ModList, Mod, ModSide } from "shared/types/minecraft"
import { RestClient } from "rest-client";

@Service("gateway", "/api", serviceConf.gateway.ip, serviceConf.gateway.port)
export default class GatewayService extends ServiceClass {
    private GetMod(mod: Mod[], name: string): Mod | undefined {
        return mod.find((value: Mod) => value.name == name);
    }

    @Get
    @Route("/client-conf")
    public async OnGetClientConf(): Promise<Response> {
        const [res, err] = await RestClient.Get(serviceConf.client_conf.url);
        if (err) return new Response(err.body, MediaType.PLAIN_HTML, err.code);
        return Response.Json(res.Json()); 
    }

    @Get
    @Route("/server/properties")
    public async OnGetProperties(): Promise<Response> {
        const [res, err] = await RestClient.Get(`${serviceConf.mc_server.url}/properties`);
        if (err) return new Response(err.body, MediaType.PLAIN_HTML, err.code);
        return Response.Json(res.Json()); 
    }

    @Get
    @Route("/server/buffer")
    public async OnGetBuffer(): Promise<Response> {
        const [res, err] = await RestClient.Get(`${serviceConf.mc_server.url}/buffer`);
        if (err) return new Response(err.body, MediaType.PLAIN_HTML, err.code);
        return Response.Json(res.Json()); 
    }

    @Post
    @Route("/server/command")
    public async OnServerCommand(
        @WebString("cmd") cmd: string
    ): Promise<Response> {
        const [_, err] = await RestClient.Post(`${serviceConf.mc_server.url}/command`, { cmd });
        if (err) return new Response(err.body, MediaType.PLAIN_HTML, err.code);
        return Response.Ok()
    }

    @Post
    @Route("/server/:action")
    public async OnMcServerStart(
        @WebString("action") action: "start" | "stop"
    ): Promise<Response> {
        if (action != "start" && action != "stop") return Response.NotFound();

        if (action == "start") {
            const [modListRes, modListErr] = await RestClient.Get(`${serviceConf.mods_service.url}/list`);
            if (modListErr) return new Response(modListErr.body, MediaType.PLAIN_HTML, modListErr.code);

            const modList: ModList = modListRes.Json<ModList>();
            const mods: Mod[] = modList.server;
            const [_1, installErr] = await RestClient.Post(`${serviceConf.mod_installer.url}/install/mods`, { mods });
            if (installErr) return new Response(installErr.body, MediaType.PLAIN_HTML, installErr.code);
        }

        const [_2, startErr] = await RestClient.Post(`${serviceConf.mc_server.url}/${action}`);
        if (startErr) return new Response(startErr.body, MediaType.PLAIN_HTML, startErr.code);

        return Response.Ok();
    }

    @Post
    @Route("/mod/:action/:side/:name")
    public async OnModEnableOrDisable(
        @WebString("action") action: 'enable' | 'disable' | 'delete',
        @WebString("side") side: ModSide,
        @WebString("name") name: string
    ): Promise<Response> {
        if (action != 'enable' && action != 'disable' && action != 'delete') return Response.NotFound();
        const [_, err] = await RestClient.Post(`${serviceConf.mods_service.url}/${action}/${side}/${name}`); 
        if (err) return new Response(err.body, MediaType.PLAIN_TEXT, err.code);
        return Response.Ok();
    }

    @Post
    @Route("/mods/add")
    @FileFormEncoded("jar", true)
    public async OnModsAdded(
        @WebString("side") side: string,
        @WebObject("jar") files: Record<string, any>[] 
    ): Promise<Response> {
        const [modListRes, modListErr] = await RestClient.Get(`${serviceConf.mods_service.url}/list`);
        if (modListErr) return Response.InternalServerError();

        const modList: ModList = modListRes.Json<ModList>();
        const formData: FormData = new FormData();
        const newClientMod: string[] = [];
        const newServerMod: string[] = [];

        for (const file of files) {
            formData.append("jar", new Blob([file.buffer]), file.originalname);

            for (const modSide of side.split(";")) {
                if (modSide == "client") {
                    const mod: Mod | undefined = this.GetMod(modList.client, file.originalname);
                    if (!mod) newClientMod.push(file.originalname);
                }

                if (modSide == "server") {
                    const mod: Mod | undefined = this.GetMod(modList.server, file.originalname);
                    if (!mod) newServerMod.push(file.originalname);
                }
            }
        }

        const modsData: Record<string, any> = { client: newClientMod, server: newServerMod };
        formData.append("mods-data", JSON.stringify(modsData));

        const [uploadRes, uploadErr] = await RestClient.PostForm(`${serviceConf.upload_service.url}/jar`, formData);
        if (uploadErr) new Response(uploadErr.body, MediaType.PLAIN_TEXT, uploadErr.code);

        const [_, addModErr] = await RestClient.Post(`${serviceConf.mods_service.url}/add`);
        if (addModErr) return new Response(addModErr.body, MediaType.PLAIN_TEXT, addModErr.code);

        return Response.Json<ModList>(uploadRes.Json<ModList>());
    }
}