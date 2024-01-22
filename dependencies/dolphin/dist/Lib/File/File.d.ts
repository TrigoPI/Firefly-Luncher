export default class File {
    private path;
    private content;
    private extension;
    private name;
    constructor(path: string, content: string);
    GetPath(): string;
    GetContent(): string;
    GetExtension(): string;
    GetName(): string;
}
