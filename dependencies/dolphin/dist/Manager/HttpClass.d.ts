import { HttpMethod, ParamType } from "../Types/http-types";
import HttpFunction from "./HttpFunction";
export default class HttpClass {
    private httpFunctions;
    private name;
    constructor(name: string);
    GetName(): string;
    GetFunctions(): HttpFunction[];
    FunctionExist(name: string): boolean;
    GetFunction(name: string): HttpFunction;
    AddFunction(name: string): void;
    SetFunctionFileFormEncoded(name: string, a: boolean, filename: string, multiple: boolean): void;
    SetFunctionHttpMethod(name: string, httpMethod: HttpMethod): void;
    SetFunctionRoute(name: string, route: string): void;
    AddFunctionParam(functionName: string, paramName: string, type: ParamType, index: number): void;
}
