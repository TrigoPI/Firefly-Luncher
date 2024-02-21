import { readTextFile } from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";

export default class Ressources {
    private static luncherPath: string;

    public static async Init(): Promise<void> {
        this.luncherPath = (await resolveResource('luncher/src/index.cjs')).replace("\\\\?\\", "");
    }

    public static get LUNCHER(): string {
        return this.luncherPath;
    }
} 