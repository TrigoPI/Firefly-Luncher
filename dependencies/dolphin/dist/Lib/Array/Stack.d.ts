import { List, Iterator, ForchCallback } from "./List";
export default class Stack<T> extends List<T> {
    constructor();
    Top(): T;
    Pop(): T;
    Push(a: T): void;
    ForEach(callback: ForchCallback<T>): Promise<void>;
    protected Next(): Iterator<T>;
}
