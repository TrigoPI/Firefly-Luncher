import { EventHandler } from "../lib/event/Event";
export default class Command {
    private cmd;
    private cwd;
    private child;
    private eventHandler;
    constructor(cmd?: string);
    SetCommand(cmd: string): void;
    SetLocation(path: string): void;
    AddEventListener(listener: EventHandler): void;
    Write(message: string): void;
    Exec(): void;
}
