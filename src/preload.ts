import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  selectDirectory: () =>
    ipcRenderer.invoke("select-directory") as Promise<string | null>,
  scanDirectory: (dir: string) =>
    ipcRenderer.invoke("scan-directory", dir) as Promise<string[]>,
  scanDirectories: (dir: string) =>
    ipcRenderer.invoke("scan-directories", dir) as Promise<string[]>,
  copyFiles: (mappings: { src: string; dest: string }[]) =>
    ipcRenderer.invoke("copy-files", mappings) as Promise<{
      success: boolean;
      error?: string;
    }>,
  openPath: (p: string) => ipcRenderer.invoke("open-path", p) as Promise<void>,
  moveFile: (src: string, dest: string) =>
    ipcRenderer.invoke("move-file", src, dest) as Promise<{
      success: boolean;
      error?: string;
    }>,
  createDirectory: (dirPath: string) =>
    ipcRenderer.invoke("create-directory", dirPath) as Promise<{
      success: boolean;
      error?: string;
    }>,
  directoryExists: (dirPath: string) =>
    ipcRenderer.invoke("directory-exists", dirPath) as Promise<{
      exists: boolean;
    }>,
  // logging for debugging
  _debugOpenPath: (p: string) => {
    console.log("preload openPath", p);
    return ipcRenderer.invoke("open-path", p);
  },
  // Settings API
  loadSettings: () =>
    ipcRenderer.invoke("load-settings") as Promise<{
      apiKey?: string;
      defaultDestination?: string;
      volume?: number;
    }>,
  saveSettings: (settings: {
    apiKey?: string;
    defaultDestination?: string;
    volume?: number;
  }) =>
    ipcRenderer.invoke("save-settings", settings) as Promise<{
      success: boolean;
    }>,
});

declare global {
  interface Window {
    api: {
      selectDirectory: () => Promise<string | null>;
      scanDirectory: (dir: string) => Promise<string[]>;
      scanDirectories: (dir: string) => Promise<string[]>;
      copyFiles: (
        mappings: { src: string; dest: string }[]
      ) => Promise<{ success: boolean; error?: string }>;
      openPath: (p: string) => Promise<void>;
      moveFile: (
        src: string,
        dest: string
      ) => Promise<{
        success: boolean;
        error?: string;
      }>;
      createDirectory: (dirPath: string) => Promise<{
        success: boolean;
        error?: string;
      }>;
      directoryExists: (dirPath: string) => Promise<{
        exists: boolean;
      }>;
      loadSettings: () => Promise<{
        apiKey?: string;
        defaultDestination?: string;
        volume?: number;
      }>;
      saveSettings: (settings: {
        apiKey?: string;
        defaultDestination?: string;
        volume?: number;
      }) => Promise<{ success: boolean }>;
    };
  }
}
