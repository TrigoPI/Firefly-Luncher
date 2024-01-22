import { HttpMethod, HttpHandler, Param, FileDesc } from "../Types/http-types";
export default class HttpServerManager {
    private logger;
    private servers;
    constructor();
    IsRunning(ip: string, port: number): boolean;
    RemoveServer(ip: string, port: number): void;
    CreateServer(ip: string, port: number): void;
    AddRouter(ip: string, port: number, route: string): void;
    AddSubRoute(ip: string, port: number, route: string, subRoute: string, method: HttpMethod, name: string, fileDesc: FileDesc | undefined, handler: HttpHandler): void;
    SetParam(ip: string, port: number, route: string, subRoute: string, method: HttpMethod, params: Param[]): void;
    Stop(ip: string, port: number): Promise<void>;
    StopAll(): Promise<void>;
    Start(ip: string, port: number): Promise<void>;
    StartAll(): Promise<void>;
}
