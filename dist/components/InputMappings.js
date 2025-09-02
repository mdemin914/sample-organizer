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
const openaiUtil_1 = require("../services/openaiUtil");
const PlaybackContext_1 = require("../context/PlaybackContext");
const react_window_1 = require("react-window");
function getFileName(path) {
    return path.split("/").pop() || path;
}
const InputMappings = ({ mappings, inputDir, outputDir, apiKey, folderList = [], onMappingChange, onError, }) => {
    const [loadingIdx, setLoadingIdx] = (0, react_1.useState)(null);
    const { currentSrc, playing, play, toggle } = (0, PlaybackContext_1.usePlayback)();
    const duplicateSet = react_1.default.useMemo(() => {
        const nameCount = {};
        mappings.forEach((m) => {
            const name = getFileName(m.src);
            nameCount[name] = (nameCount[name] || 0) + 1;
        });
        return new Set(Object.keys(nameCount).filter((k) => nameCount[k] > 1));
    }, [mappings]);
    return ((0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: {
            minWidth: 0,
            flex: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            p: 1,
        }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", gutterBottom: true, children: ["Importing Samples \u2013 ", mappings.length] }), inputDir && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", color: "text.secondary", sx: { mb: 1 }, children: inputDir })), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { sx: { flex: 1, minHeight: 0, overflowY: "auto" }, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", stickyHeader: true, children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "Source" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "Destination" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "Conf" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "Dup" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, {})] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: (0, jsx_runtime_1.jsx)(react_window_1.FixedSizeList, { height: 600, itemCount: mappings.length, itemSize: 38, width: "100%", children: ({ index, style }) => {
                                    const m = mappings[index];
                                    const srcRel = inputDir
                                        ? m.src.replace(`${inputDir}/`, "")
                                        : m.src;
                                    const destRel = outputDir
                                        ? m.dest.replace(`${outputDir}/`, "")
                                        : m.dest;
                                    const srcParts = srcRel.split("/");
                                    const fileName = srcParts.pop();
                                    const srcFolder = srcParts.join("/");
                                    const destFolder = destRel.split("/").slice(0, -1).join("/");
                                    return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { style: style, children: [(0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: fileName }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", color: "text.secondary", children: srcFolder })] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", sx: { cursor: "pointer", textDecoration: "underline" }, onClick: async () => {
                                                        if (!outputDir)
                                                            return;
                                                        const fullPath = destFolder.startsWith(outputDir)
                                                            ? destFolder
                                                            : `${outputDir}/${destFolder}`;
                                                        await window.api.openPath(fullPath);
                                                    }, children: destFolder }) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(m.confidence * 100).toFixed(0), "%"] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: duplicateSet.has(getFileName(m.src)) && ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: "Dup", size: "small", color: "warning" })) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => {
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
                                } }) })] }) })] }));
};
exports.default = InputMappings;
//# sourceMappingURL=InputMappings.js.map