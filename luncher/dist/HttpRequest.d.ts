import { ResponseType } from "axios";
export declare class HttpError extends Error {
    readonly status: number;
    readonly body: any;
    constructor(status: number, body: any);
}
export declare function Get<T>(url: string, responseType: ResponseType): Promise<[T, Error]>;
