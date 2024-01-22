export type ForchCallback<T> = (a: T, i: number) => void;
export type Iterator<T> = () => {
    value: T;
    done: boolean;
};
export declare abstract class List<T> {
    protected buffer: T[];
    protected constructor();
    IsEmpty(): boolean;
    Length(): number;
    [Symbol.iterator](): {
        next: Iterator<T>;
    };
    abstract Pop(): T;
    abstract Push(a: T): void;
    abstract ForEach(callback: ForchCallback<T>): Promise<void>;
    protected abstract Next(): Iterator<T>;
}
