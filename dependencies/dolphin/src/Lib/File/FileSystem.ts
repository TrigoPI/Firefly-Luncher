import { readFile, readdir, stat } from "fs/promises";
import { Stats } from "fs";

import File from "./File";
import Directory from "./Directory";
import DirectoryData from "./DirectoryData";

export class FileSystem {
    public static async ReadDir(path: string): Promise<Directory> {
        const data: string[] = await readdir(path);
        const directoryDatas: DirectoryData[] = [];

        for (const name of data) {
            const stats: Stats = await stat(`${path}/${name}`);
            const data: DirectoryData = new DirectoryData(stats.isFile()? "file" : "directory", `${path}/${name}`, name);
            directoryDatas.push(data);
        }

        return new Directory(path, directoryDatas);
    }

    public static async ReadFile(path: string): Promise<File> {
        const data: string = await readFile(path, { encoding: 'utf-8' });
        return new File(path, data);
    }
}