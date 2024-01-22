import { VersionManifest, Version, VersionInfo, Assets, Asset, Library, OsName, Arch, Rule } from "./Types";
import { Get } from "./HttpRequest";
import { mkdirSync } from "fs";
import { writeFile } from "fs/promises";

export default class LuncherDownload {
    private versionManifestUrl: string;
    private assetsUrl: string;
    private librarieUrl: string;
    private versionManisfest: VersionManifest;
    private versionInfoCache: Record<string, VersionInfo>;

    public constructor() {
        this.versionManifestUrl = "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json";
        this.assetsUrl = "https://resources.download.minecraft.net";
        this.librarieUrl = "https://libraries.minecraft.net";
        this.versionInfoCache = {};
    }

    public async InstallVersion(mcVersion: string, root: string, os: OsName, arch: Arch): Promise<void> {
        console.clear();
        console.log(`Downloading mincraft ${mcVersion} in ${root}`);
        console.log("   - Getting games versions");

        const path: string = root.replace(/\//g, "/");

        // console.log("   - Downloading minecraft jar");
        // await this.DownloadJar(mcVersion, path);
        
        // console.log("   - Downloading indexes");
        // await this.DownloadIndexes(mcVersion, path);

        // console.log("   - Downloading librarie");
        await this.DownloadLibrarie(mcVersion, path, os, arch);

        // console.log("   - Downloading assets");
        // await this.DownloadAssets(mcVersion, path);

    }

    private async DownloadJar(mcVersion: string, root: string): Promise<void> {
        const versionInfo: VersionInfo = await this.GetVersionInfo(mcVersion); 
        const jarUrl: string = versionInfo.downloads.client.url;

        this.CreateFolderIfNotExist(`${root}/versions/${versionInfo.id}`);
        
        await this.DownloadFile(jarUrl, `${root}/versions/${versionInfo.id}`, `${versionInfo.id}.jar`);
        await writeFile(`${root}/versions/${versionInfo.id}/${versionInfo.id}.json`, JSON.stringify(versionInfo));
    }

    private async DownloadLibrarie(mcVersion: string, root: string, os: OsName, arch: Arch): Promise<void> {
        const versionInfo: VersionInfo = await this.GetVersionInfo(mcVersion); 
        const libraries: Library[] = versionInfo.libraries;
        
        // this.CreateFolderIfNotExist(`${root}/libraries`);

        for (const library of libraries) {
            const libraryNameSplit: string[] = library.name.split(":");
            const pkg: string = libraryNameSplit[0];
            const name: string = libraryNameSplit[1];
            const version: string = libraryNameSplit[2];
            const path: string = pkg.replace(/\./g, "/");
            
            // this.CreateFolderIfNotExist(`${root}/libraries/${path}/${name}/${version}`);
            
            if (this.HasRulesForOs(library, os)) {                
                const rule: Rule = this.GetRule(library, os);
                
            }
        }
    }

    private async DownloadIndexes(mcVersion: string, root: string): Promise<void> {
        const versionInfo: VersionInfo = await this.GetVersionInfo(mcVersion); 
        const assetIndexId: string = versionInfo.assetIndex.id;
        const assetIndexUrl: string = versionInfo.assetIndex.url;

        this.CreateFolderIfNotExist(`${root}/assets/indexes`);
        
        await this.DownloadFile(assetIndexUrl, `${root}/assets/indexes/`, `${assetIndexId}.json`);
    }

    private async DownloadAssets(mcVersion: string, root: string): Promise<void> {
        const assets: Assets = await this.GetAssets(mcVersion);
        const keys: string[] = Object.keys(assets.objects);

        this.CreateFolderIfNotExist(`${root}/assets/objects`);
        
        for (const key of keys) {
            const asset: Asset = assets.objects[key];
            const assetId: string = asset.hash.substring(0, 2);

            console.log(`       - Downloading ${assetId}/${asset.hash}`);
            this.CreateFolderIfNotExist(`${root}/assets/objects/${assetId}`);

            const [buffer, err] = await Get<ArrayBuffer>(`${this.assetsUrl}/${assetId}/${asset.hash}`, 'arraybuffer');
            if (err) throw err;

            await writeFile(`${root}/assets/objects/${assetId}/${asset.hash}`, new Uint8Array(buffer));
        }
    }

    private async GetManifest(): Promise<VersionManifest> {
        if (!this.versionManisfest) {
            const [res, err] = await Get<VersionManifest>(this.versionManifestUrl, "json");
            if (err) throw err;
            this.versionManisfest = res;
        }

        return this.versionManisfest;
    }

    private async GetVersion(mcVerison: string): Promise<Version> {
        const versionManifest: VersionManifest = await this.GetManifest();
        const verison: Version | undefined = versionManifest.versions.find((el: Version) => el.id == mcVerison);
        if (!verison) throw new Error(`Cannot find mincraft version ${mcVerison}`);
        return verison;
    }

    private async GetVersionInfo(mcVersion: string): Promise<VersionInfo> {
        if (this.versionInfoCache[mcVersion]) return this.versionInfoCache[mcVersion];
        const version: Version = await this.GetVersion(mcVersion);
        const [res, err] = await Get<VersionInfo>(version.url, "json");
        if (err) throw err;
        this.versionInfoCache[mcVersion] = res;
        return this.versionInfoCache[mcVersion];
    }

    private async GetAssets(mcVerison: string): Promise<Assets> {
        const versionInfo: VersionInfo = await this.GetVersionInfo(mcVerison);
        const [assets, err] = await Get<Assets>(versionInfo.assetIndex.url, "json");
        if (err) throw err;
        return assets;
    }

    private async DownloadFile(url: string, outDir: string, filename: string): Promise<void> {
        this.CreateFolderIfNotExist(outDir);
        const [buffer, err] = await Get<ArrayBuffer>(url, "arraybuffer");
        if (err) throw err;
        await writeFile(`${outDir}/${filename}`, new Uint8Array(buffer));
    }

    private GetRule(library: Library, os: OsName): Rule {
        if (!this.HasRulesForOs(library, os)) return undefined;
        return library.rules.find((el: Rule) => el.os != undefined)
    }

    private HasRulesForOs(library: Library, os: OsName): boolean {
        if (!library.rules) return false;
        return library.rules.find((el: Rule) => {
            if (!el.os) return false;
            return el.os.name == os;
        }) != undefined;
    }

    private CreateFolderIfNotExist(path: string): void {
        mkdirSync(path, { recursive: true });
    }
}