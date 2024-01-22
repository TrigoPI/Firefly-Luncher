import ServiceLuncher from "./ServiceLuncher";

export default function EntryPoint(servicePath: string) {
    return <T>(target: { new(...args: any): T, CreateApplication(): void }) => {
        ServiceLuncher.Create(servicePath);
        target.CreateApplication();
    }
};