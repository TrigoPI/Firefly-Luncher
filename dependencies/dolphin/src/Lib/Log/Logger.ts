export default class Logger {
    private className: string

    constructor(className: string) {
        this.className = className;
    }

    public Error(a: any, fun: Function | null = null): void {
        if (!fun) {
            console.error(`\x1b[31m[${this.className}] : ${a}\x1b[0m`);
            return;
        }
        console.error(`\x1b[31m[${this.className}/${fun.name}] : ${a}\x1b[0m`);
    }

    public Warning(a: any, fun: Function | null = null): void {
        if (!fun) {
            console.warn(`\x1b[33m[${this.className}] : ${a}\x1b[0m`);
            return;
        }
        console.warn(`\x1b[33m[${this.className}] : ${a}\x1b[0m`);
    }
    
    public Info(a: any, fun: Function | null = null): void {
        if (!fun) {
            console.info(`\x1b[32m[${this.className}] : ${a}\x1b[0m`);
            return;
        }
        console.info(`\x1b[32m[${this.className}/${fun.name}] : ${a}\x1b[0m`);
    }

    public Print(a: any, fun: Function | null = null): void {
        if (!fun) {
            console.log(`[${this.className}] : ${a}`);
            return;
        }
        console.log(`[${this.className}/${fun.name}]] : ${a}`);
    }
}