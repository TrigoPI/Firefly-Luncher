import Logger from "../Lib/Log/Logger";
import { HttpMethod, HttpHandler, Param, FileDesc } from "../Types/http-types";
import HttpServer from "../Server/HttpServer";

export default class HttpServerManager {
    private logger: Logger;
    private servers: Map<string, HttpServer>

    public constructor() {
        this.logger = new Logger(HttpServerManager.name);
        this.servers = new Map<string, HttpServer>();
    }

    public IsRunning(ip: string, port: number): boolean {
        const key: string = `${ip}:${port}`
        if (!this.servers.has(key)) throw new Error(`Server : ${key} not found`);
        const server: HttpServer = this.servers.get(key);
        return server.IsRunning();
    }

    public RemoveServer(ip: string, port: number): void {
        const key: string = `${ip}:${port}`
        if (!this.servers.has(key)) throw new Error(`Server : ${key} not found`);
        
        const server: HttpServer = this.servers.get(key);
        this.logger.Info(`Removing http server : ${key}`);
        
        if (server.IsRunning()) throw new Error(`Cannot remove ${key} when is running`);
        this.servers.delete(key);
    }

    public CreateServer(ip: string, port: number): void {
        const key: string = `${ip}:${port}`
        if (this.servers.has(key)) throw new Error(`Server : ${key} already exist`);
        this.logger.Info(`Creating new http server : ${key}`);
        this.servers.set(key, new HttpServer(ip, port));
    }

    public AddRouter(ip: string, port: number, route: string): void {
        const key: string = `${ip}:${port}`
        if (!this.servers.has(key)) throw new Error(`Server : ${key} not found`);
        const server: HttpServer = this.servers.get(key);
        server.CreateRouter(route);
    }

    public AddSubRoute(ip: string, port: number, route: string, subRoute: string, method: HttpMethod, name: string, fileDesc: FileDesc | undefined, handler: HttpHandler): void {
        const key: string = `${ip}:${port}`
        if (!this.servers.has(key)) throw new Error(`Server : ${key} not found`);
        const server: HttpServer = this.servers.get(key);
        server.AddSubRoute(route, subRoute, method, name, fileDesc, handler);
    }

    public SetParam(ip: string, port: number, route: string, subRoute: string, method: HttpMethod, params: Param[]): void {
        const key: string = `${ip}:${port}`
        if (!this.servers.has(key)) throw new Error(`Server : ${key} not found`);
        const server: HttpServer = this.servers.get(key);
        server.SetRouteParams(route, subRoute, method, params);
    }

    public async Stop(ip: string, port: number): Promise<void> {
        const key: string = `${ip}:${port}`
        if (!this.servers.has(key)) throw new Error(`Server : ${key} not found`);

        try {
            const server: HttpServer = this.servers.get(key);
            await server.Stop();
        } catch (e: any) {
            this.logger.Error(`Error while running http server : ${key} : `)
            this.logger.Error(e);
        }
    }

    public async StopAll(): Promise<void> {
        for (const [key, server] of this.servers) {
            try {
                await server.Stop()
            } catch (e: any) {
                this.logger.Error(`Error while running http server : ${key} : `)
                this.logger.Error(e);
            }
        };
    }

    public async Start(ip: string, port: number): Promise<void> {
        const key: string = `${ip}:${port}`
        if (!this.servers.has(key)) throw new Error(`Server : ${key} not found`);

        try {
            const server: HttpServer = this.servers.get(key);
            await server.Listen();
        } catch (e: any) {
            this.logger.Error(`Error while running http server : ${key} : `)
            this.logger.Error(e);
        }
    }

    public async StartAll(): Promise<void> {
        for (const [key, server] of this.servers) {
            try {
                await server.Listen()
            } catch (e: any) {
                this.logger.Error(`Error while running http server : ${key} : `)
                this.logger.Error(e);
            }
        };
    }
}