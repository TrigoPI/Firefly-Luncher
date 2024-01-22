"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Directory {
    constructor(path, content) {
        this.content = content;
        this.path = path.replace(/\\/g, "/");
    }
    ForEach(callback) {
        this.content.forEach((data) => callback(data));
    }
    GetContent() {
        return this.content;
    }
    GetPath() {
        return this.path;
    }
    GetCount() {
        return this.content.length;
    }
}
exports.default = Directory;
//# sourceMappingURL=Directory.js.map