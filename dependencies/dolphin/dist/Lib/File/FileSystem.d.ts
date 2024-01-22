import File from "./File";
import Directory from "./Directory";
export declare class FileSystem {
    static ReadDir(path: string): Promise<Directory>;
    static ReadFile(path: string): Promise<File>;
}
