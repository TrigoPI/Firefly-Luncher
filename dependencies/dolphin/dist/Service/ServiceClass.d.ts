export default class ServiceClass {
    OnStart(): Promise<void>;
    OnStop(): Promise<void>;
    GetName(): string;
    GetRoute(): string;
    GetIp(): string;
    GetPort(): number;
}
