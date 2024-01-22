export default class ServiceClass {
    public async OnStart(): Promise<void> {}
    public async OnStop(): Promise<void> {};

    public GetName(): string {
        return "";
    }

    public GetRoute(): string {
        return "";
    }

    public GetIp(): string {
        return "";
    }

    public GetPort(): number {
        return 0;
    }
}