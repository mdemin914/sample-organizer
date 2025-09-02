import React from "react";
interface Mapping {
    src: string;
    dest: string;
    confidence: number;
    aiFolder?: string;
}
interface Props {
    mappings: Mapping[];
    inputDir: string | null;
    outputDir: string | null;
    apiKey: string;
    folderList: string[];
    allDirectories: string[];
    onMappingChange: (idx: number, newFolder: string) => void;
    onError: (msg: string) => void;
    onFolderCreated?: () => void;
}
declare const ImportSamples: React.FC<Props>;
export default ImportSamples;
//# sourceMappingURL=ImportSamples.d.ts.map