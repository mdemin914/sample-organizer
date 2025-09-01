import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  AudioFile as AudioFileIcon,
} from '@mui/icons-material';
import { AudioFile } from '../types';

interface AudioFileListProps {
  files: AudioFile[];
  maxItems?: number;
}

const AudioFileList: React.FC<AudioFileListProps> = ({ files, maxItems = 10 }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getExtensionColor = (extension: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' => {
    switch (extension.toLowerCase()) {
      case '.wav':
      case '.aiff':
      case '.aif':
        return 'primary';
      case '.mp3':
        return 'secondary';
      case '.flac':
        return 'success';
      case '.m4a':
        return 'warning';
      default:
        return 'default';
    }
  };

  const displayFiles = files.slice(0, maxItems);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        maxHeight: 300,
        overflowY: 'auto',
      }}
    >
      <List dense>
        {displayFiles.map((file, index) => (
          <ListItem
            key={`${file.path}-${index}`}
            sx={{
              borderBottom: index < displayFiles.length - 1 ? 1 : 0,
              borderColor: 'divider',
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <AudioFileIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {file.name}
                  </Typography>
                  <Chip
                    label={file.extension.toUpperCase().substring(1)}
                    size="small"
                    color={getExtensionColor(file.extension)}
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
      
      {files.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No audio files found
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AudioFileList;