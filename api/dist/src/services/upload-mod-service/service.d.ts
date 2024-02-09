import { Response, ServiceClass } from "dolphin";
export default class UploadModService extends ServiceClass {
    private modsPath;
    OnStart(): Promise<void>;
    private GetFile;
    private CreateJar;
    private GetModWithoutExtension;
    OnUpload(modsData: string, files: Record<string, any>[]): Promise<Response>;
}
