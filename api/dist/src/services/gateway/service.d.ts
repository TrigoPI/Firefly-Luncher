import { Response, ServiceClass } from "dolphin";
import { ModSide } from "shared/types/minecraft";
export default class GatewayService extends ServiceClass {
    private GetMod;
    OnPing(): Promise<Response>;
    OnGetModsList(): Promise<Response>;
    OnGetClientConf(): Promise<Response>;
    OnGetProperties(): Promise<Response>;
    OnGetBuffer(): Promise<Response>;
    OnDownloadMod(mod_name: string): Promise<Response>;
    OnServerCommand(cmd: string): Promise<Response>;
    OnMcServerStart(action: "start" | "stop"): Promise<Response>;
    OnModEnableOrDisable(action: 'enable' | 'disable' | 'delete', side: ModSide, name: string): Promise<Response>;
    OnModsAdded(side: string, files: Record<string, any>[]): Promise<Response>;
}
