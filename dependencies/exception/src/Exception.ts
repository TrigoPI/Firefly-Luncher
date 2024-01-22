export default class Exception extends Error {
    public static ERROR: string = "ERROR";

    public readonly type: string
    public readonly context: Record<string, any>

    public constructor(msg: string, type: string, context: Record<string, any> = {}) {
        super(msg);
        this.type = type;
        this.context = context;
    }

    public GetError<T extends Error>(): T {
        return <T>this.context.error
    }

    public InstanceOf<T extends new(...arg: any[]) => Error>(a: T): boolean {
        if (this.type != Exception.ERROR) return false;
        return this.context.error instanceof a;
    }

    public ToString(): string {
        return `cause : ${this.message}\ncontext: ${JSON.stringify(this.context)}`;
    }

    public static EnsureError(err: any): Exception {
        if (err instanceof Exception) return err;
        if (err instanceof Error) return new Exception(err.message, Exception.ERROR, { error: err });

        let stringified = '[Unable to stringify the thrown value]';
        try {
            stringified = JSON.stringify(err);
        } catch {
            return new Exception(`This value was thrown as is, not through an Error: ${stringified}`, Exception.ERROR, { error: err });
        }
        return new Exception(`This value was thrown as is, not through an Error: ${stringified}`, Exception.ERROR, { error: err });
    }
}