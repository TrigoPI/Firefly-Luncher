export type OsName = "linux" | "windows" | "osx";
export type Action = "allow" | "disallow";
export type Arch   = "32" | "64" 

export type LatestVersion = {
    release     : string; 
    snapshot    : string;
};

export type Version = {
    id          : string;
    url         : string;
    time        : string;
    releaseTime : string;
    type        : "snapshot" | "release"
};

export type VersionManifest = {
    latest      : LatestVersion;
    versions    : Version[]
};

export type OS = {
    name    : OsName;
    version : string
}

export type Rule = {
    action  : Action;
    os?     : OS;
};

export type Jvm = {
    rules: Rule[]
    value: string[]
};

export type JvmArgument = {
    game    : string[];
    jvm     : (Jvm | string)[]
};

export type AssetIndex = {
    id:        string;
    sha1:      string;
    size:      number;
    totalSize: number;
    url:       string;
};

export type DownloadInfo = {
    sha1: string;
    size: number;
    url:  string;
};

export type Download = {
    client          : DownloadInfo;
    server          : DownloadInfo;
    client_mappings : DownloadInfo;
    server_mappings : DownloadInfo;
};

export type JavaVersion = {
    component    : string;
    majorVersion : string
};

export type Artifact = {
    artifact: {
        path : string;
        sha1 : string;
        size : number;
        url  : string;
    }
};

export type Native = {
    linux   : string,
    windows : string,
    osx     : string
};

export type Library = {
    downloads   : Artifact;
    name        : string;
    natives?    : Native;
    rules?      : Rule[]
};

export type ClientFile = {
    id   :  string;
    sha1 : string;
    size : number;
    url  : string;
};

export type Logging = {
    client: {
        argument : string;
        file     : ClientFile;
        type     : string;
    }
};

export type VersionInfo = {
    mainClass               : string;
    assets                  : string;
    time                    : string;
    id                      : string;
    releaseTime             : string;
    complianceLevel         : number;
    minimumLauncherVersion  : number;
    assetIndex              : AssetIndex;
    downloads               : Download;
    javaVersion             : JavaVersion;
    libraries               : Library[];
    logging                 : Logging;
    type                    : "snapshot" | "release";
}

export type Asset = {
    hash: string,
    size: number
}

export type Assets = {
    objects: { [key: string]: Asset }
}