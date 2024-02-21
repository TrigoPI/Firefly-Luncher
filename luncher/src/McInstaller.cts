import appConf from "../conf.json"

import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "fs";
import { appendFile, mkdir, readFile, rm, writeFile } from "fs/promises";
import { ForgeWebPage, parse } from "@xmcl/forge-site-parser";
import { spawn } from "child_process";
import StreamZip, { StreamZipAsync } from "node-stream-zip";

import { MINECRAFT_URL, FORGE, MACRO } from "./InstallerConf.cjs";
import { Minecraft, OsName, ClassifierOs, NativeOsName, Forge } from "./Types.cjs";
import { GetAppData, Get, CreateFolderIfNotExist, DownloadFile } from "./Utils.cjs";
import Logger from "./Logger.cjs";

export class McInstaller {
    private version: string;
    private os: OsName;
    private root: string;

    private assetsUrl: string;
    private versionManifestUrl: string;
    private manifest: Minecraft.VersionManifest;
    private versionInfoCache: Record<string, Minecraft.VersionInfo>;

    private stepCallback: (size: number) => void;

    private logger: Logger;

    public constructor(version: string, os: OsName, root: string) {
        this.logger = new Logger(McInstaller.name);

        this.logger.SetLogPath(`${GetAppData()}/${appConf.root}/${appConf.dirs.logs}/log.txt`);
        this.logger.WriteLog(true);

        this.versionManifestUrl = MINECRAFT_URL.MANIFEST;
        this.assetsUrl = MINECRAFT_URL.ASSET;
        this.versionInfoCache = {};
        
        this.version = version;
        this.os = os;
        this.root = root.replace(/\//g, "/");
    }

    public async InstallVersion(): Promise<void> {        
        await this.DownloadJar();
        await this.DownloadIndexes();
        await this.DownloadAssets();
        await this.DownloadLibraries();
    }

    public AddStepCallback(cb: (size: number) => void): void {
        this.stepCallback = cb;
    }

    public async GetManifest(): Promise<Minecraft.VersionManifest> {
        if (!this.manifest) {
            if (existsSync(`${this.root}/versions/version_manifest_v2.json`)) {
                const buffer: Buffer = readFileSync(`${this.root}/versions/version_manifest_v2.json`);
                this.manifest = JSON.parse(buffer.toString());
            } else {
                const [res, err] = await Get<Minecraft.VersionManifest>(this.versionManifestUrl, "json");
                if (err) throw err;

                const resString: string = JSON.stringify(res);
                await mkdir(`${this.root}/versions`, { recursive: true });
                await appendFile(`${this.root}/versions/version_manifest_v2.json`, Buffer.from(resString));
                this.manifest = res;
            }
        }

        return this.manifest;
    }

    public async GetVersion(): Promise<Minecraft.Version> {
        const versionManifest: Minecraft.VersionManifest = await this.GetManifest();
        const verison: Minecraft.Version | undefined = versionManifest.versions.find((el: Minecraft.Version) => el.id == this.version);
        if (!verison) throw new Error(`Cannot find minecraft version ${this.version}`);
        return verison;
    }

    public async GetVersionInfo(): Promise<Minecraft.VersionInfo> {
        if (this.versionInfoCache[this.version]) return this.versionInfoCache[this.version];
        
        const version: Minecraft.Version = await this.GetVersion();

        if (existsSync(`${this.root}/versions/${this.version}/${this.version}.json`)) {
            const buffer: Buffer = readFileSync(`${this.root}/versions/${this.version}/${this.version}.json`);
            this.versionInfoCache[this.version] = JSON.parse(buffer.toString());
        } else {
            const [res, err] = await Get<Minecraft.VersionInfo>(version.url, "json");
            if (err) throw err;

            const infoString: string = JSON.stringify(res);
            const buffer: Buffer = Buffer.from(infoString);
            
            await mkdir(`${this.root}/versions/${this.version}`, { recursive: true });
            await appendFile(`${this.root}/versions/${this.version}/${this.version}.json`, buffer);

            this.versionInfoCache[this.version] = res;
        }

        return this.versionInfoCache[this.version];
    }

    public async GetAssets(): Promise<Minecraft.Assets> {
        const versionInfo: Minecraft.VersionInfo = await this.GetVersionInfo();
        const id: string = versionInfo.assetIndex.id;
        let assets: Minecraft.Assets;

        if (existsSync(`${this.root}/assets/indexes/${id}.json`)) {
            const buffer: Buffer = await readFile(`${this.root}/assets/indexes/${id}.json`);
            assets = JSON.parse(buffer.toString());
        } else {
            const [res, err] = await Get<Minecraft.Assets>(versionInfo.assetIndex.url, "json");
            if (err) throw err;

            const assetString: string = JSON.stringify(res);
            const buffer: Buffer = Buffer.from(assetString);
            
            mkdirSync(`${this.root}/assets/indexes`, { recursive: true });
            appendFileSync(`${this.root}/assets/indexes/${id}.json`, buffer)
            assets = res;
        }

        return assets;
    }

    public async GetSize(): Promise<number> {
        let total: number = 0;

        const versionInfo: Minecraft.VersionInfo = await this.GetVersionInfo();
        const assets: Minecraft.Assets = await this.GetAssets();

        total += versionInfo.downloads.client.size;

        for (const lib of versionInfo.libraries) {
            if (this.IsLibraryAllowed(lib, this.os)) {
                const artifact: Minecraft.Artifact = this.GetArtifact(lib, this.os);
                total += artifact.size;
            }
        }

        for (const key in assets.objects) {
            total += assets.objects[key].size
        }

        return total;
    }

    private async DownloadJar(): Promise<void> {
        this.logger.Print("Downloading minecraft jar");

        const versionInfo: Minecraft.VersionInfo = await this.GetVersionInfo(); 
        const jarUrl: string = versionInfo.downloads.client.url;

        CreateFolderIfNotExist(`${this.root}/versions/${versionInfo.id}`);

        if (!existsSync(`${this.root}/versions/${this.version}/${this.version}.jar`)) {
            this.logger.Print("Downloading client...");
            const err: Error | undefined = await DownloadFile(jarUrl, `${this.root}/versions/${versionInfo.id}`, `${versionInfo.id}.jar`);
            if (err) throw err;  
        } else {
            this.logger.Info("Client already installed");
        }

        if (!existsSync(`${this.root}/versions/${this.version}/${this.version}.json`)) {
            this.logger.Print(`${this.version}.json...`);
            await writeFile(`${this.root}/versions/${versionInfo.id}/${versionInfo.id}.json`, JSON.stringify(versionInfo));
        } else {
            this.logger.Info(`${this.version}.json already installed`);
        }

        this.ExecuteCallback(versionInfo.downloads.client.size);
    }

    private async DownloadLibraries(): Promise<void> {
        this.logger.Print("Downloading libraries");

        const versionInfo: Minecraft.VersionInfo = await this.GetVersionInfo(); 
        const libraries: Minecraft.Library[] = versionInfo.libraries;
        
        CreateFolderIfNotExist(`${this.root}/libraries`);

        for (const library of libraries) {
            if (this.IsLibraryAllowed(library, this.os)) {
                const artifact: Minecraft.Artifact = this.GetArtifact(library, this.os);
                const pathSplit: string[] = artifact.path.split("/");
                const filename: string = pathSplit.pop();
                const path: string = pathSplit.join("/");
                
                this.logger.Print(`Downloading ${artifact.path}`);

                if (!existsSync(`${this.root}/libraries/${path}/${filename}`)) {
                    const err: Error | undefined = await DownloadFile(artifact.url, `${this.root}/libraries/${path}`, filename);
                    if (err) throw err;
                } else {
                    this.logger.Info(`Cache hit for ${filename}`);
                }

                this.ExecuteCallback(artifact.size);
            }
        }
    }

    private async DownloadIndexes(): Promise<void> {
        this.logger.Print("Downloading indexes");

        const versionInfo: Minecraft.VersionInfo = await this.GetVersionInfo(); 
        const assetIndexId: string = versionInfo.assetIndex.id;
        const assetIndexUrl: string = versionInfo.assetIndex.url;
    
        if (existsSync(`${this.root}/assets/indexes/${assetIndexId}.json`)) {
            this.logger.Info(`Asset indexes already exist`)
            return;
        }

        CreateFolderIfNotExist(`${this.root}/assets/indexes`);

        const err: Error | undefined = await DownloadFile(assetIndexUrl, `${this.root}/assets/indexes/`, `${assetIndexId}.json`);
        if (err) throw err;
    }

    private async DownloadAssets(): Promise<void> {
        this.logger.Print("Downloading assets");

        const assets: Minecraft.Assets = await this.GetAssets();
        const keys: string[] = Object.keys(assets.objects);

        CreateFolderIfNotExist(`${this.root}/assets/objects`);
        
        for (const key of keys) {
            const asset: Minecraft.Asset = assets.objects[key];
            const assetId: string = asset.hash.substring(0, 2);
            
            this.logger.Print(`Downloading ${assetId}/${asset.hash}`);

            if (!existsSync(`${this.root}/assets/objects/${assetId}/${asset.hash}`)) {
                const err: Error | undefined = await DownloadFile(`${this.assetsUrl}/${assetId}/${asset.hash}`, `${this.root}/assets/objects/${assetId}`, asset.hash);
                if (err) throw err;
            } else {
                this.logger.Info(`Cache hit for ${asset.hash}`);
            }

            this.ExecuteCallback(asset.size);
        }
    }

    private GetArtifact(library: Minecraft.Library, os: OsName): Minecraft.Artifact {
        let artifact: Minecraft.Artifact;

        if (this.IsLibraryNative(library, os)) {     
            if (library.downloads.artifact) {
                artifact = library.downloads.artifact;
            } 

            if (library.downloads.classifiers) {
                const classifiers: Minecraft.Classifier = library.downloads.classifiers;
                const native: ClassifierOs = library.natives.windows;
                artifact = classifiers[native];
            }

            return artifact;
        } 

        return library.downloads.artifact;
    }

    private IsLibraryAllowed(library: Minecraft.Library, os: OsName): boolean {
        if (!this.HasRulesForOs(library)) return true;
                
        let genericRule: Minecraft.Rule | undefined = undefined;
        let osRule: Minecraft.Rule | undefined = undefined;

        for (const rule of library.rules) {
            if (!rule.os) {
                genericRule = rule;
            } else {
                if (rule.os.name == os)
                    osRule = rule;
            }
        }

        if (genericRule == undefined && osRule == undefined) return false;
        if (osRule) return osRule.action == "allow";
        return genericRule.action == "allow";
    }

    private HasRulesForOs(library: Minecraft.Library): boolean {
        if (!library.rules) return false;
        return true;
    }

    private IsLibraryNative(library: Minecraft.Library, os: OsName): boolean {
        const nameSplit: string[] = library.name.split(":");
        
        if (nameSplit.length != 4) {
            if (!library.natives) return false;
            return library.natives[os] != undefined;
        }
        
        const nativeName: string = nameSplit[3];
        const nativeNameSplit: string[] = nativeName.split("-");
        
        let osName: NativeOsName = nativeNameSplit[1] as NativeOsName;
        let trueOsName: string = os;
        if (nativeNameSplit[0] != "natives") osName = nativeNameSplit[0] as NativeOsName;
        if (os == "osx") trueOsName = "macos";

        return trueOsName == osName;
    }

    private ExecuteCallback(size: number): void {
        if (this.stepCallback) this.stepCallback(size);
    }
}

export class ForgeInstaller {
    private version: string;
    private forge: string;
    private root: string;

    private versionsCache: Record<string, Forge.Version[]>;
    private logger: Logger;

    private stepCallback: (size: number, name: string) => void;

    public constructor(version: string, forge: string, root: string) {
        this.logger = new Logger(ForgeInstaller.name);
        this.versionsCache = {};

        this.version = version;
        this.forge = forge;
        this.root = root;

        this.logger.SetLogPath(`${GetAppData()}/${appConf.root}/${appConf.dirs.logs}/log.txt`);
        this.logger.WriteLog(true);
    }

    public async InstallVersion(): Promise<void> {
        if (!this.IsMinecraftVersionInstalled()) throw new Error(`Minecraft version ${this.version} not installed`);

        await this.DownloadJar();
        await this.UnpackForgeJar();
        await this.CreateVersion();
        await this.InstallLibraries();
        await this.StartProcessor();
    }

    public AddStepCallback(cb: (size: number, name: string) => void): void {
        this.stepCallback = cb;
    }

    public async GetVersion(mcVersion: string): Promise<Forge.Version[]> {
        if (this.versionsCache[mcVersion]) return this.versionsCache[mcVersion];
        
        const [res, err] = await Get<string>(`${FORGE.WEBSITE}/index_${mcVersion}.html`, "text");
        if (err) throw new Error(`Cannot find minecraft version ${mcVersion}`);
        
        const version: ForgeWebPage = parse(res);
        this.versionsCache[version.mcversion] = [];
        version.versions.forEach(el => this.versionsCache[version.mcversion].push(el));

        return this.versionsCache[version.mcversion];
    }

    public async GetLatestForgeVersion(mcVersion: string): Promise<Forge.Version> {
        return (await this.GetVersion(mcVersion))[0];
    }

    public async GetForgeVersion(mcVersion: string, forgeVersion: string): Promise<Forge.Version> {
        const versions: Forge.Version[] = await this.GetVersion(mcVersion);
        const version: Forge.Version | undefined = versions.find((el: Forge.Version) => el.version == forgeVersion);
        if (!version) throw new Error(`Cannot find forge version ${forgeVersion}`);
        return version;
    }

    public async GetSize(): Promise<number> {
        if (!existsSync(`${this.root}/forge-files/forge-${this.version}-${this.forge}`)) {
            await this.DownloadJar();
            await this.UnpackForgeJar();
        }      

        const installProfile: Forge.InstallProfile = await this.GetInstallProfile(this.root);
        const versionJson: Forge.VersionJson = await this.GetVersionJson(this.root);

        let size: number = 0;

        for (const lib of installProfile.libraries) size += lib.downloads.artifact.size;
        for (const lib of versionJson.libraries) size += lib.downloads.artifact.size;

        return size;
    }

    public async GetNumberOfClientProcessor(): Promise<number> {
        const forgeFiles: Forge.LoaderData = await this.GetForgeFiles(this.root);
        return forgeFiles.install_profile.processors.filter((processor: Forge.Processor) => {
            if (!processor.sides) return true;
            return processor.sides.indexOf("client") != -1
        }).length;
    }

    private async DownloadJar(): Promise<void> {
        if (this.IsForgeAlreadyInstalled()) {
            this.logger.Info("Forge already installed");
            return;
        }
        
        this.logger.Print("Downloading minecraft forge installer...");

        const forgeVersion: Forge.Version = await this.GetForgeVersion(this.version, this.forge);
        const installerName: string = `forge-${this.version}-${this.forge}`;

        if (!forgeVersion.installer) throw new Error(`No installer for forge ${forgeVersion.version}`);
        
        if (existsSync(`${this.root}/forge-files/${installerName}.zip`)) {
            this.logger.Info("Installer already exist");
            return;
        }

        this.logger.Print(`Downloading forge installer ${forgeVersion.version} for minecraft ${forgeVersion.mcversion} in ${this.root}/forge-files`);
        const err: Error | undefined = await DownloadFile(forgeVersion.installer.path, `${this.root}/forge-files`, `${installerName}.zip`);

        if (err) throw err;
    }

    private async UnpackForgeJar(): Promise<void> {
        this.logger.Print("Unpacking forge jar...");

        if (this.IsForgeAlreadyInstalled()) {
            this.logger.Info("Forge already installed");
            return;
        }

        const latestForgeVersion: Forge.Version = await this.GetForgeVersion(this.version, this.forge);
        const installerName: string = `forge-${this.version}-${latestForgeVersion.version}`;
        const zip: StreamZipAsync = new StreamZip.async({ file: `${this.root}/forge-files/${installerName}.zip` });

        this.logger.Print(`Decompressing ${installerName}.zip`);

        CreateFolderIfNotExist(`${this.root}/${FORGE.UNPACKED}`);
        await zip.extract(null, `${this.root}/${FORGE.UNPACKED}`);
        await zip.close();
    }

    private async CreateVersion(): Promise<void> {
        const name: string = `${this.version}-forge-${this.forge}`;

        if (existsSync(`${this.root}/versions/${name}/${name}.json`)) {
            this.logger.Info(`$${this.root}/versions/${name}/${name}.json already exist`);
            return;
        }

        CreateFolderIfNotExist(`${this.root}/versions/${name}`);
        copyFileSync(`${this.root}/${FORGE.UNPACKED}/version.json`, `${this.root}/versions/${name}/${name}.json`);
    }

    private async InstallLibraries(): Promise<void> {
        this.logger.Print("Installing libraries...");

        const installProfile: Forge.InstallProfile = await this.GetInstallProfile(this.root);
        const versionJson: Forge.VersionJson = await this.GetVersionJson(this.root);

        const libraries: Forge.Library[] = [ ...installProfile.libraries, ...versionJson.libraries ];

        for (const library of libraries) {
            this.logger.Print(`Downloading ${library.name}`);
            const pathSplit: string[] = library.downloads.artifact.path.split("/");
            const name: string = pathSplit.pop();
            const folderPath: string =  pathSplit.join("/");

            if (!existsSync(`${this.root}/libraries/${folderPath}/${name}`)) {
                const err: Error | undefined = await DownloadFile(library.downloads.artifact.url, `${this.root}/libraries/${folderPath}`, name);
                if (err) throw err;
            } else {
                this.logger.Info(`Cache hit for ${name}`);
            }

            this.ExecuteCallback(library.downloads.artifact.size, "lib");
        }        

        this.CopyForgeLibFromInstaller(this.root);
    }

    private async StartProcessor(): Promise<void> {
        this.logger.Info("Starting install process");

        const forgeFiles: Forge.LoaderData = await this.GetForgeFiles(this.root);
        let step: number = 0;

        for (const processor of forgeFiles.install_profile.processors) {
            let canContinue: boolean = true;
            
            if (processor.sides) {
                if (processor.sides[0] == "server") {
                    this.logger.Warning(`${processor.jar} Skip Server Side Process`)
                    canContinue = false;
                }
            }

            if (canContinue) {
                const argsJoins: string = processor.args.join(" ");

                if (argsJoins.includes("DOWNLOAD_MOJMAPS")) {
                    this.logger.Print("Need to Download Minecraft Client Mapping");
                    await this.DownloadMOJMAPS(this.root, forgeFiles.install_profile.minecraft, forgeFiles.install_profile.data.MOJMAPS);
                } else {
                    const args: string[] = await this.MixArgs(this.root, processor);
                    await this.RunProcess(args);
                }
                step++;
                this.ExecuteCallback(step, "processor");
            }
        }
    }

    private async DownloadMOJMAPS(path: string, version: string, mojmaps: Forge.DataType): Promise<void> {
        const mcVersionInfo: Minecraft.VersionInfo = JSON.parse(readFileSync(`${path}/versions/${version}/${version}.json`).toString());
        const packageName: string = mojmaps.client;
        const forgePackage: Forge.Package = this.GetPathFromPackageName(packageName);
        const fullPath: string = `${path}/libraries/${forgePackage.path}`

        CreateFolderIfNotExist(fullPath);

        this.logger.Print("Downloading MOJMAPS");

        if (existsSync(`${fullPath}/${forgePackage.name}`)) {
            this.logger.Info(`Cahche hit for ${forgePackage.name}`);
            return
        }

        const err: Error | undefined = await DownloadFile(mcVersionInfo.downloads.client_mappings.url, fullPath, forgePackage.name);
        if (err) throw err;
    }

    private async GetForgeFiles(path: string): Promise<Forge.LoaderData> {
        this.logger.Print("Reading intall_profile.json");
        const install_profile: Forge.InstallProfile = await this.GetInstallProfile(path);
        
        this.logger.Print("Getting package path");
        const bin_path_client: string = `${path}/${FORGE.UNPACKED}/${FORGE.CLIENT_LZMA}`;
        const minecraft_jar: string = `${path}/versions/${install_profile.minecraft}/${install_profile.minecraft}.jar`;
        const data: Forge.Data = this.GetInstallProfileData(path, install_profile.data);

        return { install_profile, bin_path_client, minecraft_jar, data };
    }

    private async GetInstallProfile(path: string): Promise<Forge.InstallProfile> {
        const fullPath: string = `${path}/${FORGE.UNPACKED}/${FORGE.INSTALL_PROFILE}`;
        const buffer: Buffer = await readFile(fullPath);
        const data: string = buffer.toString();
        return JSON.parse(data);
    }

    private async GetVersionJson(path: string): Promise<Forge.VersionJson> {
        const fullPath: string = `${path}/${FORGE.UNPACKED}/version.json`;
        const buffer: Buffer = await readFile(fullPath);
        const data: string = buffer.toString();
        return JSON.parse(data);
    }

    private async MixArgs(path: string, processor: Forge.Processor): Promise<string[]> {
        let argsString: string[] = ["-cp"];
        
        const forgeFile: Forge.LoaderData = await this.GetForgeFiles(path);
        const mainClassPath: string = `${this.GetPathLibraryFile(path, processor.jar)}`;
        const mainClass: string = await this.GetMainClassFromJar(mainClassPath);

        this.logger.Print(`Found maind class for ${processor.jar} : ${mainClass}`);
        
        let allPath: string = "";
        allPath += `${mainClassPath};`;

        for (let i: number = 0; i < processor.classpath.length; i++) {
            const classpath: string = processor.classpath[i];
            const libPath: string = this.GetPathLibraryFile(path, classpath);
            allPath += `${libPath}`;
            if (i < processor.classpath.length - 1) allPath += ";";
        }

        argsString.push(`${allPath}`);
        argsString.push(`${mainClass}`);

        for (let i: number = 0; i < processor.args.length; i++) {
            let arg: string = processor.args[i];

            if (this.IsMacro(arg)) {
                arg = arg.replace("{", "").replace("}", "");
                arg = arg.replace(MACRO.MINECRAFT_JAR, forgeFile.minecraft_jar);
                arg = arg.replace(MACRO.BINPATCH, forgeFile.bin_path_client);
                arg = arg.replace(MACRO.SIDE, `client`);
                
                if (forgeFile.data[arg]) arg = forgeFile.data[arg].client;
            }

            if (this.IsPackage(arg)) {
                arg = arg.replace("[", "").replace("]", "");
                arg = `${this.GetPathLibraryFile(path, arg)}`;
            }

            argsString.push(`${arg}`);
        }

        return argsString;
    }
    
    private async GetMainClassFromJar(mainClass: string): Promise<string> {
        const zip: StreamZipAsync = new StreamZip.async({ file: mainClass, storeEntries: true });
        const stream: NodeJS.ReadableStream = await zip.stream("META-INF/MANIFEST.MF");

        return new Promise<string>((resolve, reject) => {
            let mainClass: string = "";
            let data: string = "";

            stream.on('data', (chunck: Buffer) => {
                data += chunck.toString();
            });

            stream.on('error', (err: Error) => {
                zip.close();
                reject(err);
            });

            stream.on('end', () => {
                const lines: string[] = data.split("\r\n");

                for (const line of lines) {
                    if (line.includes("Main-Class")) mainClass = line.replace("Main-Class: ", "");
                }

                zip.close();
                resolve(mainClass);
            });
        });
    }

    private async RunProcess(args: string[]): Promise<void> {
        this.logger.Print(`Running process : java ${args.join(" ")}`);

        return new Promise<void>((resolve, reject) => {
            const child = spawn("java", args);

            child.stdout.on("data", (data: Buffer) => {
                this.logger.Print(data.toString())
            });
            
            child.stderr.on("data", (data: Buffer) => {
                this.logger.Error(data.toString());
                reject(new Error(data.toString()));
            });

            child.on("close", (code: number) => {
                if (code != 0) {
                    this.logger.Error(`Command exiting with code ${code}`);
                    reject(new Error(`${code}`));
                }

                resolve();
            });
        });
    }

    private GetPathLibraryFile(path: string, name: string): string {
        const packagePath: Forge.Package = this.GetPathFromPackageName(`[${name}]`);
        return `${path}/libraries/${packagePath.path}/${packagePath.name}`;
    }

    private GetPathFromPackageName(data: string): Forge.Package {
        if (!this.IsPackage(data)) throw new Error(`${data} is not a package`);
        
        const packageRaw: string = data.replace("[", "").replace("]", "");
        const packageSplit: string[] = packageRaw.split(":");
        const packagePath: string = packageSplit[0].replace(/\./g, "\/");
        const packageLibName: string = packageSplit[1];
        const packageVersion: string = (packageSplit[2].includes("@"))? packageSplit[2].substring(0, packageSplit[2].indexOf("@")) : packageSplit[2];
        
        const name: string = this.GetPackageJarName(packageRaw);
        const path: string = `${packagePath}/${packageLibName}/${packageVersion}`;;

        return { name, path };
    }

    private GetInstallProfileData(path: string, data: Forge.Data): Forge.Data {
        const finalData: Record<string, Forge.DataType> = {};

        for (const key in data) {
            const currentData: Forge.DataType = data[key];
            
            let client: string = currentData.client;
            let server: string = currentData.server;
            
            if (this.IsPackage(currentData.client)) client = this.GetPathLibraryFile(path, currentData.client.replace("[", "").replace("]", ""));
            if (this.IsPackage(currentData.server)) server = this.GetPathLibraryFile(path, currentData.server.replace("[", "").replace("]", ""));

            finalData[key] = { client, server };
        }

        return finalData as Forge.Data;
    }

    private IsMacro(data: string): boolean {
        return data.startsWith("{") && data.endsWith("}");
    }

    private IsPackage(data: string): boolean {
        return data.startsWith("[") && data.endsWith("]") && data.split(":").length >= 3; 
    }

    private GetPackageJarName(packageRaw: string): string {
        let extension: string = "jar";

        if (packageRaw.includes("@")) {
            const index: number = packageRaw.indexOf("@");
            extension = packageRaw.substring(index + 1);
            packageRaw = packageRaw.substring(0, index);
        };
    
        const packageSplit: string[] = packageRaw.split(":");

        if (packageSplit.length == 3) return `${packageSplit[1]}-${packageSplit[2]}.${extension}`;
        
        return `${packageSplit[1]}-${packageSplit[2]}-${packageSplit[3]}.${extension}`;
    }

    private IsMinecraftVersionInstalled(): boolean {
        return existsSync(`${this.root}/versions/${this.version}/${this.version}.jar`);
    }

    private IsForgeAlreadyInstalled(): boolean {
        const name: string = `${this.version}-forge-${this.forge}`;
        return existsSync(`${this.root}/versions/${name}/${name}.json`);
    }

    private CopyForgeLibFromInstaller(path: string): void {
        if (!existsSync(`${path}/${FORGE.UNPACKED}/maven/net/minecraftforge/forge`)) return;

        const forgeLibPath: string = `${path}/${FORGE.UNPACKED}/maven/net/minecraftforge/forge`;
        const version: string = readdirSync(forgeLibPath)[0];
        const jarFiles: string[] = readdirSync(`${forgeLibPath}/${version}`);
        
        CreateFolderIfNotExist(`${path}/libraries/net/minecraftforge/forge/${version}`);
        
        for (const jar of jarFiles) {
            this.logger.Print(`Copying ${jarFiles} to ${path}/libraries/net/minecraftforge/forge/${version}`);
            copyFileSync(`${forgeLibPath}/${version}/${jar}`, `${path}/libraries/net/minecraftforge/forge/${version}/${jar}`);
        }
    }

    private ExecuteCallback(size: number, name: string): void {
        if (this.stepCallback) this.stepCallback(size, name);
    }
}