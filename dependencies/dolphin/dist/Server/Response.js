"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = exports.MediaType = exports.Status = void 0;
var Status;
(function (Status) {
    Status[Status["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    Status[Status["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    Status[Status["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    Status[Status["NOT_FOUND"] = 404] = "NOT_FOUND";
    Status[Status["FORBIDDEN"] = 403] = "FORBIDDEN";
    Status[Status["CONFLICT"] = 409] = "CONFLICT";
    Status[Status["OK"] = 200] = "OK";
    Status[Status["CREATED"] = 201] = "CREATED";
    Status[Status["NO_CONTENT"] = 204] = "NO_CONTENT";
})(Status || (exports.Status = Status = {}));
var MediaType;
(function (MediaType) {
    MediaType[MediaType["EMPTY"] = 0] = "EMPTY";
    MediaType[MediaType["PLAIN_TEXT"] = 1] = "PLAIN_TEXT";
    MediaType[MediaType["PLAIN_HTML"] = 2] = "PLAIN_HTML";
    MediaType[MediaType["APPLICATION_JSON"] = 3] = "APPLICATION_JSON";
    MediaType[MediaType["FILE"] = 4] = "FILE";
})(MediaType || (exports.MediaType = MediaType = {}));
class Response {
    constructor(body, type, code) {
        this.body = body;
        this.type = type;
        this.code = code;
    }
    static InternalServerError() {
        return new Response("", MediaType.EMPTY, Status.INTERNAL_SERVER_ERROR);
    }
    static Conflict() {
        return new Response("", MediaType.EMPTY, Status.CONFLICT);
    }
    static NotFound() {
        return new Response("", MediaType.EMPTY, Status.NOT_FOUND);
    }
    static Unauthorized() {
        return new Response("", MediaType.EMPTY, Status.UNAUTHORIZED);
    }
    static Created() {
        return new Response("", MediaType.EMPTY, Status.CREATED);
    }
    static Ok() {
        return new Response("", MediaType.EMPTY, Status.NO_CONTENT);
    }
    static Json(body, code = Status.OK) {
        const json = JSON.stringify(body);
        return new Response(json, MediaType.APPLICATION_JSON, code);
    }
    static Text(text, code = Status.OK) {
        return new Response(text, MediaType.PLAIN_TEXT, code);
    }
    static File(path, filename = "", code = Status.OK) {
        const json = JSON.stringify({ path, filename });
        return new Response(json, MediaType.FILE, code);
    }
}
exports.Response = Response;
//# sourceMappingURL=Response.js.map