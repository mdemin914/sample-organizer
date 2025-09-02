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
    onMappingChange: (idx: number, newFolder: string) => void;
    onError: (msg: string) => void;
}
declare const InputMappings: React.FC<Props>;
export default InputMappings;
//# sourceMappingURL=InputMappings.d.ts.map