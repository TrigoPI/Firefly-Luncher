import { ParamType, HttpHandler } from "../Types/http-types";
import HttpClassManager from "../Manager/HttpClassManager";
import { SERVICE_MACRO } from "./Macro";
import ServiceClass from "./ServiceClass";

const MACRO_TYPE_MAP: Record<SERVICE_MACRO, string> = {
    '$REQ_IP' : 'string',
    '$URL'    : 'string',
    '$PARAMS' : 'object'
}

export const Service = <T extends { new(...args: any[]): ServiceClass }>(name: string, route: string, ip: string, port: number) => {
    return (target: T) => {
        return class extends target {
            public GetName(): string {
                return name;
            }
            
            public GetRoute(): string {
                return route;
            }

            public GetIp(): string {
                return ip;    
            }

            public GetPort(): number {
                return port;
            }
        };
    }
}

export const WebMacro = <T extends ServiceClass>(macro: SERVICE_MACRO) => {
    return WebParam<T>(macro, MACRO_TYPE_MAP[macro as string]);
}

export const WebString = <T extends ServiceClass>(name: string) => {
    return WebParam<T>(name, 'string');
}

export const WebNumber = <T extends ServiceClass>(name: string) => {
    return WebParam<T>(name, 'number');
}

export const WebObject = <T extends ServiceClass>(name: string) => {
    return WebParam<T>(name, 'object');
}

export const WebParam = <T extends ServiceClass>(name: string, type: ParamType) => {
    return (target: T, functionName: string, index: number) => {
        const manager: HttpClassManager = HttpClassManager.GetInstance();
        const className: string = target.constructor.name;

        if (!manager.ClassExist(className)) manager.AddClass(className);
        if (!manager.FunctionExist(className, functionName)) manager.AddFunction(className, functionName);

        manager.AddFunctionParam(className, functionName, name, type, index);
    }
}

export const Post = <T extends ServiceClass>(target: T, functionName: string, descriptor: TypedPropertyDescriptor<HttpHandler>) => {
    const manager: HttpClassManager = HttpClassManager.GetInstance();
    const className: string = target.constructor.name;

    if (!manager.ClassExist(className)) manager.AddClass(className);
    if (!manager.FunctionExist(className, functionName)) manager.AddFunction(className, functionName); 
    
    manager.SetFunctionHttpMethod(className, functionName, 'post');
}

export const Get = <T extends ServiceClass>(target: T, functionName: string, descriptor: TypedPropertyDescriptor<HttpHandler>) => {
    const manager: HttpClassManager = HttpClassManager.GetInstance();
    const className: string = target.constructor.name;

    if (!manager.ClassExist(className)) manager.AddClass(className);
    if (!manager.FunctionExist(className, functionName)) manager.AddFunction(className, functionName); 
    
    manager.SetFunctionHttpMethod(className, functionName, 'get');
}

export const FileFormEncoded = <T extends ServiceClass>(filename: string, multiple: boolean) => {
    return (target: T, functionName: string) => {
        const manager: HttpClassManager = HttpClassManager.GetInstance();
        const className: string = target.constructor.name;
    
        if (!manager.ClassExist(className)) manager.AddClass(className);
        if (!manager.FunctionExist(className, functionName)) manager.AddFunction(className, functionName); 
        
        manager.SetFunctionFileFormEncoded(className, functionName, true, filename, multiple);
    }
}

export const Route = <T extends ServiceClass>(route: string) => {
    return (target: T, functionName: string) => {
        const manager: HttpClassManager = HttpClassManager.GetInstance();
        const className: string = target.constructor.name;

        if (!manager.ClassExist(className)) manager.AddClass(className);
        if (!manager.FunctionExist(className, functionName)) manager.AddFunction(className, functionName); 
        
        manager.SetFunctionRoute(className, functionName, route);
    }
}
