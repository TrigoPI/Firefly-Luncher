function GetFileExtension(path: string): string {
    const pathSplit: string[] = path.split("/");
    const file: string = pathSplit[pathSplit.length - 1];
    return file.split(".")[file.length - 1];
}

function GetFileName(path: string): string {
    const pathSplit: string[] = path.split("/");
    const file: string = pathSplit[pathSplit.length - 1];
    return file.split(".")[0];
}

export default class File {
    private path: string;
    private content: string;
    private extension: string;
    private name: string;

    public constructor(path: string, content: string) {
        this.content = content;
        this.path = path.replace(/\\/g, "/");
        this.extension = GetFileExtension(this.path);
        this.name = GetFileName(this.path);
    }

    public GetPath(): string {
        return this.path;
    }

    public GetContent(): string {
        return this.content;
    }

    public GetExtension(): string {
        return this.extension;
    }

    public GetName(): string {
        return this.name;
    }
}