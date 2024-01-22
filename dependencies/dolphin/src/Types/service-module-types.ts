import HttpFunction from "../Manager/HttpFunction";
import ServiceClass from "../Service/ServiceClass";

export type ServiceStatus = 'stopped' | 'running'

export type ServiceData = {
    className: string,
    functions: HttpFunction[],
    service: ServiceClass,
    path: string
}

export type ServiceDesc = {
    port: number
    ip: string,
    name: string, 
    base_path: string,
    status: ServiceStatus
}