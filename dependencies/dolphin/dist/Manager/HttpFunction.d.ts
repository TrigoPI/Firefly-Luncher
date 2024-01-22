import { FileDesc, HttpMethod, Param, ParamType } from "../Types/http-types";
export default class HttpFunction {
    private name;
    private method;
    private route;
    private fileDesc;
    private isFileFormEncoded;
    private params;
    constructor(name: string);
    IsFileFormEncoded(): boolean;
    GetFileDesc(): FileDesc;
    GetParams(): Param[];
    GetMethod(): HttpMethod;
    GetRoute(): string;
    GetName(): string;
    HasRoute(): boolean;
    HasMethod(): boolean;
    SetFileFormEncoded(a: boolean, name: string, multiple: boolean): void;
    SetMethod(method: HttpMethod): void;
    SetRoute(route: string): void;
    AddParam(name: string, type: ParamType, index: number): void;
}
