import cors from 'cors';
import express, { Express, Request as Req, Response as Res, Router } from 'express';
import { MediaType, Response } from './Response';
import { Param, HttpMethod, HttpHandler, FileDesc } from '../Types/http-types';
import Logger from '../Lib/Log/Logger';
import { SERVICE_MACRO } from '../Service/Macro';
import { Server } from 'http';
import multer, { Multer } from 'multer';

export default class HttpServer {
    private logger: Logger;
    private app: Express;
    private host: string;
    private port: number;
    private routers: Map<string, Router>;
    private routesParams: Map<string, Param[]>
    private running: boolean;
    private server: Server | undefined;
    private multer: Multer;

    constructor(host: string, port: number) {
        this.logger = new Logger(HttpServer.name);
        this.routers = new Map<string, Router>();
        this.routesParams = new Map<string, Param[]>();
        this.running = false;
        this.host = host;
        this.port = port;
        this.server = undefined;
        this.multer = multer();
        this.app = express();
        this.app.use(cors())
        this.app.use(express.json());
    }

    public IsRunning(): boolean {
        return this.running;
    }

    public GetIp(): string {
        return this.host;
    }
    
    public GetPort(): number {
        return this.port;
    }
    
    public async Stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.IsRunning()) throw new Error("Server not started");
            this.logger.Info(`Stoping RestAPI : http://${this.host}:${this.port}`);
            this.server.closeAllConnections();
            this.server.close((err?: Error) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.logger.Info(`RestAPI : http://${this.host}:${this.port} stopped`);  
                this.running = false;
                resolve();
            });
        });
    }

    public async Listen(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.logger.Info(`Starting RestAPI server on : http://${this.host}:${this.port}`);  
            this.routers.forEach((router: Router, key: string) => this.app.use(key, router));
            this.server = this.app.listen(this.port, this.host, () => {
                this.running = true;
                resolve();
            });

            this.server.on('error', (err: Error) => reject(err));
        });
    }

    public CreateRouter(route: string): void {
        if (this.routers.has(route)) throw new Error(`Route ${route} already exist`);
        this.logger.Print(`Creating new router for ${route}`);
        this.routers.set(route, Router());
    }

    public AddSubRoute(route: string, subRoute: string, method: HttpMethod, name: string, fileDesc: FileDesc | undefined, handler: HttpHandler): void {
        if (!this.routers.has(route)) throw new Error(`Route ${route} doesn't exist`);
        const router: Router = this.routers.get(route);
        this.logger.Print(`Adding sub route new router for ${route} --> ${subRoute}`);
        
        if (!fileDesc) {
            router[method](subRoute, (req: Req, res: Res) => this.HandleRequest(route, subRoute, req, res, name, undefined, handler));
            return;
        }

        if (fileDesc.multiple) {
            router[method](subRoute, this.multer.array(fileDesc.name), (req: Req, res: Res) => this.HandleRequest(route, subRoute, req, res, name, fileDesc, handler));
            return;
        }

        router[method](subRoute, this.multer.single(fileDesc.name), (req: Req, res: Res) => this.HandleRequest(route, subRoute, req, res, name, fileDesc, handler));
        
    }

    public SetRouteParams(route: string, subRoute: string, method: HttpMethod, params: Param[]): void {
        if (!this.routers.has(route)) throw new Error(`Route ${route} doesn't exist`);
        const key: string = `${method}:${route}${subRoute}`;
        if (this.routesParams.has(key)) throw new Error(`Param ${route} already registered for route ${key}`);
        this.logger.Print(`Adding param for route ${route}${subRoute}`);
        params.forEach((param: Param) => {
            this.logger.Print(`     |--> name : ${param.name}`)
            this.logger.Print(`         |--> type : ${param.type}`);
            this.logger.Print(`         |--> index : ${param.index}`);
        });
        this.routesParams.set(key, params);
    }

    private IsRequestValid(dict: Record<string, any>, params: Param[]): boolean {
        let valid: boolean = true;
        let i: number = 0;

        if (params.length == 0) return true;
        
        while (valid && i < params.length) {
            const element: unknown | undefined = dict[params[i].name];
            const param: Param = params[i];

            if (param.type == 'string') valid = element != undefined && typeof element == 'string';
            if (param.type == 'number') valid = element != undefined && !isNaN(Number(element));
            if (param.type == 'object') valid = element != undefined && typeof element == 'object';
            i++;
        }

        return valid;
    }

    private CastParams(dict: Record<string, any>, params: Param[]): Record<string, any> {
        const cpy: Record<string, any> = { ...dict };
        let i: number = 0;

        while (i < params.length) {
            const element: unknown | undefined = dict[params[i].name];
            const param: Param = params[i];

            if (element == undefined) throw new Error(`Cannot find params ${params[i].name}`)    
            if (param.type == 'number') {
                const num: number = Number(element);
                if (isNaN(num)) throw new Error(`Cannot cast ${param.name} into number`);
                cpy[param.name] = num;
            }
            
            i++;
        }

        return cpy;
    }

    private CleanRequest(dict: Record<string, any>): Record<string, any> {
        const cpy: Record<string, any> = { ...dict };

        for (const key in dict) {
            if (!isNaN(Number(key))) {
                delete cpy[key]
            }
        }

        return cpy;
    }

    private GenerateFunctionArgs(dict: Record<string, any>, params: Param[]): any[] {
        const args: any[] = [];
        for (const param of params) args.push(dict[param.name]);
        return args;
    }

    private GenerateMacros(req: Req, params: Param[], datas: Record<string, any>): Record<string, any> {
        let dict: Record<string, any> = {};

        for (const param of params) {
            if (param.name.includes("$")) {
                if (param.name == SERVICE_MACRO.REQ_IP) dict[SERVICE_MACRO.REQ_IP] = req.ip;
                if (param.name == SERVICE_MACRO.URL) dict[SERVICE_MACRO.URL] = req.url.split("?")[0];
                if (param.name == SERVICE_MACRO.PARAMS) dict[SERVICE_MACRO.PARAMS] = datas;
            }
        }

        return dict;
    }

    private async HandleRequest(route: string, subRoute: string, req: Req, res: Res, name: string, fileDesc: FileDesc | undefined,  handler: HttpHandler): Promise<void> {
        const key: string = `${req.method.toLowerCase()}:${route}${subRoute}`;
        const params: Param[] = this.routesParams.has(key)? this.routesParams.get(key) : [];
        let dict: Record<string, any> = {};
        
        if (req.params) dict = { ...dict, ...req.params };
        if (req.query) dict = { ...dict, ...req.query };
        if (req.body) dict = { ...dict, ...req.body };
        if (fileDesc) dict[fileDesc.name] = (fileDesc.multiple)? req.files : req.file;

        dict = this.CleanRequest(dict);
        dict = { ...dict, ...this.GenerateMacros(req, params, dict) };

        if (!this.IsRequestValid(dict, params)) {
            res.status(400).send(`400 BAD REQUEST: invalid parameters for ${route}${subRoute}`);
            return;
        };
        
        try {
            dict = this.CastParams(dict, params);
        } catch {
            res.status(400).send(`400 BAD REQUEST: invalid parameters for ${route}${subRoute}`);
            return;
        }

        try {
            const args: any[] = this.GenerateFunctionArgs(dict, params);
            const response: Response = await handler(...args);

            switch (response.type) {
                case MediaType.EMPTY:
                    res.sendStatus(response.code);
                    break;
                case MediaType.PLAIN_TEXT:
                    res.status(response.code).send(response.body);
                    break;
                case MediaType.PLAIN_HTML:
                    res.status(response.code).send(response.body);
                    break;
                case MediaType.APPLICATION_JSON:
                    res.status(response.code).json(JSON.parse(response.body));
                    break;
                case MediaType.FILE:
                    const json: Record<string, string> = JSON.parse(response.body);
                    const pathSplit: string[] = json.path.replace(/\\/g, "/").split("/");
                    const filename: string = (json.filename.length > 0)? json.filename : pathSplit[pathSplit.length - 1];
                    res.status(response.code).download(json.path, filename);
                    break;
            }
        } catch (err: any) {
            res.status(500).json({ status: "error", msg: "internal server error" });
            this.logger.Error(`Error in function ${name}`);
            this.logger.Error(err);
            this.logger.Error((<Error>err).stack);
        }
    }

}