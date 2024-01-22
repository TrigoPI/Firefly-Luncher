"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventDispatcher {
    constructor(event) {
        this.event = event;
    }
    Dispatch(type, callback) {
        if (type.GetStaticType() != this.event.GetType())
            return true;
        callback(this.event);
        return true;
    }
}
exports.default = EventDispatcher;
