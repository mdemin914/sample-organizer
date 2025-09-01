import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  AudioFile as AudioFileIcon,
} from '@mui/icons-material';
import { AudioFile } from '../types';

interface MatchingProgressProps {
  audioFiles: AudioFile[];
  isMatching: boolean;
}

const MatchingProgress: React.FC<MatchingProgressProps> = ({
  audioFiles,
  isMatching,
}) => {
  return (
    <Box sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <SearchIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Analyzing Audio Files
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Matching {audioFiles.length} files with your folder structure...
          </Typography>
          
          {isMatching && (
            <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
              <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This may take a few moments...
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Files being processed:
          </Typography>
          <Box
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <List dense>
              {audioFiles.slice(0, 20).map((file, index) => (
                <ListItem
                  key={`${file.path}-${index}`}
                  sx={{
                    borderBottom: index < Math.min(audioFiles.length, 20) - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AudioFileIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={file.extension.toUpperCase()}
                  />
                </ListItem>
              ))}
            </List>
            
            {audioFiles.length > 20 && (
              <Box sx={{ p: 2, textAlign: 'center', backgroundColor: 'action.hover' }}>
                <Typography variant="body2" color="text.secondary">
                  ...and {audioFiles.length - 20} more files
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.dark', borderRadius: 1 }}>
          <Typography variant="body2" color="info.light">
            <strong>How matching works:</strong> The app analyzes file names and compares them with your folder structure. 
            It looks for keywords like "kick", "snare", "hi-hat", "crash", etc., and matches them to appropriate folders. 
            Files with low confidence matches will be presented for manual assignment.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default MatchingProgress;