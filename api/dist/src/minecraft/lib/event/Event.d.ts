export type EventHandler = (e: EventClass) => void;
export declare class EventClass {
    GetType(): string;
}
export declare function Event(name: string): <T extends new (...args: any[]) => EventClass>(target: T) => {
    new (...args: any[]): {
        GetType(): string;
    };
    GetStaticType(): string;
} & T;
