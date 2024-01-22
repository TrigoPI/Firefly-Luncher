import { OsName, Arch } from "./Types";
export default class LuncherDownload {
    private versionManifestUrl;
    private assetsUrl;
    private librarieUrl;
    private versionManisfest;
    private versionInfoCache;
    constructor();
    InstallVersion(mcVersion: string, root: string, os: OsName, arch: Arch): Promise<void>;
    private DownloadJar;
    private DownloadLibrarie;
    private DownloadIndexes;
    private DownloadAssets;
    private GetManifest;
    private GetVersion;
    private GetVersionInfo;
    private GetAssets;
    private DownloadFile;
    private GetRule;
    private HasRulesForOs;
    private CreateFolderIfNotExist;
}
