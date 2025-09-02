"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const AutoFixHigh_1 = __importDefault(require("@mui/icons-material/AutoFixHigh"));
const DriveFileMove_1 = __importDefault(require("@mui/icons-material/DriveFileMove"));
const PlayArrow_1 = __importDefault(require("@mui/icons-material/PlayArrow"));
const Stop_1 = __importDefault(require("@mui/icons-material/Stop"));
const CreateNewFolder_1 = __importDefault(require("@mui/icons-material/CreateNewFolder"));
const openaiUtil_1 = require("../services/openaiUtil");
const PlaybackContext_1 = require("../context/PlaybackContext");
const ImportSamples = ({ mappings, inputDir, outputDir, apiKey, folderList = [], allDirectories = [], onMappingChange, onError, onFolderCreated, }) => {
    const [loadingIdx, setLoadingIdx] = (0, react_1.useState)(null);
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    const [pageSize] = (0, react_1.useState)(50); // 50 items per page
    const { currentSrc, playing, play, toggle } = (0, PlaybackContext_1.usePlayback)();
    // Calculate pagination
    const totalPages = Math.ceil(mappings.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, mappings.length);
    const currentPageMappings = mappings.slice(startIndex, endIndex);
    const handlePageChange = (_, page) => {
        setCurrentPage(page);
    };
    // Reset to page 1 when mappings change (new data loaded)
    react_1.default.useEffect(() => {
        setCurrentPage(1);
    }, [mappings.length]);
    // Simple function to check if a folder exists in the directory list
    const checkFolderExists = (destFolder) => {
        if (!outputDir)
            return false;
        const fullPath = `${outputDir}/${destFolder}`;
        // Try both exact match and normalized match
        const normalizedPath = fullPath.replace(/\/+/g, "/"); // Remove double slashes
        const exists = allDirectories.includes(fullPath) ||
            allDirectories.includes(normalizedPath) ||
            allDirectories.some((dir) => dir.endsWith(`/${destFolder}`));
        return exists;
    };
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
                                } })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { flex: 1, overflow: "auto" }, children: currentPageMappings.map((m, index) => {
                            const actualIndex = startIndex + index;
                            // Adjust path displays
                            const srcRel = inputDir ? m.src.replace(`${inputDir}/`, "") : m.src;
                            const srcParts = srcRel.split("/");
                            const fileName = srcParts.pop();
                            const srcFolder = srcParts.join("/");
                            // Handle empty destinations
                            if (!m.dest) {
                                return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                        display: "flex",
                                        alignItems: "center",
                                        px: 2,
                                        py: 0.5,
                                        minHeight: 38,
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
                                                alignItems: "center",
                                                gap: 0.5,
                                            }, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", sx: {
                                                    color: "text.secondary",
                                                    fontStyle: "italic",
                                                }, children: "No destination set" }) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
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
                                                    }, children: currentSrc === m.src && playing ? ((0, jsx_runtime_1.jsx)(Stop_1.default, { fontSize: "inherit" })) : ((0, jsx_runtime_1.jsx)(PlayArrow_1.default, { fontSize: "inherit" })) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", disabled: !apiKey || loadingIdx === actualIndex, onClick: async () => {
                                                        if (folderList.length === 0)
                                                            return;
                                                        setLoadingIdx(actualIndex);
                                                        try {
                                                            const folder = await (0, openaiUtil_1.classifyFile)(m.src, {
                                                                folders: folderList,
                                                                apiKey,
                                                            });
                                                            onMappingChange(actualIndex, folder);
                                                        }
                                                        catch (e) {
                                                            onError(e.message);
                                                        }
                                                        finally {
                                                            setLoadingIdx(null);
                                                        }
                                                    }, children: loadingIdx === actualIndex ? ((0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 16 })) : ((0, jsx_runtime_1.jsx)(AutoFixHigh_1.default, { fontSize: "inherit" })) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", disabled: true, title: "Set destination first to import", children: (0, jsx_runtime_1.jsx)(DriveFileMove_1.default, { fontSize: "inherit" }) })] })] }, actualIndex));
                            }
                            const destRel = outputDir
                                ? m.dest.replace(`${outputDir}/`, "")
                                : m.dest;
                            const destFolder = destRel.split("/").slice(0, -1).join("/");
                            // Check if destination folder exists in the directory list
                            const folderExists = checkFolderExists(destFolder);
                            return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                    display: "flex",
                                    alignItems: "center",
                                    px: 2,
                                    py: 0.5,
                                    minHeight: 38,
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
                                                }, title: srcFolder, children: srcFolder })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                            flex: 8,
                                            minWidth: 0,
                                            pr: 1,
                                            overflow: "hidden",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                        }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", noWrap: true, sx: {
                                                    cursor: "pointer",
                                                    textDecoration: "underline",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    flex: 1,
                                                    color: folderExists ? "inherit" : "warning.main",
                                                }, title: folderExists
                                                    ? destFolder
                                                    : `${destFolder} (doesn't exist)`, onClick: async () => {
                                                    if (!outputDir || !folderExists)
                                                        return;
                                                    const fullPath = destFolder.startsWith(outputDir)
                                                        ? destFolder
                                                        : `${outputDir}/${destFolder}`;
                                                    await window.api.openPath(fullPath);
                                                }, children: destFolder }), !folderExists && ((0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", sx: {
                                                    color: "success.main",
                                                    "&:hover": {
                                                        backgroundColor: "success.light",
                                                        color: "success.contrastText",
                                                    },
                                                }, title: `Create folder "${destFolder}"`, onClick: async () => {
                                                    if (!outputDir)
                                                        return;
                                                    const fullPath = `${outputDir}/${destFolder}`;
                                                    try {
                                                        const result = await window.api.createDirectory(fullPath);
                                                        if (result.success) {
                                                            // Refresh the folder list
                                                            onFolderCreated?.();
                                                        }
                                                        else {
                                                            onError(result.error || "Failed to create directory");
                                                        }
                                                    }
                                                    catch (error) {
                                                        onError("Failed to create directory");
                                                    }
                                                }, children: (0, jsx_runtime_1.jsx)(CreateNewFolder_1.default, { fontSize: "inherit" }) }))] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
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
                                                }, children: currentSrc === m.src && playing ? ((0, jsx_runtime_1.jsx)(Stop_1.default, { fontSize: "inherit" })) : ((0, jsx_runtime_1.jsx)(PlayArrow_1.default, { fontSize: "inherit" })) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", disabled: !apiKey || loadingIdx === actualIndex, onClick: async () => {
                                                    if (folderList.length === 0)
                                                        return;
                                                    setLoadingIdx(actualIndex);
                                                    try {
                                                        const folder = await (0, openaiUtil_1.classifyFile)(m.src, {
                                                            folders: folderList,
                                                            apiKey,
                                                        });
                                                        onMappingChange(actualIndex, folder);
                                                    }
                                                    catch (e) {
                                                        onError(e.message);
                                                    }
                                                    finally {
                                                        setLoadingIdx(null);
                                                    }
                                                }, children: loadingIdx === actualIndex ? ((0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 16 })) : ((0, jsx_runtime_1.jsx)(AutoFixHigh_1.default, { fontSize: "inherit" })) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: async () => {
                                                    const res = await window.api.moveFile(m.src, m.dest);
                                                    if (!res.success)
                                                        onError(res.error || "Move failed");
                                                }, children: (0, jsx_runtime_1.jsx)(DriveFileMove_1.default, { fontSize: "inherit" }) })] })] }, actualIndex));
                        }) }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", sx: { px: 2, py: 1, borderTop: 1, borderColor: "divider" }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["Showing ", startIndex + 1, "-", endIndex, " of ", mappings.length, " items"] }), (0, jsx_runtime_1.jsx)(material_1.Pagination, { count: totalPages, page: currentPage, onChange: handlePageChange, color: "primary", size: "small" })] })] })] }));
};
exports.default = ImportSamples;
//# sourceMappingURL=ImportSamples.js.map