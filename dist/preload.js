"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("api", {
    selectDirectory: () => electron_1.ipcRenderer.invoke("select-directory"),
    scanDirectory: (dir) => electron_1.ipcRenderer.invoke("scan-directory", dir),
    copyFiles: (mappings) => electron_1.ipcRenderer.invoke("copy-files", mappings),
    openPath: (p) => electron_1.ipcRenderer.invoke("open-path", p),
    moveFile: (src, dest) => electron_1.ipcRenderer.invoke("move-file", src, dest),
    // logging for debugging
    _debugOpenPath: (p) => {
        console.log("preload openPath", p);
        return electron_1.ipcRenderer.invoke("open-path", p);
    },
});
//# sourceMappingURL=preload.js.map