"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Exception_1 = __importDefault(require("./Exception"));
const HttpResponse_1 = __importDefault(require("./HttpResponse"));
class RestClient {
    constructor() { }
    ;
    static Get(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield fetch(url);
                const text = yield res.text();
                if (res.status >= 300)
                    return [undefined, new Exception_1.default(res.status, text, `Error while fetching [get:${res.status}]/${url}`)];
                return [new HttpResponse_1.default(text), undefined];
            }
            catch (e) {
                return [undefined, e];
            }
        });
    }
    static Post(url, datas = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const method = 'POST';
                const headers = { 'Content-Type': 'application/json' };
                const body = JSON.stringify(datas);
                const req = { method, headers, body };
                const res = yield fetch(url, req);
                const text = yield res.text();
                if (res.status >= 300)
                    return [undefined, new Exception_1.default(res.status, text, `Error while fetching [post:${res.status}]/${url}`)];
                return [new HttpResponse_1.default(text), undefined];
            }
            catch (e) {
                return [undefined, e];
            }
        });
    }
    static PostForm(url, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const method = 'POST';
                const req = { method, body };
                const res = yield fetch(url, req);
                const text = yield res.text();
                if (res.status >= 300)
                    return [undefined, new Exception_1.default(res.status, text, `Error while fetching [post:${res.status}]/${url}`)];
                return [new HttpResponse_1.default(text), undefined];
            }
            catch (e) {
                return [undefined, e];
            }
        });
    }
}
exports.default = RestClient;
