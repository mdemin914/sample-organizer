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
    <Button
      sx={{ mr: 2 }}
      variant="contained"
      color="secondary"
      onClick={onSelectInput}
      disabled={!outputSelected}
    >
      Import Samples
    </Button>

    <Button variant="contained" onClick={onSelectOutput} sx={{ mr: 2 }}>
      Library
    </Button>
  </Box>
);

export default Controls;
