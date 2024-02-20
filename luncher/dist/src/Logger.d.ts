export default class Logger {
    private className;
    private logFile;
    private write;
    constructor(className: string);
    WriteLog(a: boolean): void;
    SetLogPath(path: string): void;
    Error(a: any): void;
    Warning(a: any): void;
    Info(a: any): void;
    Print(a: any): void;
    private Log;
    private WriteLogToFile;
    private GetDate;
}
