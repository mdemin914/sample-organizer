import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as isDev from 'electron-is-dev';

let mainWindow: BrowserWindow;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for file system operations
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('scan-directory', async (_, directoryPath: string) => {
  try {
    const structure = await scanDirectoryRecursive(directoryPath);
    return structure;
  } catch (error) {
    console.error('Error scanning directory:', error);
    throw error;
  }
});

ipcMain.handle('get-audio-files', async (_, directoryPath: string) => {
  try {
    const audioFiles = await getAudioFilesRecursive(directoryPath);
    return audioFiles;
  } catch (error) {
    console.error('Error getting audio files:', error);
    throw error;
  }
});

ipcMain.handle('copy-file', async (_, sourcePath: string, destinationPath: string) => {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(destinationPath);
    await fs.mkdir(destDir, { recursive: true });
    
    // Copy file
    await fs.copyFile(sourcePath, destinationPath);
    return true;
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
});

// Helper functions
async function scanDirectoryRecursive(dirPath: string): Promise<DirectoryStructure> {
  const stats = await fs.stat(dirPath);
  const name = path.basename(dirPath);
  
  if (!stats.isDirectory()) {
    return { name, path: dirPath, type: 'file', children: [] };
  }
  
  const children: DirectoryStructure[] = [];
  const entries = await fs.readdir(dirPath);
  
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry);
    try {
      const entryStats = await fs.stat(entryPath);
      if (entryStats.isDirectory()) {
        const childStructure = await scanDirectoryRecursive(entryPath);
        children.push(childStructure);
      }
    } catch (error) {
      // Skip files/directories that can't be accessed
      console.warn(`Skipping ${entryPath}:`, error);
    }
  }
  
  return { name, path: dirPath, type: 'directory', children };
}

async function getAudioFilesRecursive(dirPath: string): Promise<AudioFile[]> {
  const audioFiles: AudioFile[] = [];
  const audioExtensions = ['.wav', '.mp3', '.flac', '.aiff', '.aif', '.m4a', '.ogg'];
  
  async function scan(currentPath: string) {
    try {
      const entries = await fs.readdir(currentPath);
      
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry);
        const stats = await fs.stat(entryPath);
        
        if (stats.isDirectory()) {
          await scan(entryPath);
        } else if (stats.isFile()) {
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
    } catch (error) {
      console.warn(`Error scanning ${currentPath}:`, error);
    }
  }
  
  await scan(dirPath);
  return audioFiles;
}

// Type definitions
interface DirectoryStructure {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children: DirectoryStructure[];
}

interface AudioFile {
  name: string;
  path: string;
  size: number;
  extension: string;
}