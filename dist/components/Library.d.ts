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
declare const Library: React.FC<Props>;
export default Library;
//# sourceMappingURL=Library.d.ts.map