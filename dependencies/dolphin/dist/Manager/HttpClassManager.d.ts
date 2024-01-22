import { HttpMethod, ParamType } from "../Types/http-types";
import HttpClass from "./HttpClass";
export default class HttpClassManager {
    static INSTANCE: HttpClassManager | undefined;
    private logger;
    private httpClasses;
    private constructor();
    GetClasses(): HttpClass[];
    FunctionExist(className: string, functionName: string): boolean;
    ClassExist(name: string): boolean;
    RemoveClass(className: string): void;
    GetClass(name: string): HttpClass;
    AddClass(name: string): void;
    AddFunction(className: string, functionName: string): void;
    SetFunctionHttpMethod(className: string, functionName: string, httpMethod: HttpMethod): void;
    SetFunctionFileFormEncoded(className: string, functionName: string, a: boolean, name: string, multiple: boolean): void;
    SetFunctionRoute(className: string, functionName: string, route: string): void;
    AddFunctionParam(className: string, functionName: string, paramName: string, type: ParamType, index: number): void;
    static GetInstance(): HttpClassManager;
}
