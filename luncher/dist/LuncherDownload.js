"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpRequest_1 = require("./HttpRequest");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
class LuncherDownload {
    constructor() {
        this.versionManifestUrl = "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json";
        this.assetsUrl = "https://resources.download.minecraft.net";
        this.librarieUrl = "https://libraries.minecraft.net";
        this.versionInfoCache = {};
    }
    InstallVersion(mcVersion, root, os, arch) {
        return __awaiter(this, void 0, void 0, function* () {
            console.clear();
            console.log(`Downloading mincraft ${mcVersion} in ${root}`);
            console.log("   - Getting games versions");
            const path = root.replace(/\//g, "/");
            // console.log("   - Downloading minecraft jar");
            // await this.DownloadJar(mcVersion, path);
            // console.log("   - Downloading indexes");
            // await this.DownloadIndexes(mcVersion, path);
            // console.log("   - Downloading librarie");
            yield this.DownloadLibrarie(mcVersion, path, os, arch);
            // console.log("   - Downloading assets");
            // await this.DownloadAssets(mcVersion, path);
        });
    }
    DownloadJar(mcVersion, root) {
        return __awaiter(this, void 0, void 0, function* () {
            const versionInfo = yield this.GetVersionInfo(mcVersion);
            const jarUrl = versionInfo.downloads.client.url;
            this.CreateFolderIfNotExist(`${root}/versions/${versionInfo.id}`);
            yield this.DownloadFile(jarUrl, `${root}/versions/${versionInfo.id}`, `${versionInfo.id}.jar`);
            yield (0, promises_1.writeFile)(`${root}/versions/${versionInfo.id}/${versionInfo.id}.json`, JSON.stringify(versionInfo));
        });
    }
    DownloadLibrarie(mcVersion, root, os, arch) {
        return __awaiter(this, void 0, void 0, function* () {
            const versionInfo = yield this.GetVersionInfo(mcVersion);
            const libraries = versionInfo.libraries;
            // this.CreateFolderIfNotExist(`${root}/libraries`);
            for (const library of libraries) {
                const libraryNameSplit = library.name.split(":");
                const pkg = libraryNameSplit[0];
                const name = libraryNameSplit[1];
                const version = libraryNameSplit[2];
                const path = pkg.replace(/\./g, "/");
                // this.CreateFolderIfNotExist(`${root}/libraries/${path}/${name}/${version}`);
                if (this.HasRulesForOs(library, os)) {
                    const rule = this.GetRule(library, os);
                }
            }
        });
    }
    DownloadIndexes(mcVersion, root) {
        return __awaiter(this, void 0, void 0, function* () {
            const versionInfo = yield this.GetVersionInfo(mcVersion);
            const assetIndexId = versionInfo.assetIndex.id;
            const assetIndexUrl = versionInfo.assetIndex.url;
            this.CreateFolderIfNotExist(`${root}/assets/indexes`);
            yield this.DownloadFile(assetIndexUrl, `${root}/assets/indexes/`, `${assetIndexId}.json`);
        });
    }
    DownloadAssets(mcVersion, root) {
        return __awaiter(this, void 0, void 0, function* () {
            const assets = yield this.GetAssets(mcVersion);
            const keys = Object.keys(assets.objects);
            this.CreateFolderIfNotExist(`${root}/assets/objects`);
            for (const key of keys) {
                const asset = assets.objects[key];
                const assetId = asset.hash.substring(0, 2);
                console.log(`       - Downloading ${assetId}/${asset.hash}`);
                this.CreateFolderIfNotExist(`${root}/assets/objects/${assetId}`);
                const [buffer, err] = yield (0, HttpRequest_1.Get)(`${this.assetsUrl}/${assetId}/${asset.hash}`, 'arraybuffer');
                if (err)
                    throw err;
                yield (0, promises_1.writeFile)(`${root}/assets/objects/${assetId}/${asset.hash}`, new Uint8Array(buffer));
            }
        });
    }
    GetManifest() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.versionManisfest) {
                const [res, err] = yield (0, HttpRequest_1.Get)(this.versionManifestUrl, "json");
                if (err)
                    throw err;
                this.versionManisfest = res;
            }
            return this.versionManisfest;
        });
    }
    GetVersion(mcVerison) {
        return __awaiter(this, void 0, void 0, function* () {
            const versionManifest = yield this.GetManifest();
            const verison = versionManifest.versions.find((el) => el.id == mcVerison);
            if (!verison)
                throw new Error(`Cannot find mincraft version ${mcVerison}`);
            return verison;
        });
    }
    GetVersionInfo(mcVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.versionInfoCache[mcVersion])
                return this.versionInfoCache[mcVersion];
            const version = yield this.GetVersion(mcVersion);
            const [res, err] = yield (0, HttpRequest_1.Get)(version.url, "json");
            if (err)
                throw err;
            this.versionInfoCache[mcVersion] = res;
            return this.versionInfoCache[mcVersion];
        });
    }
    GetAssets(mcVerison) {
        return __awaiter(this, void 0, void 0, function* () {
            const versionInfo = yield this.GetVersionInfo(mcVerison);
            const [assets, err] = yield (0, HttpRequest_1.Get)(versionInfo.assetIndex.url, "json");
            if (err)
                throw err;
            return assets;
        });
    }
    DownloadFile(url, outDir, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            this.CreateFolderIfNotExist(outDir);
            const [buffer, err] = yield (0, HttpRequest_1.Get)(url, "arraybuffer");
            if (err)
                throw err;
            yield (0, promises_1.writeFile)(`${outDir}/${filename}`, new Uint8Array(buffer));
        });
    }
    GetRule(library, os) {
        if (!this.HasRulesForOs(library, os))
            return undefined;
        return library.rules.find((el) => el.os != undefined);
    }
    HasRulesForOs(library, os) {
        if (!library.rules)
            return false;
        return library.rules.find((el) => {
            if (!el.os)
                return false;
            return el.os.name == os;
        }) != undefined;
    }
    CreateFolderIfNotExist(path) {
        (0, fs_1.mkdirSync)(path, { recursive: true });
    }
}
exports.default = LuncherDownload;
//# sourceMappingURL=LuncherDownload.js.map