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
exports.CreateFolderIfNotExist = exports.DownloadFile = exports.Get = exports.HttpError = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
class HttpError extends Error {
    constructor(status, body) {
        super();
        this.status = status;
        this.body = body;
    }
}
exports.HttpError = HttpError;
function Get(url, responseType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axios_1.default.get(url, { responseType });
            if (res.status >= 300)
                return [undefined, new HttpError(res.status, res.data)];
            return [res.data, undefined];
        }
        catch (e) {
            return [undefined, e];
        }
    });
}
exports.Get = Get;
function DownloadFile(url, outDir, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        CreateFolderIfNotExist(outDir);
        const [buffer, err] = yield Get(url, "arraybuffer");
        if (err)
            return err;
        yield (0, promises_1.writeFile)(`${outDir}/${filename}`, new Uint8Array(buffer));
    });
}
exports.DownloadFile = DownloadFile;
function CreateFolderIfNotExist(path) {
    (0, fs_1.mkdirSync)(path, { recursive: true });
}
exports.CreateFolderIfNotExist = CreateFolderIfNotExist;
