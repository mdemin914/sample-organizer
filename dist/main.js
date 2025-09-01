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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const isDev = __importStar(require("electron-is-dev"));
let mainWindow;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        titleBarStyle: 'hiddenInset',
        show: false,
    });
    // Load the app
    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`;
    mainWindow.loadURL(startUrl);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// IPC handlers for file system operations
electron_1.ipcMain.handle('select-directory', async () => {
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
    });
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});
electron_1.ipcMain.handle('scan-directory', async (_, directoryPath) => {
    try {
        const structure = await scanDirectoryRecursive(directoryPath);
        return structure;
    }
    catch (error) {
        console.error('Error scanning directory:', error);
        throw error;
    }
});
electron_1.ipcMain.handle('get-audio-files', async (_, directoryPath) => {
    try {
        const audioFiles = await getAudioFilesRecursive(directoryPath);
        return audioFiles;
    }
    catch (error) {
        console.error('Error getting audio files:', error);
        throw error;
    }
});
electron_1.ipcMain.handle('copy-file', async (_, sourcePath, destinationPath) => {
    try {
        // Ensure destination directory exists
        const destDir = path.dirname(destinationPath);
        await fs.mkdir(destDir, { recursive: true });
        // Copy file
        await fs.copyFile(sourcePath, destinationPath);
        return true;
    }
    catch (error) {
        console.error('Error copying file:', error);
        throw error;
    }
});
// Helper functions
async function scanDirectoryRecursive(dirPath) {
    const stats = await fs.stat(dirPath);
    const name = path.basename(dirPath);
    if (!stats.isDirectory()) {
        return { name, path: dirPath, type: 'file', children: [] };
    }
    const children = [];
    const entries = await fs.readdir(dirPath);
    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry);
        try {
            const entryStats = await fs.stat(entryPath);
            if (entryStats.isDirectory()) {
                const childStructure = await scanDirectoryRecursive(entryPath);
                children.push(childStructure);
            }
        }
        catch (error) {
            // Skip files/directories that can't be accessed
            console.warn(`Skipping ${entryPath}:`, error);
        }
    }
    return { name, path: dirPath, type: 'directory', children };
}
async function getAudioFilesRecursive(dirPath) {
    const audioFiles = [];
    const audioExtensions = ['.wav', '.mp3', '.flac', '.aiff', '.aif', '.m4a', '.ogg'];
    async function scan(currentPath) {
        try {
            const entries = await fs.readdir(currentPath);
            for (const entry of entries) {
                const entryPath = path.join(currentPath, entry);
                const stats = await fs.stat(entryPath);
                if (stats.isDirectory()) {
                    await scan(entryPath);
                }
                else if (stats.isFile()) {
                    const ext = path.extname(entry).toLowerCase();
                    if (audioExtensions.includes(ext)) {
                        audioFiles.push({
                            name: entry,
                            path: entryPath,
                            size: stats.size,
                            extension: ext,
                        });
                    }
                }
            }
        }
        catch (error) {
            console.warn(`Error scanning ${currentPath}:`, error);
        }
    }
    await scan(dirPath);
    return audioFiles;
}
