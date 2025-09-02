export interface MappingResult {
    [filename: string]: string;
}
export interface MappingRequest {
    filenames: string[];
    folders: string[];
    apiKey: string;
    examples?: {
        file: string;
        folder: string;
    }[];
    batchSize?: number;
}
export declare function mapFilenamesToFolders({ filenames, folders, apiKey, examples, }: MappingRequest): Promise<MappingResult>;
export declare function mapFilenamesBatched(req: MappingRequest): Promise<MappingResult>;
export declare function classifyFile(filename: string, req: Omit<MappingRequest, "filenames">): Promise<string>;
//# sourceMappingURL=openaiUtil.d.ts.map