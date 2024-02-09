import { ResponseType } from "axios";
export declare class HttpError extends Error {
    readonly status: number;
    readonly body: any;
    constructor(status: number, body: any);
}
export declare function Get<T>(url: string, responseType: ResponseType): Promise<[T, Error]>;
export declare function DownloadFile(url: string, outDir: string, filename: string): Promise<Error | undefined>;
export declare function CreateFolderIfNotExist(path: string): void;
