import { List, Iterator, ForchCallback } from "./List";

export default class Stack<T> extends List<T> {
    public constructor() { 
        super();
    }
    
    public Top(): T {
        return this.buffer[this.buffer.length - 1];
    }
    
    public Pop(): T {
        if (this.buffer.length == 0) throw new Error(`Stack is empty`);
        return this.buffer.pop();
    }
    
    public Push(a: T): void {
        this.buffer.push(a);
    }
    
    public async ForEach(callback: ForchCallback<T>): Promise<void> {
        for (let i = this.Length() - 1; i >= 0; i--) callback(this.buffer[i], i);
    }

    protected Next(): Iterator<T> {
        let i: number = this.Length() - 1;
        return () => ({ value: this.buffer[i], done: --i == -1})
    }
}