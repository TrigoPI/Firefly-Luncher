export type ForchCallback<T> = (a: T, i: number) => void;
export type Iterator<T> = () => { value: T, done: boolean };

export abstract class List<T> {
    protected buffer: T[];

    protected constructor() {
        this.buffer = [];
    }
    
    public IsEmpty(): boolean {
        return this.buffer.length == 0;
    }

    public Length(): number {
        return this.buffer.length;
    }
    
    
    [Symbol.iterator]() {
        return { next: this.Next() }
    }
    
    public abstract Pop(): T;
    public abstract Push(a: T): void;
    public abstract ForEach(callback: ForchCallback<T>): Promise<void>

    protected abstract Next(): Iterator<T>;
} 