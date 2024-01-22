export default class HttpErrorException extends Error {
    readonly code: number;
    readonly body: string;
    constructor(code: number, body: string, msg?: string);
}
