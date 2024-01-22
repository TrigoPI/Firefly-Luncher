import { EventClass } from "./Event";
export default class EventDispatcher {
    private event;
    constructor(event: EventClass);
    Dispatch<T extends EventClass>(type: {
        new (...args: any): T;
    }, callback: (e: T) => void): boolean;
}
