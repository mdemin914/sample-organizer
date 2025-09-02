"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_2 = require("electron");
const path_1 = require("path");
const fs_extra_1 = __importDefault(require("fs-extra"));
const electron_devtools_installer_1 = __importStar(require("electron-devtools-installer"));
let mainWindow = null;
async function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1700,
        height: 900,
        webPreferences: {
            preload: (0, path_1.join)(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (process.env.NODE_ENV === "development") {
        await mainWindow.loadFile((0, path_1.join)(__dirname, "..", "index.html"));
        mainWindow.webContents.openDevTools();
    }
    else {
        await mainWindow.loadFile((0, path_1.join)(__dirname, "..", "index.html"));
        mainWindow.webContents.once("dom-ready", () => {
            console.log("Renderer DOM ready");
        });
    }
}
electron_1.app.whenReady().then(() => {
    if (process.env.NODE_ENV === "development") {
        (0, electron_devtools_installer_1.default)(electron_devtools_installer_1.REACT_DEVELOPER_TOOLS).catch((err) => console.warn("DevTools install failed", err));
    }
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
// IPC handlers
electron_1.ipcMain.handle("select-directory", async () => {
    const { canceled, filePaths } = await electron_1.dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    if (canceled || filePaths.length === 0)
        return null;
    return filePaths[0];
});
// Recursively walk directory to get files
function walk(dir, fileList = []) {
    const files = fs_extra_1.default.readdirSync(dir);
    files.forEach((file) => {
        const filePath = (0, path_1.join)(dir, file);
        const stat = fs_extra_1.default.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath, fileList);
        }
        else {
            const ext = file.split(".").pop()?.toLowerCase();
            const audioExts = ["wav", "aif", "aiff", "flac", "mp3", "ogg"];
            if (ext && audioExts.includes(ext)) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}
electron_1.ipcMain.handle("scan-directory", async (_event, dir) => {
    try {
        return walk(dir);
    }
    catch (e) {
        console.error(e);
        return [];
    }
});
electron_1.ipcMain.handle("copy-files", async (_event, mappings) => {
    try {
        for (const { src, dest } of mappings) {
            await fs_extra_1.default.ensureDir((0, path_1.join)(dest, ".."));
            await fs_extra_1.default.copyFile(src, dest);
        }
        return { success: true };
    }
    catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});
electron_1.ipcMain.handle("open-path", async (_e, target) => {
    try {
        console.log("main open-path", target);
        const res = await electron_2.shell.openPath(target);
        if (res) {
            // if openPath failed, fallback to showing in folder
            electron_2.shell.showItemInFolder(target);
        }
    }
    catch (e) {
        console.error(e);
    }
});
electron_1.ipcMain.handle("move-file", async (_e, src, dest) => {
    try {
        await fs_extra_1.default.ensureDir(require("path").dirname(dest));
        await fs_extra_1.default.move(src, dest, { overwrite: false });
        return { success: true };
    }
    catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});
//# sourceMappingURL=main.js.map