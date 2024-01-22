import DirectoryData from "./DirectoryData";
export default class Directory {
    private path;
    private content;
    constructor(path: string, content: DirectoryData[]);
    ForEach(callback: (data: DirectoryData) => void): void;
    GetContent(): DirectoryData[];
    GetPath(): string;
    GetCount(): number;
}
