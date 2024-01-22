import LuncherDownload from "./LuncherDownload";

(async () => {
    const downloader: LuncherDownload = new LuncherDownload();
    await downloader.InstallVersion("1.18", "C:/Users/payet/Desktop/programs/NodeJs/Firefly/luncher/game", "osx", "64");  
})();