export default class Logger {
    private className;
    constructor(className: string);
    Error(a: any, fun?: Function | null): void;
    Warning(a: any, fun?: Function | null): void;
    Info(a: any, fun?: Function | null): void;
    Print(a: any, fun?: Function | null): void;
}
