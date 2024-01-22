"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpResponse {
    constructor(body) {
        this.body = body;
    }
    Text() {
        return this.body;
    }
    Json() {
        return JSON.parse(this.body);
    }
}
exports.default = HttpResponse;
