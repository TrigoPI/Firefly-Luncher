export default class HttpResponse {
    private body: string;
    
    public constructor(body: string) {
        this.body = body;
    }

    public Text(): string {
        return this.body;
    }

    public Json<T>(): T {
        return JSON.parse(this.body);
    } 
}