"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function GetFileExtension(path) {
    const pathSplit = path.split("/");
    const file = pathSplit[pathSplit.length - 1];
    return file.split(".")[file.length - 1];
}
function GetFileName(path) {
    const pathSplit = path.split("/");
    const file = pathSplit[pathSplit.length - 1];
    return file.split(".")[0];
}
class File {
    constructor(path, content) {
        this.content = content;
        this.path = path.replace(/\\/g, "/");
        this.extension = GetFileExtension(this.path);
        this.name = GetFileName(this.path);
    }
    GetPath() {
        return this.path;
    }
    GetContent() {
        return this.content;
    }
    GetExtension() {
        return this.extension;
    }
    GetName() {
        return this.name;
    }
}
exports.default = File;
//# sourceMappingURL=File.js.map