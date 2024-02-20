import app from "@conf/app.json";

import dateFormat from 'dateformat';
import { createDir, exists, writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { exit } from '@tauri-apps/api/process';
import { Command } from "@tauri-apps/api/shell";

export class Tauri {
    public static async WriteLog(file: string, content: string): Promise<void> {
        const logExist: boolean = await exists("", { dir: BaseDirectory.AppLog });
        const date: Date = new Date();
        const format: string = dateFormat(date, "HH:mm:ss");

        if (!logExist) await createDir("", { dir: BaseDirectory.AppLog, recursive: true });
        await writeTextFile(file, `[WEB-${format}] : ${content}\r\n`, { dir: BaseDirectory.AppLog, append: true });

        console.log(`[WEB-${format}] : ${content}\r\n`);
    }

    public static async LunchBackend(): Promise<void> {
        const command: Command = new Command(`node`, [`${app.backend}/index.js`]);
        command.stdout.on('data', line => Tauri.WriteLog("log.txt", line));
        await command.spawn();
    }

    public static async CloseApp(): Promise<void> {
        await exit(0);
    }
}