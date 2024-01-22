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
Object.defineProperty(exports, "__esModule", { value: true });
const List_1 = require("./List");
class Stack extends List_1.List {
    constructor() {
        super();
    }
    Top() {
        return this.buffer[this.buffer.length - 1];
    }
    Pop() {
        if (this.buffer.length == 0)
            throw new Error(`Stack is empty`);
        return this.buffer.pop();
    }
    Push(a) {
        this.buffer.push(a);
    }
    ForEach(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = this.Length() - 1; i >= 0; i--)
                callback(this.buffer[i], i);
        });
    }
    Next() {
        let i = this.Length() - 1;
        return () => ({ value: this.buffer[i], done: --i == -1 });
    }
}
exports.default = Stack;
//# sourceMappingURL=Stack.js.map