export default class HttpResponse {
    private body;
    private buffer;
    constructor(body: string);
    Text(): string;
    Json<T>(): T;
}
