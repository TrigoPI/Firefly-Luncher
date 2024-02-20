import { appendFileSync } from "fs";

export default class Logger {
    private className: string
    private logFile: string;
    private write: boolean;

    constructor(className: string) {
        this.className = className;
        this.write = false;
        this.logFile = undefined;
    }

    public WriteLog(a: boolean): void {
        this.write = a;
    }

    public SetLogPath(path: string): void {
        this.logFile = path;
    }

    public Error(a: any): void {
        this.Log(a, 31);    
    }

    public Warning(a: any): void {
        this.Log(a, 33);
    }
    
    public Info(a: any): void {
        this.Log(a, 32);
    }

    public Print(a: any): void {
        this.Log(a, 97);
    }

    private Log(text: any, color: number): void {
        const format: string = this.GetDate();
        const content: string = `[${this.className}-${format}] : ${text}`
        console.log(`\x1b[${color}m${content}\x1b[0m`)
        if (this.write) this.WriteLogToFile(content);
    }

    private WriteLogToFile(content: string): void {
        if (!this.logFile) return;
        appendFileSync(this.logFile, `${content}\r\n`, 'utf-8');
    }

    private GetDate(): string {
        const now: Date = new Date();
        const h: number = now.getHours();
        const m: number = now.getMinutes();
        const s: number = now.getSeconds();

        const heuresStr: string = h < 10 ? '0' + h : h.toString();
        const minutesStr: string = m < 10 ? '0' + m : m.toString();
        const secondesStr: string = s < 10 ? '0' + s : s.toString();

        return `${heuresStr}:${minutesStr}:${secondesStr}`;
    }
}