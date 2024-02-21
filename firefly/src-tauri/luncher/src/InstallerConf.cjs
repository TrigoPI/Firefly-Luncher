"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MACRO = exports.FORGE = exports.MINECRAFT_URL = void 0;
var MINECRAFT_URL;
(function (MINECRAFT_URL) {
    MINECRAFT_URL["MANIFEST"] = "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json";
    MINECRAFT_URL["ASSET"] = "https://resources.download.minecraft.net";
})(MINECRAFT_URL || (exports.MINECRAFT_URL = MINECRAFT_URL = {}));
var FORGE;
(function (FORGE) {
    FORGE["WEBSITE"] = "https://files.minecraftforge.net/net/minecraftforge/forge";
    FORGE["UNPACKED"] = "forge-files/forge_unpacked";
    FORGE["CLIENT_LZMA"] = "data/client.lzma";
    FORGE["MANIFEST"] = "META-INF/MANIFEST.MF";
    FORGE["INSTALL_PROFILE"] = "install_profile.json";
})(FORGE || (exports.FORGE = FORGE = {}));
var MACRO;
(function (MACRO) {
    MACRO["MINECRAFT_JAR"] = "MINECRAFT_JAR";
    MACRO["BINPATCH"] = "BINPATCH";
    MACRO["INSTALLER"] = "INSTALLER";
    MACRO["SIDE"] = "SIDE";
})(MACRO || (exports.MACRO = MACRO = {}));
