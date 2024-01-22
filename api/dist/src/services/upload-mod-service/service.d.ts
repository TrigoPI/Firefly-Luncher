import { Response, ServiceClass } from "dolphin";
export default class UploadModService extends ServiceClass {
    private serverFolderPath;
    private clientFolderPath;
    OnStart(): Promise<void>;
    private GetFile;
    private CreateJar;
    OnUpload(modsData: string, files: Record<string, any>[]): Promise<Response>;
}
