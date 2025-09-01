"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    selectDirectory: () => electron_1.ipcRenderer.invoke('select-directory'),
    scanDirectory: (path) => electron_1.ipcRenderer.invoke('scan-directory', path),
    getAudioFiles: (path) => electron_1.ipcRenderer.invoke('get-audio-files', path),
    copyFile: (source, destination) => electron_1.ipcRenderer.invoke('copy-file', source, destination),
});
