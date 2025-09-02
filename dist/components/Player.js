"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const PlaybackContext_1 = require("../context/PlaybackContext");
const material_1 = require("@mui/material");
const PlayArrow_1 = __importDefault(require("@mui/icons-material/PlayArrow"));
const Pause_1 = __importDefault(require("@mui/icons-material/Pause"));
const Loop_1 = __importDefault(require("@mui/icons-material/Loop"));
function format(t) {
    const m = Math.floor(t / 60)
        .toString()
        .padStart(2, "0");
    const s = Math.floor(t % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
}
const Player = () => {
    const { currentSrc, playing, duration, currentTime, toggle, seek, volume, setVolume, loop, toggleLoop, } = (0, PlaybackContext_1.usePlayback)();
    const disabled = !currentSrc;
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            p: 1,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 2,
        }, children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: toggle, disabled: disabled, children: playing ? (0, jsx_runtime_1.jsx)(Pause_1.default, {}) : (0, jsx_runtime_1.jsx)(PlayArrow_1.default, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: toggleLoop, color: loop ? "primary" : "default", disabled: disabled, children: (0, jsx_runtime_1.jsx)(Loop_1.default, {}) }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", sx: {
                    flex: 1,
                    minWidth: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }, children: currentSrc ? currentSrc.split("/").pop() : "No track" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", children: format(currentTime) }), (0, jsx_runtime_1.jsx)(material_1.Slider, { min: 0, max: duration || 1, value: disabled ? 0 : currentTime, onChange: (_, v) => seek(v), sx: { width: 150, mx: 1 }, disabled: disabled }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", children: format(duration) }), (0, jsx_runtime_1.jsx)(material_1.Slider, { min: 0, max: 1, step: 0.01, value: volume, onChange: (_, v) => setVolume(v), sx: { width: 100 }, disabled: disabled })] }));
};
exports.default = Player;
//# sourceMappingURL=Player.js.map