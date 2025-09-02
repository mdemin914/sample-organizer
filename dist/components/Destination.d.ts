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
declare const Destination: React.FC<Props>;
export default Destination;
//# sourceMappingURL=Destination.d.ts.map