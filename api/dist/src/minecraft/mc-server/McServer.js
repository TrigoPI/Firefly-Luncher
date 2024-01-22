"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ServerState_1 = require("./ServerState");
const Error_1 = require("../core/Error");
const Event_1 = require("../core/Event");
const Command_1 = __importDefault(require("../core/Command"));
const Exception_1 = __importDefault(require("../lib/exception/Exception"));
const Logger_1 = __importDefault(require("../lib/log/Logger"));
const EventDispatcher_1 = __importDefault(require("../lib/event/EventDispatcher"));
const fs_1 = require("fs");
class McServer {
    constructor(path, name, version) {
        this.logger = new Logger_1.default(McServer.name);
        this.command = new Command_1.default();
        this.serverExe = "server.jar";
        this.xmx = 1024;
        this.xms = 1024;
        this.name = name;
        this.version = version;
        this.state = ServerState_1.SERVER_STATE.STOPPED;
        this.serverProperties = {};
        this.buffer = [];
        this.eventListener = undefined;
        this.command.SetLocation(path);
        this.command.AddEventListener((e) => this.OnEvent(e));
        this.ReadServerProperties(path);
    }
    GetServerProperties() {
        return this.serverProperties;
    }
    GetName() {
        return this.name;
    }
    GetVersion() {
        return this.version;
    }
    GetState() {
        return this.state;
    }
    GetBuffer() {
        return this.buffer;
    }
    IsStopped() {
        return this.state == ServerState_1.SERVER_STATE.STOPPED;
    }
    IsLoading() {
        return this.state == ServerState_1.SERVER_STATE.LOADING;
    }
    IsRunning() {
        return this.state == ServerState_1.SERVER_STATE.RUNNING;
    }
    SetXmx(xmx) {
        this.xmx = xmx;
    }
    SetXms(xms) {
        this.xms = xms;
    }
    SetServerExe(name) {
        this.serverExe = name;
    }
    SetCustomStartCommand(cmd) {
        this.customStartCommand = cmd;
    }
    AddEventListener(listener) {
        this.eventListener = listener;
    }
    Write(cmd) {
        if (this.IsStopped())
            throw new Exception_1.default(``, Error_1.ERROR.MC_SERVER_STOPPED);
        if (this.IsLoading())
            throw new Exception_1.default(``, Error_1.ERROR.MC_SERVER_LOADING);
        this.command.Write(cmd);
    }
    Stop() {
        if (this.IsStopped())
            throw new Exception_1.default(``, Error_1.ERROR.MC_SERVER_STOPPED);
        if (this.IsLoading())
            throw new Exception_1.default(``, Error_1.ERROR.MC_SERVER_LOADING);
        this.logger.Info("Stopping minecraft server");
        this.command.Write("stop");
    }
    Start() {
        this.command.SetCommand((this.customStartCommand) ? this.customStartCommand : `java -Xmx${this.xmx}M -Xms${this.xms} -jar ${this.serverExe} nogui`);
        if (this.IsLoading())
            throw new Exception_1.default(``, Error_1.ERROR.MC_SERVER_LOADING);
        if (this.IsRunning())
            throw new Exception_1.default(``, Error_1.ERROR.MC_SERVER_RUNNING);
        this.logger.Info(`Starting minecraft server ${this.name}`);
        this.ChangeState(ServerState_1.SERVER_STATE.LOADING);
        this.command.Exec();
    }
    ChangeState(state) {
        this.state = state;
        if (!this.eventListener)
            return;
        const event = new Event_1.McServerStateChangedEvent(this.name, state);
        this.eventListener(event);
    }
    OnEvent(e) {
        const dispatcher = new EventDispatcher_1.default(e);
        dispatcher.Dispatch(Event_1.CmdOutEvent, (e) => this.OnCmdOutEvent(e));
        dispatcher.Dispatch(Event_1.CmdExitEvent, (e) => this.OnCmdExitEvent(e));
        dispatcher.Dispatch(Event_1.CmdErrEvent, (e) => this.OnCmdErrorEvent(e));
    }
    OnCmdOutEvent(e) {
        const dataSplit = e.data.split(" ");
        const last = dataSplit[dataSplit.length - 1].replace(/"/g, "").replace(/ /g, "");
        const event = new Event_1.McConsoleEvent(this.name, e.data);
        if (last == "help")
            this.ChangeState(ServerState_1.SERVER_STATE.RUNNING);
        if (this.eventListener)
            this.eventListener(event);
        this.buffer.push(e.data);
    }
    OnCmdExitEvent(e) {
        this.logger.Info("Minecraft server closed");
        this.ChangeState(ServerState_1.SERVER_STATE.STOPPED);
        if (this.eventListener)
            this.eventListener(e);
    }
    OnCmdErrorEvent(e) {
        this.logger.Error(e.err);
        this.ChangeState(ServerState_1.SERVER_STATE.STOPPED);
        if (this.eventListener)
            this.eventListener(e);
    }
    ReadServerProperties(path) {
        const buffer = (0, fs_1.readFileSync)(`${path}/server.properties`);
        const bufferText = buffer.toString('utf-8');
        const propertiesRaw = bufferText.split('\r\n');
        for (const propertyRaw of propertiesRaw) {
            const propertyArray = propertyRaw.split("=");
            const key = propertyArray[0];
            if (key[0] != "#" && key != "")
                this.serverProperties[key] = (propertyArray.length == 2) ? propertyArray[1] : undefined;
        }
    }
}
exports.default = McServer;
