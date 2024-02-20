import { Response, ServiceClass } from "dolphin";
import { Mod } from "shared/types/minecraft";
export default class ModInstallerService extends ServiceClass {
    private modsPath;
    private serverPath;
    private logger;
    OnStart(): Promise<void>;
    private GetMods;
    OnServerStart(mods: Mod[]): Promise<Response>;
}
