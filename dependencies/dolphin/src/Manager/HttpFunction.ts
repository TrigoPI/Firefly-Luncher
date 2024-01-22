import Stack from "../Lib/Array/Stack";
import { FileDesc, HttpMethod, Param, ParamType } from "../Types/http-types";

export default class HttpFunction {
    private name: string;
    private method: HttpMethod | undefined
    private route: string | undefined;
    private fileDesc: FileDesc | undefined;
    private isFileFormEncoded: boolean;
    private params: Stack<Param>;
    
    public constructor(name: string) {
        this.params = new Stack<Param>;
        this.name = name;
        this.isFileFormEncoded = false;
        this.fileDesc = undefined;
        this.method = undefined;
        this.route = undefined;
    }

    public IsFileFormEncoded(): boolean {
        return this.isFileFormEncoded;
    }
    
    public GetFileDesc(): FileDesc {
        return this.fileDesc;
    }

    public GetParams(): Param[] {
        const params: Param[] = [];
        this.params.ForEach((param: Param) => params.push(param));
        return params;
    }
    
    public GetMethod(): HttpMethod {
        if (!this.method) throw new Error("HTTP method is undefined");
        return this.method;
    } 
    
    public GetRoute(): string {
        if (!this.route) throw new Error("Route is undefined");
        return this.route;
    }
    
    public GetName(): string {
        return this.name;
    }

    public HasRoute(): boolean {
        return this.route != undefined;
    }

    public HasMethod(): boolean {
        return this.method != undefined;
    }

    public SetFileFormEncoded(a: boolean, name: string, multiple: boolean): void {
        this.isFileFormEncoded = a;
        this.fileDesc = { name, multiple };
    }

    public SetMethod(method: HttpMethod): void {
        this.method = method;
    }

    public SetRoute(route: string): void {
        this.route = route;
    }

    public AddParam(name: string, type: ParamType, index: number): void {
        this.params.Push({ name, type, index });
    }
}