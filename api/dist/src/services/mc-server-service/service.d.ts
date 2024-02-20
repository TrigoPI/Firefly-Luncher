import { Response, ServiceClass } from "dolphin";
export default class McServerService extends ServiceClass {
    private mcServer;
    private serverStateRef;
    private serverLogRef;
    private cmdId;
    private serverPath;
    OnStart(): Promise<void>;
    private ServerStateToString;
    private AuthToFirebase;
    private OnMcServerEvent;
    private OnMcServerStateChanged;
    private OnMcConsoleOut;
    OnGetProperties(): Promise<Response>;
    OnGetBuffer(): Promise<Response>;
    OnServerCommand(cmd: string): Promise<Response>;
    OnServerStart(): Promise<Response>;
    OnServerStop(): Promise<Response>;
}
