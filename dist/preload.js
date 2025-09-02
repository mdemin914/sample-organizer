"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("api", {
    selectDirectory: () => electron_1.ipcRenderer.invoke("select-directory"),
    scanDirectory: (dir) => electron_1.ipcRenderer.invoke("scan-directory", dir),
    scanDirectories: (dir) => electron_1.ipcRenderer.invoke("scan-directories", dir),
    copyFiles: (mappings) => electron_1.ipcRenderer.invoke("copy-files", mappings),
    openPath: (p) => electron_1.ipcRenderer.invoke("open-path", p),
    moveFile: (src, dest) => electron_1.ipcRenderer.invoke("move-file", src, dest),
    createDirectory: (dirPath) => electron_1.ipcRenderer.invoke("create-directory", dirPath),
    directoryExists: (dirPath) => electron_1.ipcRenderer.invoke("directory-exists", dirPath),
    // logging for debugging
    _debugOpenPath: (p) => {
        console.log("preload openPath", p);
        return electron_1.ipcRenderer.invoke("open-path", p);
    },
    // Settings API
    loadSettings: () => electron_1.ipcRenderer.invoke("load-settings"),
    saveSettings: (settings) => electron_1.ipcRenderer.invoke("save-settings", settings),
});
//# sourceMappingURL=preload.js.map