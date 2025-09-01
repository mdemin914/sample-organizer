import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  scanDirectory: (path: string) => ipcRenderer.invoke('scan-directory', path),
  getAudioFiles: (path: string) => ipcRenderer.invoke('get-audio-files', path),
  copyFile: (source: string, destination: string) => ipcRenderer.invoke('copy-file', source, destination),
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      selectDirectory: () => Promise<string | null>;
      scanDirectory: (path: string) => Promise<DirectoryStructure>;
      getAudioFiles: (path: string) => Promise<AudioFile[]>;
      copyFile: (source: string, destination: string) => Promise<boolean>;
    };
  }
}

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