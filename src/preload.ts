import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  selectDirectory: () =>
    ipcRenderer.invoke("select-directory") as Promise<string | null>,
  scanDirectory: (dir: string) =>
    ipcRenderer.invoke("scan-directory", dir) as Promise<string[]>,
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
  // logging for debugging
  _debugOpenPath: (p: string) => {
    console.log("preload openPath", p);
    return ipcRenderer.invoke("open-path", p);
  },
});

declare global {
  interface Window {
    api: {
      selectDirectory: () => Promise<string | null>;
      scanDirectory: (dir: string) => Promise<string[]>;
      copyFiles: (
        mappings: { src: string; dest: string }[]
      ) => Promise<{ success: boolean; error?: string }>;
      openPath: (p: string) => Promise<void>;
    };
  }
}
