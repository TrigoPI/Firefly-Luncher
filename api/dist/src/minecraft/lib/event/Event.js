"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = exports.EventClass = void 0;
class EventClass {
    GetType() {
        return 'EVENT';
    }
}
exports.EventClass = EventClass;
function Event(name) {
    return (target) => {
        return class extends target {
            constructor(...args) {
                super(...args);
            }
            GetType() {
                return name;
            }
            static GetStaticType() {
                return name;
            }
        };
    };
}
exports.Event = Event;
