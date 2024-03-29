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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgeInstaller = exports.McInstaller = void 0;
const conf_json_1 = __importDefault(require("../conf.json"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const forge_site_parser_1 = require("@xmcl/forge-site-parser");
const child_process_1 = require("child_process");
const node_stream_zip_1 = __importDefault(require("node-stream-zip"));
const InstallerConf_cjs_1 = require("./InstallerConf.cjs");
const Utils_cjs_1 = require("./Utils.cjs");
const Logger_cjs_1 = __importDefault(require("./Logger.cjs"));
class McInstaller {
    constructor(version, os, root) {
        this.logger = new Logger_cjs_1.default(McInstaller.name);
        this.logger.SetLogPath(`${(0, Utils_cjs_1.GetAppData)()}/${conf_json_1.default.root}/${conf_json_1.default.dirs.logs}/log.txt`);
        this.logger.WriteLog(true);
        this.versionManifestUrl = InstallerConf_cjs_1.MINECRAFT_URL.MANIFEST;
        this.assetsUrl = InstallerConf_cjs_1.MINECRAFT_URL.ASSET;
        this.versionInfoCache = {};
        this.version = version;
        this.os = os;
        this.root = root.replace(/\//g, "/");
    }
    InstallVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.DownloadJar();
            yield this.DownloadIndexes();
            yield this.DownloadAssets();
            yield this.DownloadLibraries();
        });
    }
    AddStepCallback(cb) {
        this.stepCallback = cb;
    }
    GetManifest() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.manifest) {
                if ((0, fs_1.existsSync)(`${this.root}/versions/version_manifest_v2.json`)) {
                    const buffer = (0, fs_1.readFileSync)(`${this.root}/versions/version_manifest_v2.json`);
                    this.manifest = JSON.parse(buffer.toString());
                }
                else {
                    const [res, err] = yield (0, Utils_cjs_1.Get)(this.versionManifestUrl, "json");
                    if (err)
                        throw err;
                    const resString = JSON.stringify(res);
                    yield (0, promises_1.mkdir)(`${this.root}/versions`, { recursive: true });
                    yield (0, promises_1.appendFile)(`${this.root}/versions/version_manifest_v2.json`, Buffer.from(resString));
                    this.manifest = res;
                }
            }
            return this.manifest;
        });
    }
    GetVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const versionManifest = yield this.GetManifest();
            const verison = versionManifest.versions.find((el) => el.id == this.version);
            if (!verison)
                throw new Error(`Cannot find minecraft version ${this.version}`);
            return verison;
        });
    }
    GetVersionInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.versionInfoCache[this.version])
                return this.versionInfoCache[this.version];
            const version = yield this.GetVersion();
            if ((0, fs_1.existsSync)(`${this.root}/versions/${this.version}/${this.version}.json`)) {
                const buffer = (0, fs_1.readFileSync)(`${this.root}/versions/${this.version}/${this.version}.json`);
                this.versionInfoCache[this.version] = JSON.parse(buffer.toString());
            }
            else {
                const [res, err] = yield (0, Utils_cjs_1.Get)(version.url, "json");
                if (err)
                    throw err;
                const infoString = JSON.stringify(res);
                const buffer = Buffer.from(infoString);
                yield (0, promises_1.mkdir)(`${this.root}/versions/${this.version}`, { recursive: true });
                yield (0, promises_1.appendFile)(`${this.root}/versions/${this.version}/${this.version}.json`, buffer);
                this.versionInfoCache[this.version] = res;
            }
            return this.versionInfoCache[this.version];
        });
    }
    GetAssets() {
        return __awaiter(this, void 0, void 0, function* () {
            const versionInfo = yield this.GetVersionInfo();
            const id = versionInfo.assetIndex.id;
            let assets;
            if ((0, fs_1.existsSync)(`${this.root}/assets/indexes/${id}.json`)) {
                const buffer = yield (0, promises_1.readFile)(`${this.root}/assets/indexes/${id}.json`);
                assets = JSON.parse(buffer.toString());
            }
            else {
                const [res, err] = yield (0, Utils_cjs_1.Get)(versionInfo.assetIndex.url, "json");
                if (err)
                    throw err;
                const assetString = JSON.stringify(res);
                const buffer = Buffer.from(assetString);
                (0, fs_1.mkdirSync)(`${this.root}/assets/indexes`, { recursive: true });
                (0, fs_1.appendFileSync)(`${this.root}/assets/indexes/${id}.json`, buffer);
                assets = res;
            }
            return assets;
        });
    }
    GetSize() {
        return __awaiter(this, void 0, void 0, function* () {
            let total = 0;
            const versionInfo = yield this.GetVersionInfo();
            const assets = yield this.GetAssets();
            total += versionInfo.downloads.client.size;
            for (const lib of versionInfo.libraries) {
                if (this.IsLibraryAllowed(lib, this.os)) {
                    const artifact = this.GetArtifact(lib, this.os);
                    total += artifact.size;
                }
            }
            for (const key in assets.objects) {
                total += assets.objects[key].size;
            }
            return total;
        });
    }
    DownloadJar() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Print("Downloading minecraft jar");
            const versionInfo = yield this.GetVersionInfo();
            const jarUrl = versionInfo.downloads.client.url;
            (0, Utils_cjs_1.CreateFolderIfNotExist)(`${this.root}/versions/${versionInfo.id}`);
            if (!(0, fs_1.existsSync)(`${this.root}/versions/${this.version}/${this.version}.jar`)) {
                this.logger.Print("Downloading client...");
                const err = yield (0, Utils_cjs_1.DownloadFile)(jarUrl, `${this.root}/versions/${versionInfo.id}`, `${versionInfo.id}.jar`);
                if (err)
                    throw err;
            }
            else {
                this.logger.Info("Client already installed");
            }
            if (!(0, fs_1.existsSync)(`${this.root}/versions/${this.version}/${this.version}.json`)) {
                this.logger.Print(`${this.version}.json...`);
                yield (0, promises_1.writeFile)(`${this.root}/versions/${versionInfo.id}/${versionInfo.id}.json`, JSON.stringify(versionInfo));
            }
            else {
                this.logger.Info(`${this.version}.json already installed`);
            }
            this.ExecuteCallback(versionInfo.downloads.client.size);
        });
    }
    DownloadLibraries() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Print("Downloading libraries");
            const versionInfo = yield this.GetVersionInfo();
            const libraries = versionInfo.libraries;
            (0, Utils_cjs_1.CreateFolderIfNotExist)(`${this.root}/libraries`);
            for (const library of libraries) {
                if (this.IsLibraryAllowed(library, this.os)) {
                    const artifact = this.GetArtifact(library, this.os);
                    const pathSplit = artifact.path.split("/");
                    const filename = pathSplit.pop();
                    const path = pathSplit.join("/");
                    this.logger.Print(`Downloading ${artifact.path}`);
                    if (!(0, fs_1.existsSync)(`${this.root}/libraries/${path}/${filename}`)) {
                        const err = yield (0, Utils_cjs_1.DownloadFile)(artifact.url, `${this.root}/libraries/${path}`, filename);
                        if (err)
                            throw err;
                    }
                    else {
                        this.logger.Info(`Cache hit for ${filename}`);
                    }
                    this.ExecuteCallback(artifact.size);
                }
            }
        });
    }
    DownloadIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Print("Downloading indexes");
            const versionInfo = yield this.GetVersionInfo();
            const assetIndexId = versionInfo.assetIndex.id;
            const assetIndexUrl = versionInfo.assetIndex.url;
            if ((0, fs_1.existsSync)(`${this.root}/assets/indexes/${assetIndexId}.json`)) {
                this.logger.Info(`Asset indexes already exist`);
                return;
            }
            (0, Utils_cjs_1.CreateFolderIfNotExist)(`${this.root}/assets/indexes`);
            const err = yield (0, Utils_cjs_1.DownloadFile)(assetIndexUrl, `${this.root}/assets/indexes/`, `${assetIndexId}.json`);
            if (err)
                throw err;
        });
    }
    DownloadAssets() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Print("Downloading assets");
            const assets = yield this.GetAssets();
            const keys = Object.keys(assets.objects);
            (0, Utils_cjs_1.CreateFolderIfNotExist)(`${this.root}/assets/objects`);
            for (const key of keys) {
                const asset = assets.objects[key];
                const assetId = asset.hash.substring(0, 2);
                this.logger.Print(`Downloading ${assetId}/${asset.hash}`);
                if (!(0, fs_1.existsSync)(`${this.root}/assets/objects/${assetId}/${asset.hash}`)) {
                    const err = yield (0, Utils_cjs_1.DownloadFile)(`${this.assetsUrl}/${assetId}/${asset.hash}`, `${this.root}/assets/objects/${assetId}`, asset.hash);
                    if (err)
                        throw err;
                }
                else {
                    this.logger.Info(`Cache hit for ${asset.hash}`);
                }
                this.ExecuteCallback(asset.size);
            }
        });
    }
    GetArtifact(library, os) {
        let artifact;
        if (this.IsLibraryNative(library, os)) {
            if (library.downloads.artifact) {
                artifact = library.downloads.artifact;
            }
            if (library.downloads.classifiers) {
                const classifiers = library.downloads.classifiers;
                const native = library.natives.windows;
                artifact = classifiers[native];
            }
            return artifact;
        }
        return library.downloads.artifact;
    }
    IsLibraryAllowed(library, os) {
        if (!this.HasRulesForOs(library))
            return true;
        let genericRule = undefined;
        let osRule = undefined;
        for (const rule of library.rules) {
            if (!rule.os) {
                genericRule = rule;
            }
            else {
                if (rule.os.name == os)
                    osRule = rule;
            }
        }
        if (genericRule == undefined && osRule == undefined)
            return false;
        if (osRule)
            return osRule.action == "allow";
        return genericRule.action == "allow";
    }
    HasRulesForOs(library) {
        if (!library.rules)
            return false;
        return true;
    }
    IsLibraryNative(library, os) {
        const nameSplit = library.name.split(":");
        if (nameSplit.length != 4) {
            if (!library.natives)
                return false;
            return library.natives[os] != undefined;
        }
        const nativeName = nameSplit[3];
        const nativeNameSplit = nativeName.split("-");
        let osName = nativeNameSplit[1];
        let trueOsName = os;
        if (nativeNameSplit[0] != "natives")
            osName = nativeNameSplit[0];
        if (os == "osx")
            trueOsName = "macos";
        return trueOsName == osName;
    }
    ExecuteCallback(size) {
        if (this.stepCallback)
            this.stepCallback(size);
    }
}
exports.McInstaller = McInstaller;
class ForgeInstaller {
    constructor(version, forge, root) {
        this.logger = new Logger_cjs_1.default(ForgeInstaller.name);
        this.versionsCache = {};
        this.version = version;
        this.forge = forge;
        this.root = root;
        this.logger.SetLogPath(`${(0, Utils_cjs_1.GetAppData)()}/${conf_json_1.default.root}/${conf_json_1.default.dirs.logs}/log.txt`);
        this.logger.WriteLog(true);
    }
    InstallVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.IsMinecraftVersionInstalled())
                throw new Error(`Minecraft version ${this.version} not installed`);
            yield this.DownloadJar();
            yield this.UnpackForgeJar();
            yield this.CreateVersion();
            yield this.InstallLibraries();
            yield this.StartProcessor();
        });
    }
    AddStepCallback(cb) {
        this.stepCallback = cb;
    }
    GetVersion(mcVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.versionsCache[mcVersion])
                return this.versionsCache[mcVersion];
            const [res, err] = yield (0, Utils_cjs_1.Get)(`${InstallerConf_cjs_1.FORGE.WEBSITE}/index_${mcVersion}.html`, "text");
            if (err)
                throw new Error(`Cannot find minecraft version ${mcVersion}`);
            const version = (0, forge_site_parser_1.parse)(res);
            this.versionsCache[version.mcversion] = [];
            version.versions.forEach(el => this.versionsCache[version.mcversion].push(el));
            return this.versionsCache[version.mcversion];
        });
    }
    GetLatestForgeVersion(mcVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetVersion(mcVersion))[0];
        });
    }
    GetForgeVersion(mcVersion, forgeVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const versions = yield this.GetVersion(mcVersion);
            const version = versions.find((el) => el.version == forgeVersion);
            if (!version)
                throw new Error(`Cannot find forge version ${forgeVersion}`);
            return version;
        });
    }
    GetSize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, fs_1.existsSync)(`${this.root}/forge-files/forge-${this.version}-${this.forge}`)) {
                yield this.DownloadJar();
                yield this.UnpackForgeJar();
            }
            const installProfile = yield this.GetInstallProfile(this.root);
            const versionJson = yield this.GetVersionJson(this.root);
            let size = 0;
            for (const lib of installProfile.libraries)
                size += lib.downloads.artifact.size;
            for (const lib of versionJson.libraries)
                size += lib.downloads.artifact.size;
            return size;
        });
    }
    GetNumberOfClientProcessor() {
        return __awaiter(this, void 0, void 0, function* () {
            const forgeFiles = yield this.GetForgeFiles(this.root);
            return forgeFiles.install_profile.processors.filter((processor) => {
                if (!processor.sides)
                    return true;
                return processor.sides.indexOf("client") != -1;
            }).length;
        });
    }
    DownloadJar() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.IsForgeAlreadyInstalled()) {
                this.logger.Info("Forge already installed");
                return;
            }
            this.logger.Print("Downloading minecraft forge installer...");
            const forgeVersion = yield this.GetForgeVersion(this.version, this.forge);
            const installerName = `forge-${this.version}-${this.forge}`;
            if (!forgeVersion.installer)
                throw new Error(`No installer for forge ${forgeVersion.version}`);
            if ((0, fs_1.existsSync)(`${this.root}/forge-files/${installerName}.zip`)) {
                this.logger.Info("Installer already exist");
                return;
            }
            this.logger.Print(`Downloading forge installer ${forgeVersion.version} for minecraft ${forgeVersion.mcversion} in ${this.root}/forge-files`);
            const err = yield (0, Utils_cjs_1.DownloadFile)(forgeVersion.installer.path, `${this.root}/forge-files`, `${installerName}.zip`);
            if (err)
                throw err;
        });
    }
    UnpackForgeJar() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Print("Unpacking forge jar...");
            if (this.IsForgeAlreadyInstalled()) {
                this.logger.Info("Forge already installed");
                return;
            }
            const latestForgeVersion = yield this.GetForgeVersion(this.version, this.forge);
            const installerName = `forge-${this.version}-${latestForgeVersion.version}`;
            const zip = new node_stream_zip_1.default.async({ file: `${this.root}/forge-files/${installerName}.zip` });
            this.logger.Print(`Decompressing ${installerName}.zip`);
            (0, Utils_cjs_1.CreateFolderIfNotExist)(`${this.root}/${InstallerConf_cjs_1.FORGE.UNPACKED}`);
            yield zip.extract(null, `${this.root}/${InstallerConf_cjs_1.FORGE.UNPACKED}`);
            yield zip.close();
        });
    }
    CreateVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const name = `${this.version}-forge-${this.forge}`;
            if ((0, fs_1.existsSync)(`${this.root}/versions/${name}/${name}.json`)) {
                this.logger.Info(`$${this.root}/versions/${name}/${name}.json already exist`);
                return;
            }
            (0, Utils_cjs_1.CreateFolderIfNotExist)(`${this.root}/versions/${name}`);
            (0, fs_1.copyFileSync)(`${this.root}/${InstallerConf_cjs_1.FORGE.UNPACKED}/version.json`, `${this.root}/versions/${name}/${name}.json`);
        });
    }
    InstallLibraries() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Print("Installing libraries...");
            const installProfile = yield this.GetInstallProfile(this.root);
            const versionJson = yield this.GetVersionJson(this.root);
            const libraries = [...installProfile.libraries, ...versionJson.libraries];
            for (const library of libraries) {
                this.logger.Print(`Downloading ${library.name}`);
                const pathSplit = library.downloads.artifact.path.split("/");
                const name = pathSplit.pop();
                const folderPath = pathSplit.join("/");
                if (!(0, fs_1.existsSync)(`${this.root}/libraries/${folderPath}/${name}`)) {
                    const err = yield (0, Utils_cjs_1.DownloadFile)(library.downloads.artifact.url, `${this.root}/libraries/${folderPath}`, name);
                    if (err)
                        throw err;
                }
                else {
                    this.logger.Info(`Cache hit for ${name}`);
                }
                this.ExecuteCallback(library.downloads.artifact.size, "lib");
            }
            this.CopyForgeLibFromInstaller(this.root);
        });
    }
    StartProcessor() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Info("Starting install process");
            const forgeFiles = yield this.GetForgeFiles(this.root);
            let step = 0;
            for (const processor of forgeFiles.install_profile.processors) {
                let canContinue = true;
                if (processor.sides) {
                    if (processor.sides[0] == "server") {
                        this.logger.Warning(`${processor.jar} Skip Server Side Process`);
                        canContinue = false;
                    }
                }
                if (canContinue) {
                    const argsJoins = processor.args.join(" ");
                    if (argsJoins.includes("DOWNLOAD_MOJMAPS")) {
                        this.logger.Print("Need to Download Minecraft Client Mapping");
                        yield this.DownloadMOJMAPS(this.root, forgeFiles.install_profile.minecraft, forgeFiles.install_profile.data.MOJMAPS);
                    }
                    else {
                        const args = yield this.MixArgs(this.root, processor);
                        yield this.RunProcess(args);
                    }
                    step++;
                    this.ExecuteCallback(step, "processor");
                }
            }
        });
    }
    DownloadMOJMAPS(path, version, mojmaps) {
        return __awaiter(this, void 0, void 0, function* () {
            const mcVersionInfo = JSON.parse((0, fs_1.readFileSync)(`${path}/versions/${version}/${version}.json`).toString());
            const packageName = mojmaps.client;
            const forgePackage = this.GetPathFromPackageName(packageName);
            const fullPath = `${path}/libraries/${forgePackage.path}`;
            (0, Utils_cjs_1.CreateFolderIfNotExist)(fullPath);
            this.logger.Print("Downloading MOJMAPS");
            if ((0, fs_1.existsSync)(`${fullPath}/${forgePackage.name}`)) {
                this.logger.Info(`Cahche hit for ${forgePackage.name}`);
                return;
            }
            const err = yield (0, Utils_cjs_1.DownloadFile)(mcVersionInfo.downloads.client_mappings.url, fullPath, forgePackage.name);
            if (err)
                throw err;
        });
    }
    GetForgeFiles(path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Print("Reading intall_profile.json");
            const install_profile = yield this.GetInstallProfile(path);
            this.logger.Print("Getting package path");
            const bin_path_client = `${path}/${InstallerConf_cjs_1.FORGE.UNPACKED}/${InstallerConf_cjs_1.FORGE.CLIENT_LZMA}`;
            const minecraft_jar = `${path}/versions/${install_profile.minecraft}/${install_profile.minecraft}.jar`;
            const data = this.GetInstallProfileData(path, install_profile.data);
            return { install_profile, bin_path_client, minecraft_jar, data };
        });
    }
    GetInstallProfile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullPath = `${path}/${InstallerConf_cjs_1.FORGE.UNPACKED}/${InstallerConf_cjs_1.FORGE.INSTALL_PROFILE}`;
            const buffer = yield (0, promises_1.readFile)(fullPath);
            const data = buffer.toString();
            return JSON.parse(data);
        });
    }
    GetVersionJson(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullPath = `${path}/${InstallerConf_cjs_1.FORGE.UNPACKED}/version.json`;
            const buffer = yield (0, promises_1.readFile)(fullPath);
            const data = buffer.toString();
            return JSON.parse(data);
        });
    }
    MixArgs(path, processor) {
        return __awaiter(this, void 0, void 0, function* () {
            let argsString = ["-cp"];
            const forgeFile = yield this.GetForgeFiles(path);
            const mainClassPath = `${this.GetPathLibraryFile(path, processor.jar)}`;
            const mainClass = yield this.GetMainClassFromJar(mainClassPath);
            this.logger.Print(`Found maind class for ${processor.jar} : ${mainClass}`);
            let allPath = "";
            allPath += `${mainClassPath};`;
            for (let i = 0; i < processor.classpath.length; i++) {
                const classpath = processor.classpath[i];
                const libPath = this.GetPathLibraryFile(path, classpath);
                allPath += `${libPath}`;
                if (i < processor.classpath.length - 1)
                    allPath += ";";
            }
            argsString.push(`${allPath}`);
            argsString.push(`${mainClass}`);
            for (let i = 0; i < processor.args.length; i++) {
                let arg = processor.args[i];
                if (this.IsMacro(arg)) {
                    arg = arg.replace("{", "").replace("}", "");
                    arg = arg.replace(InstallerConf_cjs_1.MACRO.MINECRAFT_JAR, forgeFile.minecraft_jar);
                    arg = arg.replace(InstallerConf_cjs_1.MACRO.BINPATCH, forgeFile.bin_path_client);
                    arg = arg.replace(InstallerConf_cjs_1.MACRO.SIDE, `client`);
                    if (forgeFile.data[arg])
                        arg = forgeFile.data[arg].client;
                }
                if (this.IsPackage(arg)) {
                    arg = arg.replace("[", "").replace("]", "");
                    arg = `${this.GetPathLibraryFile(path, arg)}`;
                }
                argsString.push(`${arg}`);
            }
            return argsString;
        });
    }
    GetMainClassFromJar(mainClass) {
        return __awaiter(this, void 0, void 0, function* () {
            const zip = new node_stream_zip_1.default.async({ file: mainClass, storeEntries: true });
            const stream = yield zip.stream("META-INF/MANIFEST.MF");
            return new Promise((resolve, reject) => {
                let mainClass = "";
                let data = "";
                stream.on('data', (chunck) => {
                    data += chunck.toString();
                });
                stream.on('error', (err) => {
                    zip.close();
                    reject(err);
                });
                stream.on('end', () => {
                    const lines = data.split("\r\n");
                    for (const line of lines) {
                        if (line.includes("Main-Class"))
                            mainClass = line.replace("Main-Class: ", "");
                    }
                    zip.close();
                    resolve(mainClass);
                });
            });
        });
    }
    RunProcess(args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.Print(`Running process : java ${args.join(" ")}`);
            return new Promise((resolve, reject) => {
                const child = (0, child_process_1.spawn)("java", args);
                child.stdout.on("data", (data) => {
                    this.logger.Print(data.toString());
                });
                child.stderr.on("data", (data) => {
                    this.logger.Error(data.toString());
                    reject(new Error(data.toString()));
                });
                child.on("close", (code) => {
                    if (code != 0) {
                        this.logger.Error(`Command exiting with code ${code}`);
                        reject(new Error(`${code}`));
                    }
                    resolve();
                });
            });
        });
    }
    GetPathLibraryFile(path, name) {
        const packagePath = this.GetPathFromPackageName(`[${name}]`);
        return `${path}/libraries/${packagePath.path}/${packagePath.name}`;
    }
    GetPathFromPackageName(data) {
        if (!this.IsPackage(data))
            throw new Error(`${data} is not a package`);
        const packageRaw = data.replace("[", "").replace("]", "");
        const packageSplit = packageRaw.split(":");
        const packagePath = packageSplit[0].replace(/\./g, "\/");
        const packageLibName = packageSplit[1];
        const packageVersion = (packageSplit[2].includes("@")) ? packageSplit[2].substring(0, packageSplit[2].indexOf("@")) : packageSplit[2];
        const name = this.GetPackageJarName(packageRaw);
        const path = `${packagePath}/${packageLibName}/${packageVersion}`;
        ;
        return { name, path };
    }
    GetInstallProfileData(path, data) {
        const finalData = {};
        for (const key in data) {
            const currentData = data[key];
            let client = currentData.client;
            let server = currentData.server;
            if (this.IsPackage(currentData.client))
                client = this.GetPathLibraryFile(path, currentData.client.replace("[", "").replace("]", ""));
            if (this.IsPackage(currentData.server))
                server = this.GetPathLibraryFile(path, currentData.server.replace("[", "").replace("]", ""));
            finalData[key] = { client, server };
        }
        return finalData;
    }
    IsMacro(data) {
        return data.startsWith("{") && data.endsWith("}");
    }
    IsPackage(data) {
        return data.startsWith("[") && data.endsWith("]") && data.split(":").length >= 3;
    }
    GetPackageJarName(packageRaw) {
        let extension = "jar";
        if (packageRaw.includes("@")) {
            const index = packageRaw.indexOf("@");
            extension = packageRaw.substring(index + 1);
            packageRaw = packageRaw.substring(0, index);
        }
        ;
        const packageSplit = packageRaw.split(":");
        if (packageSplit.length == 3)
            return `${packageSplit[1]}-${packageSplit[2]}.${extension}`;
        return `${packageSplit[1]}-${packageSplit[2]}-${packageSplit[3]}.${extension}`;
    }
    IsMinecraftVersionInstalled() {
        return (0, fs_1.existsSync)(`${this.root}/versions/${this.version}/${this.version}.jar`);
    }
    IsForgeAlreadyInstalled() {
        const name = `${this.version}-forge-${this.forge}`;
        return (0, fs_1.existsSync)(`${this.root}/versions/${name}/${name}.json`);
    }
    CopyForgeLibFromInstaller(path) {
        if (!(0, fs_1.existsSync)(`${path}/${InstallerConf_cjs_1.FORGE.UNPACKED}/maven/net/minecraftforge/forge`))
            return;
        const forgeLibPath = `${path}/${InstallerConf_cjs_1.FORGE.UNPACKED}/maven/net/minecraftforge/forge`;
        const version = (0, fs_1.readdirSync)(forgeLibPath)[0];
        const jarFiles = (0, fs_1.readdirSync)(`${forgeLibPath}/${version}`);
        (0, Utils_cjs_1.CreateFolderIfNotExist)(`${path}/libraries/net/minecraftforge/forge/${version}`);
        for (const jar of jarFiles) {
            this.logger.Print(`Copying ${jarFiles} to ${path}/libraries/net/minecraftforge/forge/${version}`);
            (0, fs_1.copyFileSync)(`${forgeLibPath}/${version}/${jar}`, `${path}/libraries/net/minecraftforge/forge/${version}/${jar}`);
        }
    }
    ExecuteCallback(size, name) {
        if (this.stepCallback)
            this.stepCallback(size, name);
    }
}
exports.ForgeInstaller = ForgeInstaller;
