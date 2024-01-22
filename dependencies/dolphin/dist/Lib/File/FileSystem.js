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
exports.FileSystem = void 0;
const promises_1 = require("fs/promises");
const File_1 = __importDefault(require("./File"));
const Directory_1 = __importDefault(require("./Directory"));
const DirectoryData_1 = __importDefault(require("./DirectoryData"));
class FileSystem {
    static ReadDir(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield (0, promises_1.readdir)(path);
            const directoryDatas = [];
            for (const name of data) {
                const stats = yield (0, promises_1.stat)(`${path}/${name}`);
                const data = new DirectoryData_1.default(stats.isFile() ? "file" : "directory", `${path}/${name}`, name);
                directoryDatas.push(data);
            }
            return new Directory_1.default(path, directoryDatas);
        });
    }
    static ReadFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield (0, promises_1.readFile)(path, { encoding: 'utf-8' });
            return new File_1.default(path, data);
        });
    }
}
exports.FileSystem = FileSystem;
//# sourceMappingURL=FileSystem.js.map