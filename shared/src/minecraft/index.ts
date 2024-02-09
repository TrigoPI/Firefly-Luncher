export type ModSide = 'client' | 'server';
export type ServerState = 'stopped' | 'loading' | 'running'

export type Mod = {
    name: string;
    enable: boolean;
    side: ModSide;
}

export type ModList = {
    server: Mod[];
    client: Mod[]
}

export type ClientConf = {
    version: string
    name: string
    forge: string
}