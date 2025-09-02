export {};

declare global {
  interface Window {
    api: {
      selectDirectory(): Promise<string | null>;
      scanDirectory(dir: string): Promise<string[]>;
      copyFiles(
        mappings: { src: string; dest: string }[]
      ): Promise<{ success: boolean; error?: string }>;
      openPath(p: string): Promise<void>;
      moveFile(
        src: string,
        dest: string
      ): Promise<{ success: boolean; error?: string }>;
    };
  }
}
