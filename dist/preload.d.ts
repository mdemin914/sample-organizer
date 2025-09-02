declare global {
    interface Window {
        api: {
            selectDirectory: () => Promise<string | null>;
            scanDirectory: (dir: string) => Promise<string[]>;
            scanDirectories: (dir: string) => Promise<string[]>;
            copyFiles: (mappings: {
                src: string;
                dest: string;
            }[]) => Promise<{
                success: boolean;
                error?: string;
            }>;
            openPath: (p: string) => Promise<void>;
            moveFile: (src: string, dest: string) => Promise<{
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
            }) => Promise<{
                success: boolean;
            }>;
        };
    }
}
export {};
//# sourceMappingURL=preload.d.ts.map