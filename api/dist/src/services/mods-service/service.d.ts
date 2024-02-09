import { Response, ServiceClass } from "dolphin";
export default class ModsService extends ServiceClass {
    private modsPath;
    private mods;
    OnStart(): Promise<void>;
    private FindMod;
    private GetModWithoutExtension;
    private ModEnableToString;
    private GetMods;
    OnGetMods(): Promise<Response>;
    OnGetMod(side: string, name: string): Promise<Response>;
    OnModAdded(): Promise<Response>;
    OnModDeleted(name: string, side: string): Promise<Response>;
    OnModDisabled(side: string, name: string): Promise<Response>;
    OnModEnable(side: string, name: string): Promise<Response>;
}
