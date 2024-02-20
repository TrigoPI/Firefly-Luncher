import { Response, ServiceClass } from "dolphin";
export default class DownloadService extends ServiceClass {
    private modsPath;
    OnStart(): Promise<void>;
    private GetMods;
    private ModExist;
    private GetMod;
    OnDownloadMod(mod_name: string): Promise<Response>;
}
