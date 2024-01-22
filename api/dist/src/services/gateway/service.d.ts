import { Response, ServiceClass } from "dolphin";
import { ModSide } from "shared/types/minecraft";
export default class ModsService extends ServiceClass {
    private GetMod;
    OnGetProperties(): Promise<Response>;
    OnGetBuffer(): Promise<Response>;
    OnServerCommand(cmd: string): Promise<Response>;
    OnMcServerStart(action: "start" | "stop"): Promise<Response>;
    OnModEnableOrDisable(action: 'enable' | 'disable' | 'delete', side: ModSide, name: string): Promise<Response>;
    OnModsAdded(side: string, files: Record<string, any>[]): Promise<Response>;
}
