import { EventClass } from "./Event";

export default class EventDispatcher {
    private event: EventClass;

    public constructor(event: EventClass) {
        this.event = event;
    }

    public Dispatch<T extends EventClass>(type: { new(...args: any): T }, callback: (e: T) => void): boolean {
        if ((<any>type).GetStaticType() != this.event.GetType()) return true;
        callback(<T>this.event);
        return true;
    }
}