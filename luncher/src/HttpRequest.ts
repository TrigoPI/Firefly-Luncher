import axios, { AxiosResponse, ResponseType } from "axios";

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