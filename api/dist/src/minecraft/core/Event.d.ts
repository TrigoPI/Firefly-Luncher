import { EventClass } from "../lib/event/Event";
export declare class CmdOutEvent extends EventClass {
    readonly data: string;
    constructor(data: string);
}
export declare class CmdErrEvent extends EventClass {
    readonly err: string;
    constructor(err: string);
}
export declare class CmdExitEvent extends EventClass {
    readonly code: number;
    constructor(code: number);
}
export declare class McServerStateChangedEvent extends EventClass {
    readonly state: number;
    readonly server: string;
    constructor(server: string, state: number);
}
export declare class McConsoleEvent extends EventClass {
    readonly server: string;
    readonly data: string;
    constructor(server: string, data: string);
}
