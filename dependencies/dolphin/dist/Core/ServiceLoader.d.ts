import { ServiceData } from "../Types/service-module-types";
export default class ServiceLoader {
    private logger;
    private dirPath;
    constructor(dirPath: string);
    LoadFromPath(path: string): Promise<ServiceData>;
    Load(): Promise<ServiceData[]>;
    private LoadModule;
}
