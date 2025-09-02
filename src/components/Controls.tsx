import React from "react";
import { Box, Button, TextField, Slider, Typography } from "@mui/material";

interface ControlsProps {
  onSelectOutput: () => void;
  onSelectInput: () => void;
  onAutoMap: () => void;
  outputSelected: boolean;
  inputSelected?: boolean;
  apiKey: string;
  onApiKeyChange: (v: string) => void;
}

const Controls: React.FC<ControlsProps> = ({
  onSelectOutput,
  onSelectInput,
  onAutoMap,
  outputSelected,
  inputSelected,
  apiKey,
  onApiKeyChange,
}) => (
  <Box sx={{ mb: 2 }}>
    <TextField
      label="OpenAI API Key"
      size="small"
      sx={{ mr: 2, width: 300 }}
      type="password"
      value={apiKey}
      onChange={(e) => onApiKeyChange(e.target.value)}
    />

    <Button variant="contained" onClick={onSelectOutput} sx={{ mr: 2 }}>
      Destination Folder
    </Button>
    <Button
      variant="contained"
      color="secondary"
      onClick={onSelectInput}
      disabled={!outputSelected}
    >
      Import Samples
    </Button>

    <Button
      variant="outlined"
      sx={{ ml: 2 }}
      onClick={onAutoMap}
      disabled={!outputSelected || !inputSelected}
    >
      AI Auto-Map
    </Button>
  </Box>
);

export default Controls;
