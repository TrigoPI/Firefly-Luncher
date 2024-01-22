type FileType = "file" | "directory";
export default class DirectoryData {
    readonly type: FileType;
    readonly name: string;
    readonly path: string;
    constructor(type: FileType, path: string, name: string);
}
export {};
