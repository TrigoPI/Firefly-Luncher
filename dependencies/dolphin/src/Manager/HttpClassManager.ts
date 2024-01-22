import Logger from "../Lib/Log/Logger";
import { HttpMethod, ParamType } from "../Types/http-types";
import HttpClass from "./HttpClass";

export default class HttpClassManager {
    public static INSTANCE: HttpClassManager | undefined;

    private logger: Logger;
    private httpClasses: Map<string, HttpClass>;

    private constructor() {
        this.logger = new Logger(HttpClassManager.name);
        this.httpClasses = new Map<string, HttpClass>();
    }

    public GetClasses(): HttpClass[] {
        const classes: HttpClass[] = [];
        this.httpClasses.forEach((httpClass: HttpClass) => classes.push(httpClass));
        return classes;
    }

    public FunctionExist(className: string, functionName: string): boolean {
        if (!this.httpClasses.has(className)) throw new Error(`Class ${className} doesn't exist`);
        const httpClass: HttpClass = this.httpClasses.get(className);
        return httpClass.FunctionExist(functionName);
    }

    public ClassExist(name: string): boolean {
        return this.httpClasses.has(name);
    }

    public RemoveClass(className: string): void {
        if (!this.httpClasses.has(className)) throw new Error(`Class ${className} doesn't exist`);
        this.logger.Print(`Removing class ${className}`);
        this.httpClasses.delete(className);
    }

    public GetClass(name: string): HttpClass {
        if (!this.httpClasses.has(name)) throw new Error(`Class ${name} doesn't exist`);
        return this.httpClasses.get(name);
    }

    public AddClass(name: string): void {
        if (this.httpClasses.has(name)) throw new Error(`Class ${name} already exist`);
        this.logger.Print(`Adding class ${name}`);
        this.httpClasses.set(name, new HttpClass(name));
    } 

    public AddFunction(className: string, functionName: string): void {
        if (!this.httpClasses.has(className)) throw new Error(`Class ${name} doesn't exist`);
        const httpClass: HttpClass = this.httpClasses.get(className);
        this.logger.Print(`Adding function ${functionName} to class ${className}`);
        httpClass.AddFunction(functionName);
    }
    
    public SetFunctionHttpMethod(className: string, functionName: string, httpMethod: HttpMethod): void {
        if (!this.httpClasses.has(className)) throw new Error(`Class ${className} doesn't exist`);
        const httpClass: HttpClass = this.httpClasses.get(className);
        this.logger.Print(`Setting Http method for ${functionName} in class ${className} --> ${httpMethod}`);
        httpClass.SetFunctionHttpMethod(functionName, httpMethod);
    }

    public SetFunctionFileFormEncoded(className: string, functionName: string, a: boolean, name: string, multiple: boolean): void {
        if (!this.httpClasses.has(className)) throw new Error(`Class ${className} doesn't exist`);
        const httpClass: HttpClass = this.httpClasses.get(className);
        this.logger.Print(`Setting multipart/form-data for function ${functionName} in class ${className}`);
        httpClass.SetFunctionFileFormEncoded(functionName, a, name, multiple);
    }

    public SetFunctionRoute(className: string, functionName: string, route: string): void {
        if (!this.httpClasses.has(className)) throw new Error(`Class ${className} doesn't exist`);
        const httpClass: HttpClass = this.httpClasses.get(className);
        this.logger.Print(`Setting Http route for function ${functionName} in class ${className} --> ${route}`);
        httpClass.SetFunctionRoute(functionName, route);
    }

    public AddFunctionParam(className: string, functionName: string, paramName: string, type: ParamType, index: number): void {
        if (!this.httpClasses.has(className)) throw new Error(`Class ${className} doesn't exist`);
        const httpClass: HttpClass = this.httpClasses.get(className);
        this.logger.Print(`Adding parameter for function ${functionName} in class ${className} --> { name: ${paramName}, type: ${type}, index : ${index} }`);
        httpClass.AddFunctionParam(functionName, paramName, type, index);
    }

    public static GetInstance(): HttpClassManager {
        if (!HttpClassManager.INSTANCE) HttpClassManager.INSTANCE = new HttpClassManager();
        return HttpClassManager.INSTANCE;
    }
}