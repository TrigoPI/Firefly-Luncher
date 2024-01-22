import HttpErrorException from "./Exception";
import HttpResponse from "./HttpResponse";
export default class RestClient {
    private constructor();
    static Get(url: string): Promise<[HttpResponse, HttpErrorException]>;
    static Post(url: string, datas?: Record<string, any> | undefined): Promise<[HttpResponse, HttpErrorException]>;
    static PostForm(url: string, body: FormData): Promise<[HttpResponse, HttpErrorException]>;
}
