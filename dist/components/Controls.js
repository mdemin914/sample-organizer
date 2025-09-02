"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const Controls = ({ onSelectOutput, onSelectInput, onAutoMap, outputSelected, inputSelected, apiKey, onApiKeyChange, }) => ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { label: "OpenAI API Key", size: "small", sx: { mr: 2, width: 300 }, type: "password", value: apiKey, onChange: (e) => onApiKeyChange(e.target.value) }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", onClick: onSelectOutput, sx: { mr: 2 }, children: "Destination Folder" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "secondary", onClick: onSelectInput, disabled: !outputSelected, children: "Import Samples" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", sx: { ml: 2 }, onClick: onAutoMap, disabled: !outputSelected || !inputSelected, children: "AI Auto-Map" })] }));
exports.default = Controls;
//# sourceMappingURL=Controls.js.map