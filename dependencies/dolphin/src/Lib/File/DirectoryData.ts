type FileType = "file" | "directory";

export default class DirectoryData {
    public readonly type: FileType;
    public readonly name: string;
    public readonly path: string;

    public constructor(type: FileType, path: string, name: string) {
        this.type = type;
        this.name = name;
        this.path = `${path}`;
    }
}