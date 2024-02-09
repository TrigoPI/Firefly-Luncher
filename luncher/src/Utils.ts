import axios, { AxiosResponse, ResponseType } from "axios";
import { mkdirSync } from "fs";
import { writeFile } from "fs/promises";

export class HttpError extends Error {
    public readonly status: number;
    public readonly body: any;
    
    public constructor(status: number, body: any) {
        super();
        this.status = status;
        this.body = body;
    }
}

export async function Get<T>(url: string, responseType: ResponseType): Promise<[T, Error]> {
    try {
        const res: AxiosResponse = await axios.get(url, { responseType });
        if (res.status >= 300) return [undefined as any, new HttpError(res.status, res.data)];
        return [res.data, undefined]
    } catch (e: any) {
        return [undefined, e];
    }
} 

export async function DownloadFile(url: string, outDir: string, filename: string): Promise<Error | undefined> {
    CreateFolderIfNotExist(outDir);
    const [buffer, err] = await Get<ArrayBuffer>(url, "arraybuffer");
    if (err) return err;
    await writeFile(`${outDir}/${filename}`, new Uint8Array(buffer));
}

export function CreateFolderIfNotExist(path: string): void {
    mkdirSync(path, { recursive: true });
}