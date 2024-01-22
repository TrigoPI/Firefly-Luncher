export default class HttpErrorException extends Error {
    public readonly code: number;
    public readonly body: string;
    public constructor(code: number, body: string, msg: string = "") {
        super(msg)
        this.code = code;
        this.body = body;
    }
}