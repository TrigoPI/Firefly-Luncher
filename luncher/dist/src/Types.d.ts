export type OsName = "linux" | "windows" | "osx";
export type Action = "allow" | "disallow";
export type Arch = "arm32" | "arm64" | "x86" | "x64" | "x86_64" | "aarch_64";
export type NativeOsName = "linux" | "windows" | "macos";
export type ClassifierOs = "natives-linux" | "natives-osx" | "natives-windows";
export declare namespace Minecraft {
    type LatestVersion = {
        release: string;
        snapshot: string;
    };
    type Version = {
        id: string;
        url: string;
        time: string;
        releaseTime: string;
        type: "snapshot" | "release";
    };
    type VersionManifest = {
        latest: LatestVersion;
        versions: Version[];
    };
    type OS = {
        name: OsName;
        version: string;
    };
    type Rule = {
        action: Action;
        os?: OS;
    };
    type Jvm = {
        rules: Rule[];
        value: string[];
    };
    type JvmArgument = {
        game: string[];
        jvm: (Jvm | string)[];
    };
    type AssetIndex = {
        id: string;
        sha1: string;
        size: number;
        totalSize: number;
        url: string;
    };
    type DownloadInfo = {
        sha1: string;
        size: number;
        url: string;
    };
    type Download = {
        client: DownloadInfo;
        server: DownloadInfo;
        client_mappings: DownloadInfo;
        server_mappings: DownloadInfo;
    };
    type JavaVersion = {
        component: string;
        majorVersion: string;
    };
    type Artifact = {
        path: string;
        sha1: string;
        size: number;
        url: string;
    };
    type Classifier = Record<ClassifierOs, Artifact>;
    type DownloadArtifact = {
        artifact?: Artifact;
        classifiers?: Classifier;
    };
    type Native = {
        linux: ClassifierOs;
        windows: ClassifierOs;
        osx: ClassifierOs;
    };
    type Library = {
        name: string;
        downloads: DownloadArtifact;
        natives?: Native;
        rules?: Rule[];
    };
    type ClientFile = {
        id: string;
        sha1: string;
        size: number;
        url: string;
    };
    type Logging = {
        client: {
            argument: string;
            file: ClientFile;
            type: string;
        };
    };
    type VersionInfo = {
        mainClass: string;
        assets: string;
        time: string;
        id: string;
        releaseTime: string;
        complianceLevel: number;
        minimumLauncherVersion: number;
        assetIndex: AssetIndex;
        downloads: Download;
        javaVersion: JavaVersion;
        libraries: Library[];
        logging: Logging;
        type: "snapshot" | "release";
    };
    type Asset = {
        hash: string;
        size: number;
    };
    type Assets = {
        objects: {
            [key: string]: Asset;
        };
    };
}
export declare namespace Forge {
    type Download = {
        md5: string;
        sha1: string;
        path: string;
    };
    type Version = {
        mcversion: string;
        version: string;
        date: string;
        changelog?: Download;
        installer?: Download;
        mdk?: Download;
        universal?: Download;
        source?: Download;
        launcher?: Download;
        ['installer-win']: Download | undefined;
        type: 'buggy' | 'recommended' | 'common' | 'latest';
    };
    type DataType = {
        client: string;
        server: string;
    };
    type Data = {
        MAPPINGS: DataType;
        MOJMAPS: DataType;
        MERGED_MAPPINGS: DataType;
        BINPATCH: DataType;
        MC_UNPACKED: DataType;
        MC_SLIM: DataType;
        MC_SLIM_SHA: DataType;
        MC_EXTRA: DataType;
        MC_EXTRA_SHA: DataType;
        MC_SRG: DataType;
        PATCHED: DataType;
        PATCHED_SHA: DataType;
        MCP_VERSION: DataType;
    };
    type Outputs = {
        "{MC_SLIM}": string;
        "{MC_EXTRA}": string;
    };
    type Processor = {
        sides?: string[];
        jar: string;
        classpath: string[];
        args: string[];
        outputs?: Outputs;
    };
    type Artifact = {
        path: string;
        url: string;
        sha1: string;
        size: number;
    };
    type Downloads = {
        artifact: Artifact;
    };
    type Library = {
        name: string;
        downloads: Downloads;
    };
    type InstallProfile = {
        _comment_: string[];
        spec: number;
        profile: string;
        version: string;
        path: any;
        minecraft: string;
        serverJarPath: string;
        data: Data;
        processors: Processor[];
        libraries: Library[];
        icon: string;
        json: string;
        logo: string;
        mirrorList: string;
    };
    type VersionJson = {
        mainClass: string;
        libraries: Library[];
    };
    type Package = {
        name: string;
        path: string;
    };
    type LoaderData = {
        minecraft_jar: string;
        install_profile: InstallProfile;
        bin_path_client: string;
        data: Data;
    };
}
