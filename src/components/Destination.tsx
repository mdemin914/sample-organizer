import React from "react";
import { Paper, Typography } from "@mui/material";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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

const renderTree = (nodes: FolderNode[]): React.ReactNode =>
  nodes.map((node) => (
    <TreeItem
      key={node.path}
      nodeId={node.path}
      label={`${node.name} (${node.count})`}
    >
      {Object.keys(node.children).length > 0 &&
        renderTree(Object.values(node.children))}
    </TreeItem>
  ));

const Destination: React.FC<Props> = ({ folderTree, outputDir }) => (
  <Paper sx={{ flex: 1, minWidth: 0, height: "100%", overflow: "auto", p: 1 }}>
    <Typography variant="h6" gutterBottom>
      Destination
    </Typography>
    {outputDir && (
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
        {outputDir}
      </Typography>
    )}
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{ flexGrow: 1, overflowY: "auto" }}
    >
      {renderTree(folderTree)}
    </TreeView>
  </Paper>
);

export default Destination;
