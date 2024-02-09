import { Response, ServiceClass } from "dolphin";
export default class ClientConfService extends ServiceClass {
    OnGetConf(): Promise<Response>;
}
