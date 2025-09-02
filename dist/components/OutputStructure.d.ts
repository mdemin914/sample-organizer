import React from "react";
interface FolderNode {
    name: string;
    path: string;
    count: number;
    children: Record<string, FolderNode>;
}
interface Props {
    folderTree: FolderNode[];
    outputDir: string | null;
}
declare const OutputStructure: React.FC<Props>;
export default OutputStructure;
//# sourceMappingURL=OutputStructure.d.ts.map