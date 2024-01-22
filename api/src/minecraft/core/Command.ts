import { ChildProcessWithoutNullStreams, spawn } from "child_process";

import { CmdErrEvent, CmdExitEvent, CmdOutEvent } from "./Event";
import { EventHandler } from "../lib/event/Event";

export default class Command {
    private cmd: string; 
    private cwd: string;
    private child: ChildProcessWithoutNullStreams | undefined;
    private eventHandler: EventHandler | undefined;

    public constructor(cmd: string = "") {
        this.cwd = ".";
        this.cmd = cmd;
        this.child = undefined;
        this.eventHandler = undefined;
    }

    public SetCommand(cmd: string) {
        this.cmd = cmd;
    }

    public SetLocation(path: string): void {
        this.cwd = path;
    }

    public AddEventListener(listener: EventHandler): void {
        this.eventHandler = listener;
    }

    public Write(message: string): void {
        if (!this.child) throw new Error(`Command: ${this.cmd} not executed`);
        this.child.stdin.write(message + "\n");
    }

    public Exec(): void {
        this.child = spawn("cmd", ["/c", `${this.cmd}`], { cwd: this.cwd });
        
        if (!this.eventHandler) return;

        this.child.stdout.setEncoding('utf-8');
        this.child.stderr.setEncoding('utf-8');

        this.child.stdout.on('data', (buffer: Buffer) => {
            const data: string = buffer.toString('utf-8').replace("\n", "").replace("\r", "");
            const event: CmdOutEvent = new CmdOutEvent(data);
            this.eventHandler(event);
        });

        this.child.stderr.on('data', (buffer: Buffer) => {
            const data: string = buffer.toString('utf-8').replace("\n", "").replace("\r", "");
            const event: CmdErrEvent = new CmdErrEvent(data);
            this.eventHandler(event);
        });

        this.child.on('exit', (code: number) => {
            const event: CmdExitEvent = new CmdExitEvent(code);
            this.eventHandler(event);
        });
    }
}