import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  AudioFile as AudioFileIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DirectoryStructure, MatchResult } from '../types';

interface ManualAssignmentProps {
  matchResults: MatchResult[];
  outputStructure: DirectoryStructure;
  onComplete: (updatedResults: MatchResult[]) => void;
}

const ManualAssignment: React.FC<ManualAssignmentProps> = ({
  matchResults,
  outputStructure,
  onComplete,
}) => {
  const [updatedResults, setUpdatedResults] = useState<MatchResult[]>(matchResults);
  
  // Get all available folders as a flat list
  const getAllFolders = (structure: DirectoryStructure, basePath: string = ''): Array<{path: string, name: string}> => {
    const folders: Array<{path: string, name: string}> = [];
    
    if (structure.type === 'directory') {
      const currentPath = basePath ? `${basePath}/${structure.name}` : structure.name;
      folders.push({ path: structure.path, name: currentPath });
      
      for (const child of structure.children) {
        folders.push(...getAllFolders(child, currentPath));
      }
    }
    
    return folders;
  };

  const availableFolders = getAllFolders(outputStructure);
  const unmatchedFiles = updatedResults.filter(r => !r.matched || r.confidence < 0.8);
  const processedCount = updatedResults.filter(r => r.matched && r.confidence >= 0.8).length;
  const totalCount = updatedResults.length;

  const handleFolderAssignment = (fileIndex: number, folderPath: string, folderName: string) => {
    const newResults = [...updatedResults];
    const resultIndex = updatedResults.findIndex(r => r === unmatchedFiles[fileIndex]);
    
    if (resultIndex !== -1) {
      newResults[resultIndex] = {
        ...newResults[resultIndex],
        matched: true,
        destinationPath: `${folderPath}/${newResults[resultIndex].file.name}`,
        destinationFolder: folderName,
        confidence: 1.0,
        reasons: ['Manually assigned by user'],
      };
      setUpdatedResults(newResults);
    }
  };

  const handleSkipFile = (fileIndex: number) => {
    const newResults = [...updatedResults];
    const resultIndex = updatedResults.findIndex(r => r === unmatchedFiles[fileIndex]);
    
    if (resultIndex !== -1) {
      newResults[resultIndex] = {
        ...newResults[resultIndex],
        matched: false,
        confidence: 0,
        reasons: ['Skipped by user'],
      };
      setUpdatedResults(newResults);
    }
  };

  const handleComplete = () => {
    onComplete(updatedResults);
  };

  const currentUnmatchedFiles = updatedResults.filter(r => !r.matched || r.confidence < 0.8);
  const progress = ((totalCount - currentUnmatchedFiles.length) / totalCount) * 100;

  return (
    <Box sx={{ py: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Manual File Assignment
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Some files couldn't be matched automatically. Please assign them to folders or skip them.
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              Progress: {totalCount - currentUnmatchedFiles.length} of {totalCount} files processed
            </Typography>
            <Typography variant="body2" color="primary">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        {currentUnmatchedFiles.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              All files have been processed!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleComplete}
              sx={{ mt: 2 }}
            >
              Continue with Organization
            </Button>
          </Box>
        )}
      </Paper>

      {currentUnmatchedFiles.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Files requiring manual assignment ({currentUnmatchedFiles.length} remaining):
          </Typography>
          
          <List>
            {currentUnmatchedFiles.map((result, index) => (
              <Box key={`${result.file.path}-${index}`}>
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon>
                    <AudioFileIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {result.file.name}
                        </Typography>
                        {result.confidence > 0 && result.confidence < 0.8 && (
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={`Low confidence: ${Math.round(result.confidence * 100)}%`}
                              color="warning"
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            {result.destinationFolder && (
                              <Chip
                                label={`Suggested: ${result.destinationFolder}`}
                                variant="outlined"
                                size="small"
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                          <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Assign to folder</InputLabel>
                            <Select
                              label="Assign to folder"
                              onChange={(e) => {
                                const selectedFolder = availableFolders.find(f => f.path === e.target.value);
                                if (selectedFolder) {
                                  handleFolderAssignment(
                                    updatedResults.findIndex(r => r === result),
                                    selectedFolder.path,
                                    selectedFolder.name
                                  );
                                }
                              }}
                            >
                              {availableFolders.map((folder) => (
                                <MenuItem key={folder.path} value={folder.path}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FolderIcon fontSize="small" />
                                    {folder.name}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() => handleSkipFile(updatedResults.findIndex(r => r === result))}
                          >
                            Skip File
                          </Button>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < currentUnmatchedFiles.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={handleComplete}
              disabled={currentUnmatchedFiles.length > 0}
            >
              Continue with Organization
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ManualAssignment;