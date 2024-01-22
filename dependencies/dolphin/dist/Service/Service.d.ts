import { ParamType, HttpHandler } from "../Types/http-types";
import { SERVICE_MACRO } from "./Macro";
import ServiceClass from "./ServiceClass";
export declare const Service: <T extends new (...args: any[]) => ServiceClass>(name: string, route: string, ip: string, port: number) => (target: T) => {
    new (...args: any[]): {
        GetName(): string;
        GetRoute(): string;
        GetIp(): string;
        GetPort(): number;
        OnStart(): Promise<void>;
        OnStop(): Promise<void>;
    };
} & T;
export declare const WebMacro: <T extends ServiceClass>(macro: SERVICE_MACRO) => (target: T, functionName: string, index: number) => void;
export declare const WebString: <T extends ServiceClass>(name: string) => (target: T, functionName: string, index: number) => void;
export declare const WebNumber: <T extends ServiceClass>(name: string) => (target: T, functionName: string, index: number) => void;
export declare const WebObject: <T extends ServiceClass>(name: string) => (target: T, functionName: string, index: number) => void;
export declare const WebParam: <T extends ServiceClass>(name: string, type: ParamType) => (target: T, functionName: string, index: number) => void;
export declare const Post: <T extends ServiceClass>(target: T, functionName: string, descriptor: TypedPropertyDescriptor<HttpHandler>) => void;
export declare const Get: <T extends ServiceClass>(target: T, functionName: string, descriptor: TypedPropertyDescriptor<HttpHandler>) => void;
export declare const FileFormEncoded: <T extends ServiceClass>(filename: string, multiple: boolean) => (target: T, functionName: string) => void;
export declare const Route: <T extends ServiceClass>(route: string) => (target: T, functionName: string) => void;
