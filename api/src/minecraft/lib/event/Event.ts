export type EventHandler = (e: EventClass) => void;

export class EventClass {
    public GetType(): string {
        return 'EVENT'
    }
}

export function Event(name: string) {
    return <T extends new(...args: any[]) => EventClass>(target: T) => {
        return class extends target {
            public constructor(...args: any[]) {
                super(...args)
            }

            public GetType(): string {
                return name
            }

            public static GetStaticType(): string {
                return name;
            }
        }
    }
}