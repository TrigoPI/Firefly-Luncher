import { SERVER_STATE } from "./ServerState";
import { ERROR } from "../core/Error";
import { McServerStateChangedEvent, CmdOutEvent, CmdExitEvent, McConsoleEvent, CmdErrEvent } from "../core/Event";
import { EventClass, EventHandler } from "../lib/event/Event";
import Command from "../core/Command";
import Exception from "../lib/exception/Exception";
import Logger from "../lib/log/Logger";
import EventDispatcher from "../lib/event/EventDispatcher";
import { readFileSync } from "fs";

export default class  McServer {
    private logger: Logger;
    
    private name: string;
    private version: string;

    private command: Command;
    private buffer: string[];
    private state: SERVER_STATE;
    private eventListener: EventHandler | undefined;

    private serverExe: string;
    private xmx: number;
    private xms: number;
    private customStartCommand: string;

    private serverProperties: Record<string, string>;

    constructor(path: string, name: string, version: string) {
        this.logger = new Logger(McServer.name);
        this.command = new Command();

        this.serverExe = "server.jar";
        this.xmx = 1024;
        this.xms = 1024;

        this.name = name;
        this.version = version;

        this.state = SERVER_STATE.STOPPED;
        this.serverProperties = {};
        this.buffer = [];
        
        this.eventListener = undefined;

        this.command.SetLocation(path);
        this.command.AddEventListener((e: EventClass) => this.OnEvent(e));
        this.ReadServerProperties(path);
    }

    public GetServerProperties(): Record<string, string> {
        return this.serverProperties;
    }

    public GetName(): string {
        return this.name;
    }

    public GetVersion(): string {
        return this.version;
    }

    public GetState(): SERVER_STATE {
        return this.state;
    }

    public GetBuffer(): string[] {
        return this.buffer;
    }

    public IsStopped(): boolean {
        return this.state == SERVER_STATE.STOPPED;
    }
    
    public IsLoading(): boolean {
        return this.state == SERVER_STATE.LOADING;
    }

    public IsRunning(): boolean {
        return this.state == SERVER_STATE.RUNNING;
    }

    public SetXmx(xmx: number): void {
        this.xmx = xmx;
    }

    public SetXms(xms: number): void {
        this.xms = xms;
    }

    public SetServerExe(name: string): void {
        this.serverExe = name;
    }

    public SetCustomStartCommand(cmd: string) {
        this.customStartCommand = cmd;
    }

    public AddEventListener(listener: EventHandler): void {
        this.eventListener = listener;
    }

    public Write(cmd: string): void {
        if (this.IsStopped()) throw new Exception(``, ERROR.MC_SERVER_STOPPED);
        if (this.IsLoading()) throw new Exception(``, ERROR.MC_SERVER_LOADING);
        this.command.Write(cmd);
    }

    public Stop(): void {
        if (this.IsStopped()) throw new Exception(``, ERROR.MC_SERVER_STOPPED);
        if (this.IsLoading()) throw new Exception(``, ERROR.MC_SERVER_LOADING);
        this.logger.Info("Stopping minecraft server");
        this.command.Write("stop");
    }

    public Start(): void {
        this.command.SetCommand((this.customStartCommand)? this.customStartCommand : `java -Xmx${this.xmx}M -Xms${this.xms} -jar ${this.serverExe} nogui`);
        if (this.IsLoading()) throw new Exception(``, ERROR.MC_SERVER_LOADING);
        if (this.IsRunning()) throw new Exception(``, ERROR.MC_SERVER_RUNNING);
        this.logger.Info(`Starting minecraft server ${this.name}`);
        this.ChangeState(SERVER_STATE.LOADING);
        this.command.Exec();
    }

    private ChangeState(state: SERVER_STATE) {
        this.state = state;
        if (!this.eventListener) return;
        const event: McServerStateChangedEvent = new McServerStateChangedEvent(this.name, state);
        this.eventListener(event);
    }

    private OnEvent(e: EventClass): void {
        const dispatcher: EventDispatcher = new EventDispatcher(e);
        dispatcher.Dispatch(CmdOutEvent, (e: CmdOutEvent) => this.OnCmdOutEvent(e));
        dispatcher.Dispatch(CmdExitEvent, (e: CmdExitEvent) => this.OnCmdExitEvent(e));
        dispatcher.Dispatch(CmdErrEvent, (e: CmdErrEvent) => this.OnCmdErrorEvent(e));
    }

    private OnCmdOutEvent(e: CmdOutEvent): void {
        const dataSplit: string[] = e.data.split(" ");
        const last: string = dataSplit[dataSplit.length - 1].replace(/"/g, "").replace(/ /g, "");
        const event: McConsoleEvent = new McConsoleEvent(this.name, e.data);
        if (last == "help") this.ChangeState(SERVER_STATE.RUNNING);
        if (this.eventListener) this.eventListener(event);
        this.buffer.push(e.data);
    }

    private OnCmdExitEvent(e: CmdExitEvent): void {
        this.logger.Info("Minecraft server closed");
        this.ChangeState(SERVER_STATE.STOPPED);
        if (this.eventListener) this.eventListener(e);
    }

    private OnCmdErrorEvent(e: CmdErrEvent): void {
        this.logger.Error(e.err);
        this.ChangeState(SERVER_STATE.STOPPED);
        if (this.eventListener) this.eventListener(e);
    }

    private ReadServerProperties(path: string): void {
        const buffer: Buffer = readFileSync(`${path}/server.properties`);
        const bufferText: string = buffer.toString('utf-8');
        const propertiesRaw: string[] = bufferText.split('\r\n');

        for (const propertyRaw of propertiesRaw) {
            const propertyArray: string[] = propertyRaw.split("=");
            const key: string = propertyArray[0];
            if (key[0] != "#" && key != "") 
                this.serverProperties[key] =(propertyArray.length == 2)? propertyArray[1] : undefined;
        }
    }
}





