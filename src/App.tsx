import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  MusicNote as MusicNoteIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import DirectorySelector from './components/DirectorySelector';
import DirectoryTree from './components/DirectoryTree';
import AudioFileList from './components/AudioFileList';
import MatchingProgress from './components/MatchingProgress';
import ManualAssignment from './components/ManualAssignment';
import { DirectoryStructure, AudioFile, MatchResult } from './types';
import { matchAudioFiles } from './utils/fileMatcher';

function App() {
  const [outputDirectory, setOutputDirectory] = useState<string | null>(null);
  const [inputDirectory, setInputDirectory] = useState<string | null>(null);
  const [outputStructure, setOutputStructure] = useState<DirectoryStructure | null>(null);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'matching' | 'manual' | 'organizing' | 'complete'>('setup');
  const [error, setError] = useState<string | null>(null);

  const handleOutputDirectorySelect = useCallback(async (path: string) => {
    setOutputDirectory(path);
    setIsScanning(true);
    setError(null);
    
    try {
      const structure = await window.electronAPI.scanDirectory(path);
      setOutputStructure(structure);
    } catch (err) {
      setError('Failed to scan output directory: ' + (err as Error).message);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleInputDirectorySelect = useCallback(async (path: string) => {
    setInputDirectory(path);
    setIsScanning(true);
    setError(null);
    
    try {
      const files = await window.electronAPI.getAudioFiles(path);
      setAudioFiles(files);
    } catch (err) {
      setError('Failed to scan input directory: ' + (err as Error).message);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleStartMatching = useCallback(async () => {
    if (!outputStructure || audioFiles.length === 0) return;
    
    setIsMatching(true);
    setCurrentStep('matching');
    setError(null);
    
    try {
      const results = await matchAudioFiles(audioFiles, outputStructure);
      setMatchResults(results);
      
      // Check if there are any unmatched files
      const unmatchedFiles = results.filter(r => !r.matched || r.confidence < 0.8);
      if (unmatchedFiles.length > 0) {
        setCurrentStep('manual');
      } else {
        setCurrentStep('organizing');
        await organizeFiles(results);
      }
    } catch (err) {
      setError('Failed to match files: ' + (err as Error).message);
      setCurrentStep('setup');
    } finally {
      setIsMatching(false);
    }
  }, [outputStructure, audioFiles]);

  const organizeFiles = useCallback(async (results: MatchResult[]) => {
    setIsOrganizing(true);
    setError(null);
    
    try {
      for (const result of results) {
        if (result.matched && result.destinationPath) {
          await window.electronAPI.copyFile(result.file.path, result.destinationPath);
        }
      }
      setCurrentStep('complete');
    } catch (err) {
      setError('Failed to organize files: ' + (err as Error).message);
    } finally {
      setIsOrganizing(false);
    }
  }, []);

  const handleManualAssignmentComplete = useCallback(async (updatedResults: MatchResult[]) => {
    setMatchResults(updatedResults);
    setCurrentStep('organizing');
    await organizeFiles(updatedResults);
  }, [organizeFiles]);

  const canStartMatching = outputDirectory && inputDirectory && outputStructure && audioFiles.length > 0;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          🎵 Sample Organizer
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Intelligently organize your musical samples into structured folders
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {currentStep === 'setup' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FolderOpenIcon />
                Output Directory
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the directory where you want your samples organized. This should contain your folder structure (e.g., Drums → Cymbals → Hi-Hats).
              </Typography>
              <DirectorySelector
                onDirectorySelect={handleOutputDirectorySelect}
                selectedPath={outputDirectory}
                label="Select Output Directory"
              />
              {isScanning && outputDirectory && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Scanning directory structure...</Typography>
                </Box>
              )}
              {outputStructure && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Directory Structure:</Typography>
                  <DirectoryTree structure={outputStructure} maxDepth={3} />
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MusicNoteIcon />
                Input Directory
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the directory containing the audio samples you want to organize.
              </Typography>
              <DirectorySelector
                onDirectorySelect={handleInputDirectorySelect}
                selectedPath={inputDirectory}
                label="Select Input Directory"
              />
              {isScanning && inputDirectory && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Scanning for audio files...</Typography>
                </Box>
              )}
              {audioFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Found {audioFiles.length} audio files:
                  </Typography>
                  <AudioFileList files={audioFiles.slice(0, 10)} />
                  {audioFiles.length > 10 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      ...and {audioFiles.length - 10} more files
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartMatching}
                disabled={!canStartMatching || isScanning}
                sx={{ px: 4, py: 1.5 }}
              >
                Start Organizing Samples
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {currentStep === 'matching' && (
        <MatchingProgress
          audioFiles={audioFiles}
          isMatching={isMatching}
        />
      )}

      {currentStep === 'manual' && (
        <ManualAssignment
          matchResults={matchResults}
          outputStructure={outputStructure!}
          onComplete={handleManualAssignmentComplete}
        />
      )}

      {currentStep === 'organizing' && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Organizing Files...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Copying files to their destination folders
          </Typography>
        </Box>
      )}

      {currentStep === 'complete' && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="primary">
            🎉 Organization Complete!
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Your samples have been successfully organized.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setCurrentStep('setup');
              setMatchResults([]);
              setAudioFiles([]);
              setOutputStructure(null);
              setInputDirectory(null);
              setOutputDirectory(null);
            }}
          >
            Organize More Samples
          </Button>
        </Paper>
      )}
    </Container>
  );
}

export default App;