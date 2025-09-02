import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { shell } from "electron";
import { join } from "path";
import fs from "fs-extra";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

interface Settings {
  apiKey?: string;
  defaultDestination?: string;
  volume?: number;
}

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1700,
    height: 900,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === "development") {
    await mainWindow.loadFile(join(__dirname, "..", "index.html"));
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(join(__dirname, "..", "index.html"));
    mainWindow.webContents.once("dom-ready", () => {
      console.log("Renderer DOM ready");
    });
  }
}

app.whenReady().then(() => {
  if (process.env.NODE_ENV === "development") {
    installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
      console.warn("DevTools install failed", err)
    );
  }
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Settings file path
const getSettingsPath = () => join(app.getPath("userData"), "settings.json");

// Settings helpers
async function loadSettings(): Promise<Settings> {
  try {
    const settingsPath = getSettingsPath();
    if (await fs.pathExists(settingsPath)) {
      return await fs.readJson(settingsPath);
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
  return {};
}

async function saveSettings(settings: Settings): Promise<void> {
  try {
    const settingsPath = getSettingsPath();
    await fs.ensureDir(join(settingsPath, ".."));
    await fs.writeJson(settingsPath, settings, { spaces: 2 });
  } catch (error) {
    console.error("Failed to save settings:", error);
    throw error;
  }
}

// IPC handlers for settings
ipcMain.handle("load-settings", async () => {
  return await loadSettings();
});

ipcMain.handle("save-settings", async (_event, settings: Settings) => {
  await saveSettings(settings);
  return { success: true };
});

// IPC handlers
ipcMain.handle("select-directory", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
});

// Recursively walk directory to get files
function walk(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, fileList);
    } else {
      const ext = file.split(".").pop()?.toLowerCase();
      const audioExts = ["wav", "aif", "aiff", "flac", "mp3", "ogg"];
      if (ext && audioExts.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

// Recursively walk directory to get all subdirectories
function walkDirectories(dir: string, dirList: string[] = []): string[] {
  try {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        dirList.push(filePath);
        walkDirectories(filePath, dirList);
      }
    });
  } catch (e) {
    console.error(`Error scanning directory ${dir}:`, e);
  }
  return dirList;
}

ipcMain.handle("scan-directory", async (_event, dir: string) => {
  try {
    return walk(dir);
  } catch (e) {
    console.error(e);
    return [];
  }
});

ipcMain.handle("scan-directories", async (_event, dir: string) => {
  try {
    return walkDirectories(dir);
  } catch (e) {
    console.error(e);
    return [];
  }
});

ipcMain.handle(
  "copy-files",
  async (_event, mappings: { src: string; dest: string }[]) => {
    try {
      for (const { src, dest } of mappings) {
        await fs.ensureDir(join(dest, ".."));
        await fs.copyFile(src, dest);
      }
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: (e as Error).message };
    }
  }
);

ipcMain.handle("open-path", async (_e, target: string) => {
  try {
    console.log("main open-path", target);
    const res = await shell.openPath(target);
    if (res) {
      // if openPath failed, fallback to showing in folder
      shell.showItemInFolder(target);
    }
  } catch (e) {
    console.error(e);
  }
});

ipcMain.handle("move-file", async (_e, src: string, dest: string) => {
  try {
    await fs.ensureDir(require("path").dirname(dest));
    await fs.move(src, dest, { overwrite: false });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: (e as Error).message };
  }
});

ipcMain.handle("create-directory", async (_e, dirPath: string) => {
  try {
    await fs.ensureDir(dirPath);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: (e as Error).message };
  }
});

ipcMain.handle("directory-exists", async (_e, dirPath: string) => {
  try {
    const stat = await fs.stat(dirPath);
    return { exists: stat.isDirectory() };
  } catch (e) {
    return { exists: false };
  }
});
