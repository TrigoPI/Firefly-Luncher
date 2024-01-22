import { Response, ServiceClass } from "dolphin";
export default class ModsService extends ServiceClass {
    private serverFolderPath;
    private clientFolderPath;
    private mods;
    OnStart(): Promise<void>;
    private FindMod;
    private GetMods;
    OnGetMods(): Promise<Response>;
    OnGetMod(side: string, name: string): Promise<Response>;
    OnModAdded(modsData: Record<string, string[]>): Promise<Response>;
    OnModDeleted(name: string, side: string): Promise<Response>;
    OnModDisabled(side: string, name: string): Promise<Response>;
    OnModEnable(side: string, name: string): Promise<Response>;
}
