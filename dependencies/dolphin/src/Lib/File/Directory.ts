import DirectoryData from "./DirectoryData";

export default class Directory {
    private path: string;
    private content: DirectoryData[];    

    public constructor(path: string, content: DirectoryData[]) {
        this.content = content;
        this.path = path.replace(/\\/g, "/");
    }

    public ForEach(callback: (data: DirectoryData) => void): void {
        this.content.forEach((data: DirectoryData) => callback(data));
    }

    public GetContent(): DirectoryData[] {
        return this.content;
    }

    public GetPath(): string {
        return this.path;
    }

    public GetCount(): number {
        return this.content.length;
    }
}