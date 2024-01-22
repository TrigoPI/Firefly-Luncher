"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ServiceLuncher_1 = __importDefault(require("./ServiceLuncher"));
function EntryPoint(servicePath) {
    return (target) => {
        ServiceLuncher_1.default.Create(servicePath);
        target.CreateApplication();
    };
}
exports.default = EntryPoint;
;
//# sourceMappingURL=EntryPoint.js.map