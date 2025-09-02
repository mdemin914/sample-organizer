"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const TreeView_1 = require("@mui/x-tree-view/TreeView");
const TreeItem_1 = require("@mui/x-tree-view/TreeItem");
const ExpandMore_1 = __importDefault(require("@mui/icons-material/ExpandMore"));
const ChevronRight_1 = __importDefault(require("@mui/icons-material/ChevronRight"));
const renderTree = (nodes) => nodes.map((node) => ((0, jsx_runtime_1.jsx)(TreeItem_1.TreeItem, { nodeId: node.path, label: `${node.name} (${node.count})`, children: Object.keys(node.children).length > 0 &&
        renderTree(Object.values(node.children)) }, node.path)));
const Destination = ({ folderTree, outputDir }) => ((0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { flex: 1, minWidth: 0, height: "100%", overflow: "auto", p: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "Destination" }), outputDir && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", color: "text.secondary", sx: { mb: 1 }, children: outputDir })), (0, jsx_runtime_1.jsx)(TreeView_1.TreeView, { defaultCollapseIcon: (0, jsx_runtime_1.jsx)(ExpandMore_1.default, {}), defaultExpandIcon: (0, jsx_runtime_1.jsx)(ChevronRight_1.default, {}), sx: { flexGrow: 1, overflowY: "auto" }, children: renderTree(folderTree) })] }));
exports.default = Destination;
//# sourceMappingURL=Destination.js.map