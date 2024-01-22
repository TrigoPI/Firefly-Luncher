import HttpErrorException from "./Exception";
import HttpResponse from "./HttpResponse";

export default class RestClient {
    private constructor() {};

    public static async Get(url: string): Promise<[HttpResponse, HttpErrorException]> {
        try {
            const res: Response = await fetch(url);
            const text: string = await res.text();
            if (res.status >= 300) return [undefined as any, new HttpErrorException(res.status, text, `Error while fetching [get:${res.status}]/${url}`)];
            return [new HttpResponse(text), undefined as any];
        } catch (e: any) {
            return [undefined as any, e];
        }
    }

    public static async Post(url: string, datas: Record<string, any> | undefined = undefined): Promise<[HttpResponse, HttpErrorException]> {
        try {
            const method: string = 'POST';
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            const body: string = JSON.stringify(datas);
            const req: RequestInit = { method, headers, body };
            const res: Response = await fetch(url, req);
            const text: string = await res.text();
            if (res.status >= 300) return [undefined as any, new HttpErrorException(res.status, text, `Error while fetching [post:${res.status}]/${url}`)];
            return [new HttpResponse(text), undefined as any];
        } catch (e: any) {
            return [undefined as any, e];
        }
    }

    public static async PostForm(url: string, body: FormData): Promise<[HttpResponse, HttpErrorException]> {
        try {
            const method: string = 'POST';
            const req: RequestInit = { method, body };
            const res: Response = await fetch(url, req);
            const text: string = await res.text();
            if (res.status >= 300) return [undefined as any, new HttpErrorException(res.status, text, `Error while fetching [post:${res.status}]/${url}`)];
            return [new HttpResponse(text), undefined as any];
        } catch (e: any) {
            return [undefined as any, e];
        }
    }
}