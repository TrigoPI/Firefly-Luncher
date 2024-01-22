import { HttpMethod, ParamType } from "../Types/http-types";
import HttpFunction from "./HttpFunction";

export default class HttpClass {
    private httpFunctions: Map<string, HttpFunction>;
    private name: string;

    public constructor(name: string) {
        this.httpFunctions = new Map<string, HttpFunction>();
        this.name = name;
    }

    public GetName(): string {
        return this.name;
    }

    public GetFunctions(): HttpFunction[] {
        const functions: HttpFunction[] = [];
        this.httpFunctions.forEach((func: HttpFunction) => functions.push(func));
        return functions;
    }

    public FunctionExist(name: string): boolean {
        return this.httpFunctions.has(name);
    }

    public GetFunction(name: string): HttpFunction {
        if (!this.httpFunctions.has(name)) throw new Error(`Class ${this.name} doesn't have function ${name}`);
        return this.httpFunctions.get(name);
    }
    
    public AddFunction(name: string): void {
        if (this.httpFunctions.has(name)) throw new Error(`Function ${name} already exist in class ${this.name}`);
        this.httpFunctions.set(name, new HttpFunction(name));
    }

    public SetFunctionFileFormEncoded(name: string, a: boolean, filename: string, multiple: boolean): void {
        if (!this.httpFunctions.has(name)) throw new Error(`Class ${this.name} doesn't have function ${name}`);
        const httpFunction: HttpFunction = this.httpFunctions.get(name);
        httpFunction.SetFileFormEncoded(a, filename, multiple);
    }

    public SetFunctionHttpMethod(name: string, httpMethod: HttpMethod): void {
        if (!this.httpFunctions.has(name)) throw new Error(`Class ${this.name} doesn't have function ${name}`);
        const httpFunction: HttpFunction = this.httpFunctions.get(name);
        httpFunction.SetMethod(httpMethod);
    }

    public SetFunctionRoute(name: string, route: string): void {
        if (!this.httpFunctions.has(name)) throw new Error(`Class ${this.name} doesn't have function ${name}`);
        const httpFunction: HttpFunction = this.httpFunctions.get(name);
        httpFunction.SetRoute(route);
    }

    public AddFunctionParam(functionName: string, paramName: string, type: ParamType, index: number): void {
        if (!this.httpFunctions.has(functionName)) throw new Error(`Class ${this.name} doesn't have function ${functionName}`);
        const httpFunction: HttpFunction = this.httpFunctions.get(functionName);
        httpFunction.AddParam(paramName, type, index);
    }
}