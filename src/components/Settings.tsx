import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from "@mui/material";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

interface SettingsState {
  apiKey: string;
  defaultDestination: string;
}

const Settings: React.FC<SettingsProps> = ({ open, onClose }) => {
  const [settings, setSettings] = useState<SettingsState>({
    apiKey: "",
    defaultDestination: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
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
    } catch (err) {
      setError("Failed to load settings");
      console.error(err);
    } finally {
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
    } catch (err) {
      setError("Failed to save settings");
      console.error(err);
    } finally {
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="OpenAI API Key"
            type="password"
            fullWidth
            value={settings.apiKey}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, apiKey: e.target.value }))
            }
            placeholder="Enter your OpenAI API key"
            helperText="This will be used for AI auto-mapping functionality"
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Default Destination Folder
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                fullWidth
                value={settings.defaultDestination}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    defaultDestination: e.target.value,
                  }))
                }
                placeholder="No default destination set"
                size="small"
              />
              <Button
                variant="outlined"
                onClick={handleSelectDirectory}
                sx={{ minWidth: "100px" }}
              >
                Browse
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
              This folder will be pre-selected when opening the app
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 1 }}>
              Settings saved successfully!
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Settings;
