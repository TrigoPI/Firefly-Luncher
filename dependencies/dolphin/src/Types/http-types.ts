import { Response } from "../Server/Response"

export type ParamType = "string" | "object" | "number" | "file";
export type HttpMethod = "post" | "get";
export type HttpHandler = (...args: any[]) => Promise<Response>;
export type FileDesc = { name: string, multiple: boolean };

export type Param = { 
    type: ParamType,
    name: string,
    index: number, 
}