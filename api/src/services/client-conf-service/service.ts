import { ClientConf } from "shared/types/minecraft";
import clientConf from "../../../conf/client.conf.json";
import serviceConf from "../../../conf/service.conf.json";

import { Get, Response, Route, Service, ServiceClass } from "dolphin";

@Service("client-conf", "/client-conf", serviceConf.client_conf.ip, serviceConf.client_conf.port)
export default class ClientConfService extends ServiceClass {
    @Get
    @Route("/")
    public async OnGetConf(): Promise<Response> {
        return Response.Json<ClientConf>(clientConf);
    }
}