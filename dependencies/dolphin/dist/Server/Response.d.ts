export declare enum Status {
    INTERNAL_SERVER_ERROR = 500,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    FORBIDDEN = 403,
    CONFLICT = 409,
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204
}
export declare enum MediaType {
    EMPTY = 0,
    PLAIN_TEXT = 1,
    PLAIN_HTML = 2,
    APPLICATION_JSON = 3
}
export declare class Response {
    readonly body: string;
    readonly type: MediaType;
    readonly code: Status;
    constructor(body: string, type: number, code: number);
    static InternalServerError(): Response;
    static Conflict(): Response;
    static NotFound(): Response;
    static Unauthorized(): Response;
    static Created(): Response;
    static Ok(): Response;
    static Json<T extends Record<string, any>>(body: T, code?: number): Response;
    static Text(text: string, code?: number): Response;
}
