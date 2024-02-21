export type OsName = "linux" | "windows" | "osx";
export type Action = "allow" | "disallow";
export type Arch   = "arm32" | "arm64" | "x86" | "x64" | "x86_64"  | "aarch_64";
export type NativeOsName = "linux" | "windows" | "macos";
export type ClassifierOs = "natives-linux" | "natives-osx" | "natives-windows";

export namespace Minecraft {
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
        path : string;
        sha1 : string;
        size : number;
        url  : string;
    };
    
    export type Classifier = Record<ClassifierOs, Artifact>
    
    export type DownloadArtifact = {
        artifact?: Artifact;
        classifiers?: Classifier;
    }
    
    export type Native = {
        linux   : ClassifierOs,
        windows : ClassifierOs,
        osx     : ClassifierOs
    };
    
    export type Library = {
        name        : string;
        downloads   : DownloadArtifact;
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
}

export namespace Forge {
    export type Download = {
        md5     : string;
        sha1    : string;
        path    : string;
    }

    export type Version = {
        mcversion   : string;
        version     : string;
        date        : string;
        changelog?  : Download;
        installer?  : Download;
        mdk?        : Download;
        universal?  : Download;
        source?     : Download;
        launcher?   : Download;
        ['installer-win']: Download | undefined;
        type: 'buggy' | 'recommended' | 'common' | 'latest';
    }

    export type DataType = {
        client: string
        server: string
    }
    
    export type Data = {
        MAPPINGS        : DataType
        MOJMAPS         : DataType
        MERGED_MAPPINGS : DataType
        BINPATCH        : DataType
        MC_UNPACKED     : DataType
        MC_SLIM         : DataType
        MC_SLIM_SHA     : DataType
        MC_EXTRA        : DataType
        MC_EXTRA_SHA    : DataType
        MC_SRG          : DataType
        PATCHED         : DataType
        PATCHED_SHA     : DataType
        MCP_VERSION     : DataType
    }

    export type Outputs = {
        "{MC_SLIM}"     : string
        "{MC_EXTRA}"    : string
    }

    export type Processor = {
        sides?      : string[]
        jar         : string
        classpath   : string[]
        args        : string[]
        outputs?    : Outputs
    }

    export type Artifact = {
        path    : string
        url     : string
        sha1    : string
        size    : number
    }

    export type Downloads = {
        artifact    : Artifact
    }

    export type Library = {
        name        : string
        downloads   : Downloads
    }

    export type InstallProfile = {
        _comment_       : string[]
        spec            : number
        profile         : string
        version         : string
        path            : any
        minecraft       : string
        serverJarPath   : string
        data            : Data
        processors      : Processor[]
        libraries       : Library[]
        icon            : string
        json            : string
        logo            : string
        mirrorList      : string
    }

    export type VersionJson = {
        mainClass: string
        libraries: Library[]
    }

    export type Package = {
        name: string
        path: string
    }

    export type LoaderData = {
        minecraft_jar   : string
        install_profile : InstallProfile
        bin_path_client : string
        data            : Data
    }
}