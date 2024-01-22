import { Event, EventClass } from "../lib/event/Event";

enum CMD_EVENT_NAME {
    CMD_OUT_EVENT   = "CMD_OUT_EVENT",
    CMD_ERR_EVENT   = "CMD_ERR_EVENT",
    CMD_EXIT_EVENT  = "CMD_EXIT_EVENT",
}

enum MC_EVENT_NAME {
    MC_SERVER_STATE_CHANGED_EVENT = "MC_SERVER_STATE_CHANGED",
    MC_CONSOLE_EVENT              = "MC_CONSOLE_EVENT"
}

@Event(CMD_EVENT_NAME.CMD_OUT_EVENT)
export class CmdOutEvent extends EventClass {
    public readonly data: string;
    public constructor(data: string) {
        super();
        this.data = data;
    }
}

@Event(CMD_EVENT_NAME.CMD_ERR_EVENT)
export class CmdErrEvent extends EventClass {
    public readonly err: string;
    public constructor(err: string) {
        super();
        this.err = err;
    }
}

@Event(CMD_EVENT_NAME.CMD_EXIT_EVENT)
export class CmdExitEvent extends EventClass {
    public readonly code: number;
    public constructor(code: number) {
        super();
        this.code = code;
    }
}

//-----------------------------MC_EVENT-----------------------------

@Event(MC_EVENT_NAME.MC_SERVER_STATE_CHANGED_EVENT)
export class McServerStateChangedEvent extends EventClass {
    public readonly state: number;
    public readonly server: string; 
    public constructor(server: string, state: number) {
        super()
        this.state = state;
        this.server = server;
    }
}

@Event(MC_EVENT_NAME.MC_CONSOLE_EVENT)
export class McConsoleEvent extends EventClass {
    public readonly server: string;
    public readonly data: string;
    
    public constructor(server: string, data: string) {
        super();
        this.server = server;
        this.data = data;
    }
}