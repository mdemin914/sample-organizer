"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const AutoFixHigh_1 = __importDefault(require("@mui/icons-material/AutoFixHigh"));
const DriveFileMove_1 = __importDefault(require("@mui/icons-material/DriveFileMove"));
const PlayArrow_1 = __importDefault(require("@mui/icons-material/PlayArrow"));
const Stop_1 = __importDefault(require("@mui/icons-material/Stop"));
const openaiUtil_1 = require("../services/openaiUtil");
const PlaybackContext_1 = require("../context/PlaybackContext");
const react_window_1 = require("react-window");
const ImportSamples = ({ mappings, inputDir, outputDir, apiKey, folderList = [], onMappingChange, onError, }) => {
    const [loadingIdx, setLoadingIdx] = (0, react_1.useState)(null);
    const { currentSrc, playing, play, toggle } = (0, PlaybackContext_1.usePlayback)();
    return ((0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: {
            minWidth: 0,
            flex: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            p: 1,
        }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", gutterBottom: true, children: ["Importing Samples \u2013 ", mappings.length] }), inputDir && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", color: "text.secondary", sx: { mb: 1 }, children: inputDir })), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                            display: "flex",
                            backgroundColor: "action.hover",
                            borderBottom: 1,
                            borderColor: "divider",
                            py: 1,
                            px: 2,
                            fontWeight: "medium",
                            fontSize: "0.875rem",
                            alignItems: "center",
                        }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                                    flex: 10,
                                    minWidth: 0,
                                    pr: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }, children: "Source" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                                    flex: 8,
                                    minWidth: 0,
                                    pr: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }, children: "Destination" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                                    flex: 2,
                                    minWidth: 0,
                                    pr: 1,
                                } })] }), (0, jsx_runtime_1.jsx)(react_window_1.FixedSizeList, { height: 600, itemCount: mappings.length, itemSize: 38, width: "100%", children: ({ index, style, }) => {
                            const m = mappings[index];
                            // Adjust path displays
                            const srcRel = inputDir ? m.src.replace(`${inputDir}/`, "") : m.src;
                            const destRel = outputDir
                                ? m.dest.replace(`${outputDir}/`, "")
                                : m.dest;
                            const srcParts = srcRel.split("/");
                            const fileName = srcParts.pop();
                            const srcFolder = srcParts.join("/");
                            const destFolder = destRel.split("/").slice(0, -1).join("/");
                            return ((0, jsx_runtime_1.jsxs)(material_1.Box, { style: style, sx: {
                                    display: "flex",
                                    alignItems: "center",
                                    px: 2,
                                    borderBottom: "1px solid",
                                    borderColor: "divider",
                                    "&:hover": {
                                        backgroundColor: "action.hover",
                                    },
                                }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                            flex: 10,
                                            minWidth: 0,
                                            pr: 1,
                                            overflow: "hidden",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                        }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", noWrap: true, sx: {
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }, title: fileName, children: fileName }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", color: "text.secondary", noWrap: true, sx: {
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }, title: srcFolder, children: srcFolder })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                                            flex: 8,
                                            minWidth: 0,
                                            pr: 1,
                                            overflow: "hidden",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                        }, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", noWrap: true, sx: {
                                                cursor: "pointer",
                                                textDecoration: "underline",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }, title: destFolder, onClick: async () => {
                                                if (!outputDir)
                                                    return;
                                                const fullPath = destFolder.startsWith(outputDir)
                                                    ? destFolder
                                                    : `${outputDir}/${destFolder}`;
                                                await window.api.openPath(fullPath);
                                            }, children: destFolder }) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                            flex: 2,
                                            minWidth: 0,
                                            display: "flex",
                                            gap: 0.5,
                                            pr: 1,
                                            alignItems: "center",
                                            justifyContent: "flex-start",
                                        }, children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => {
                                                    if (currentSrc === m.src)
                                                        toggle();
                                                    else
                                                        play(m.src);
                                                }, children: currentSrc === m.src && playing ? ((0, jsx_runtime_1.jsx)(Stop_1.default, { fontSize: "inherit" })) : ((0, jsx_runtime_1.jsx)(PlayArrow_1.default, { fontSize: "inherit" })) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", disabled: !apiKey || loadingIdx === index, onClick: async () => {
                                                    if (folderList.length === 0)
                                                        return;
                                                    setLoadingIdx(index);
                                                    try {
                                                        const folder = await (0, openaiUtil_1.classifyFile)(m.src, {
                                                            folders: folderList,
                                                            apiKey,
                                                        });
                                                        onMappingChange(index, folder);
                                                    }
                                                    catch (e) {
                                                        onError(e.message);
                                                    }
                                                    finally {
                                                        setLoadingIdx(null);
                                                    }
                                                }, children: loadingIdx === index ? ((0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 16 })) : ((0, jsx_runtime_1.jsx)(AutoFixHigh_1.default, { fontSize: "inherit" })) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: async () => {
                                                    const res = await window.api.moveFile(m.src, m.dest);
                                                    if (!res.success)
                                                        onError(res.error || "Move failed");
                                                }, children: (0, jsx_runtime_1.jsx)(DriveFileMove_1.default, { fontSize: "inherit" }) })] })] }, index));
                        } })] })] }));
};
exports.default = ImportSamples;
//# sourceMappingURL=ImportSamples.js.map