import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface DirectorySelectorProps {
  onDirectorySelect: (path: string) => void;
  selectedPath: string | null;
  label: string;
}

const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  onDirectorySelect,
  selectedPath,
  label,
}) => {
  const handleSelectDirectory = async () => {
    try {
      const path = await window.electronAPI.selectDirectory();
      if (path) {
        onDirectorySelect(path);
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<FolderOpenIcon />}
        onClick={handleSelectDirectory}
        sx={{ mb: 2 }}
      >
        {label}
      </Button>
      
      {selectedPath && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: 'success.dark',
            borderColor: 'success.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CheckCircleIcon color="success" />
          <Box>
            <Typography variant="body2" color="success.light" sx={{ fontWeight: 'bold' }}>
              Selected Directory:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                color: 'success.light',
              }}
            >
              {selectedPath}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default DirectorySelector;