export default function EntryPoint(servicePath: string): <T>(target: {
    new (...args: any): T;
    CreateApplication(): void;
}) => void;
