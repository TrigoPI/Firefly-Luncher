export enum Status {
    INTERNAL_SERVER_ERROR   = 500,

    BAD_REQUEST             = 400,
    UNAUTHORIZED            = 401,
    NOT_FOUND               = 404,
    FORBIDDEN               = 403,
    CONFLICT                = 409,

    OK                      = 200,
    CREATED                 = 201,
    NO_CONTENT              = 204,
}

export enum MediaType {
    EMPTY,

    PLAIN_TEXT,
    PLAIN_HTML,

    APPLICATION_JSON
}

export class Response {
    public readonly body: string;
    public readonly type: MediaType;
    public readonly code: Status;

    public constructor(body: string, type: number, code: number) {
        this.body = body;
        this.type = type;
        this.code = code;
    }

    public static InternalServerError(): Response {
        return new Response("", MediaType.EMPTY, Status.INTERNAL_SERVER_ERROR);
    }

    public static Conflict(): Response {
        return new Response("", MediaType.EMPTY, Status.CONFLICT);
    }

    public static NotFound(): Response {
        return new Response("", MediaType.EMPTY, Status.NOT_FOUND);
    }

    public static Unauthorized(): Response {
        return new Response("", MediaType.EMPTY, Status.UNAUTHORIZED);
    }

    public static Created(): Response {
        return new Response("", MediaType.EMPTY, Status.CREATED);
    }

    public static Ok(): Response {
        return new Response("", MediaType.EMPTY, Status.NO_CONTENT);
    }

    public static Json<T extends Record<string, any>>(body: T, code: number = Status.OK): Response {
        const json: string = JSON.stringify(body);
        return new Response(json, MediaType.APPLICATION_JSON, code);
    }

    public static Text(text: string, code: number = Status.OK): Response {
        return new Response(text, MediaType.PLAIN_TEXT, code);
    }
} 