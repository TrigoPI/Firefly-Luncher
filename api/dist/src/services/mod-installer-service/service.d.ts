import { Response, ServiceClass } from "dolphin";
import { Mod } from "shared/types/minecraft";
export default class ModInstallerService extends ServiceClass {
    private modPath;
    private modsList;
    OnStart(): Promise<void>;
    private GetMods;
    private AddMod;
    private DeleteMod;
    OnServerStart(mods: Mod[]): Promise<Response>;
}
