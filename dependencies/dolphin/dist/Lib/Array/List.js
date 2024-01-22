"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
class List {
    constructor() {
        this.buffer = [];
    }
    IsEmpty() {
        return this.buffer.length == 0;
    }
    Length() {
        return this.buffer.length;
    }
    [Symbol.iterator]() {
        return { next: this.Next() };
    }
}
exports.List = List;
//# sourceMappingURL=List.js.map