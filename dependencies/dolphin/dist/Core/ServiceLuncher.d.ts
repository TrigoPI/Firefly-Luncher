import { ServiceDesc } from "../Types/service-module-types";
export default class ServiceLuncher {
    private static sInstance;
    private logger;
    private httpServerManager;
    private services;
    private servicePath;
    constructor(servicePath: string);
    IsRunning(name: string): boolean;
    ServiceExist(name: string): boolean;
    GetService(name: string): ServiceDesc;
    GetServicesDesc(): ServiceDesc[];
    GetServiceNames(): string[];
    LoadServices(): Promise<void>;
    ReloadService(name: string): Promise<void>;
    StopService(name: string): Promise<void>;
    StopAllService(): Promise<void>;
    StartService(name: string): Promise<void>;
    StartAllService(): Promise<void>;
    private OnStopService;
    private OnStartServices;
    private CreateHttpServer;
    static GetInstance(): ServiceLuncher;
    static Create(servicePath: string): void;
}
