"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const Settings = ({ open, onClose }) => {
    const [settings, setSettings] = (0, react_1.useState)({
        apiKey: "",
        defaultDestination: "",
    });
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (open) {
            loadSettings();
        }
    }, [open]);
    const loadSettings = async () => {
        try {
            setLoading(true);
            const savedSettings = await window.api.loadSettings();
            setSettings({
                apiKey: savedSettings.apiKey || "",
                defaultDestination: savedSettings.defaultDestination || "",
            });
        }
        catch (err) {
            setError("Failed to load settings");
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);
            await window.api.saveSettings({
                apiKey: settings.apiKey || undefined,
                defaultDestination: settings.defaultDestination || undefined,
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        }
        catch (err) {
            setError("Failed to save settings");
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSelectDirectory = async () => {
        const dir = await window.api.selectDirectory();
        if (dir) {
            setSettings((prev) => ({ ...prev, defaultDestination: dir }));
        }
    };
    const handleClose = () => {
        setError(null);
        setSuccess(false);
        onClose();
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: handleClose, maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "Settings" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: "flex", flexDirection: "column", gap: 2, pt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { label: "OpenAI API Key", type: "password", fullWidth: true, value: settings.apiKey, onChange: (e) => setSettings((prev) => ({ ...prev, apiKey: e.target.value })), placeholder: "Enter your OpenAI API key", helperText: "This will be used for AI auto-mapping functionality" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "Default Destination Folder" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: "flex", gap: 1, alignItems: "center" }, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, value: settings.defaultDestination, onChange: (e) => setSettings((prev) => ({
                                                ...prev,
                                                defaultDestination: e.target.value,
                                            })), placeholder: "No default destination set", size: "small" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", onClick: handleSelectDirectory, sx: { minWidth: "100px" }, children: "Browse" })] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", color: "text.secondary", children: "This folder will be pre-selected when opening the app" })] }), error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mt: 1 }, children: error })), success && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "success", sx: { mt: 1 }, children: "Settings saved successfully!" }))] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClose, children: "Cancel" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSave, variant: "contained", disabled: loading, children: loading ? "Saving..." : "Save" })] })] }));
};
exports.default = Settings;
//# sourceMappingURL=Settings.js.map