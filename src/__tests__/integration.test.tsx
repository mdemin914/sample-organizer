import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from '../App';
import { mockElectronAPI } from '../setupTests';
import { DirectoryStructure, AudioFile } from '../types';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('Integration Tests - Complete Workflow', () => {
  const mockDirectoryStructure: DirectoryStructure = {
    name: 'Sample Library',
    path: '/output/Sample Library',
    type: 'directory',
    children: [
      {
        name: 'Drums',
        path: '/output/Sample Library/Drums',
        type: 'directory',
        children: [
          {
            name: 'Kicks',
            path: '/output/Sample Library/Drums/Kicks',
            type: 'directory',
            children: []
          },
          {
            name: 'Snares',
            path: '/output/Sample Library/Drums/Snares',
            type: 'directory',
            children: []
          },
          {
            name: 'Hi-Hats',
            path: '/output/Sample Library/Drums/Hi-Hats',
            type: 'directory',
            children: [
              {
                name: 'Closed',
                path: '/output/Sample Library/Drums/Hi-Hats/Closed',
                type: 'directory',
                children: []
              }
            ]
          }
        ]
      },
      {
        name: 'Bass',
        path: '/output/Sample Library/Bass',
        type: 'directory',
        children: [
          {
            name: '808s',
            path: '/output/Sample Library/Bass/808s',
            type: 'directory',
            children: []
          }
        ]
      },
      {
        name: 'Leads',
        path: '/output/Sample Library/Leads',
        type: 'directory',
        children: []
      }
    ]
  };

  const mockAudioFiles: AudioFile[] = [
    {
      name: 'Kick_Drum_C_128BPM.wav',
      path: '/input/Kick_Drum_C_128BPM.wav',
      size: 1024000,
      extension: '.wav'
    },
    {
      name: 'Snare_Trap_Dry.wav',
      path: '/input/Snare_Trap_Dry.wav',
      size: 512000,
      extension: '.wav'
    },
    {
      name: 'Hi_Hat_Closed.wav',
      path: '/input/Hi_Hat_Closed.wav',
      size: 256000,
      extension: '.wav'
    },
    {
      name: 'Bass_808_Sub.wav',
      path: '/input/Bass_808_Sub.wav',
      size: 768000,
      extension: '.wav'
    },
    {
      name: 'Unknown_Sample.wav',
      path: '/input/Unknown_Sample.wav',
      size: 128000,
      extension: '.wav'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default successful responses
    mockElectronAPI.scanDirectory.mockResolvedValue(mockDirectoryStructure);
    mockElectronAPI.getAudioFiles.mockResolvedValue(mockAudioFiles);
    mockElectronAPI.copyFile.mockResolvedValue(true);
  });

  it('completes full workflow with automatic matching', async () => {
    mockElectronAPI.selectDirectory
      .mockResolvedValueOnce('/output/Sample Library')
      .mockResolvedValueOnce('/input/samples');

    renderWithTheme(<App />);

    // Step 1: Select output directory
    const outputButton = screen.getByText('Select Output Directory');
    fireEvent.click(outputButton);

    await waitFor(() => {
      expect(mockElectronAPI.selectDirectory).toHaveBeenCalledTimes(1);
      expect(mockElectronAPI.scanDirectory).toHaveBeenCalledWith('/output/Sample Library');
    });

    // Verify directory structure is displayed
    await waitFor(() => {
      expect(screen.getByText('Directory Structure:')).toBeInTheDocument();
      expect(screen.getByText('Sample Library')).toBeInTheDocument();
    });

    // Step 2: Select input directory
    const inputButton = screen.getByText('Select Input Directory');
    fireEvent.click(inputButton);

    await waitFor(() => {
      expect(mockElectronAPI.selectDirectory).toHaveBeenCalledTimes(2);
      expect(mockElectronAPI.getAudioFiles).toHaveBeenCalledWith('/input/samples');
    });

    // Verify audio files are displayed
    await waitFor(() => {
      expect(screen.getByText('Found 5 audio files:')).toBeInTheDocument();
      expect(screen.getByText('Kick_Drum_C_128BPM.wav')).toBeInTheDocument();
    });

    // Step 3: Start organizing
    const startButton = await screen.findByText('Start Organizing Samples');
    expect(startButton).not.toBeDisabled();
    fireEvent.click(startButton);

    // Verify matching progress is shown
    await waitFor(() => {
      expect(screen.getByText('Analyzing Audio Files')).toBeInTheDocument();
      expect(screen.getByText('Matching 5 files with your folder structure...')).toBeInTheDocument();
    });

    // Wait for automatic matching to complete and files to be organized
    await waitFor(() => {
      expect(screen.getByText('Organizing Files...')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('🎉 Organization Complete!')).toBeInTheDocument();
      expect(screen.getByText('Your samples have been successfully organized.')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify files were copied
    expect(mockElectronAPI.copyFile).toHaveBeenCalledTimes(4); // 4 files should be auto-matched
  }, 10000);

  it('handles workflow with manual assignment', async () => {
    // Mock scenario where some files need manual assignment
    const mixedAudioFiles: AudioFile[] = [
      {
        name: 'kick.wav',
        path: '/input/kick.wav',
        size: 1024000,
        extension: '.wav'
      },
      {
        name: 'unknown_sample_001.wav',
        path: '/input/unknown_sample_001.wav',
        size: 512000,
        extension: '.wav'
      }
    ];

    mockElectronAPI.getAudioFiles.mockResolvedValue(mixedAudioFiles);
    mockElectronAPI.selectDirectory
      .mockResolvedValueOnce('/output/Sample Library')
      .mockResolvedValueOnce('/input/samples');

    renderWithTheme(<App />);

    // Select directories
    fireEvent.click(screen.getByText('Select Output Directory'));
    await waitFor(() => expect(mockElectronAPI.scanDirectory).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Select Input Directory'));
    await waitFor(() => expect(mockElectronAPI.getAudioFiles).toHaveBeenCalled());

    // Start organizing
    const startButton = await screen.findByText('Start Organizing Samples');
    fireEvent.click(startButton);

    // Should show matching progress
    await waitFor(() => {
      expect(screen.getByText('Analyzing Audio Files')).toBeInTheDocument();
    });

    // Should show manual assignment screen for unmatched files
    await waitFor(() => {
      expect(screen.getByText('Manual File Assignment')).toBeInTheDocument();
      expect(screen.getByText('Some files couldn\'t be matched automatically.')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Find and assign the unknown file
    await waitFor(() => {
      expect(screen.getByText('unknown_sample_001.wav')).toBeInTheDocument();
    });

    // Select a folder for the unmatched file
    const selectElement = screen.getByLabelText('Assign to folder');
    fireEvent.mouseDown(selectElement);
    
    const kicksOption = await screen.findByText('Drums → Kicks');
    fireEvent.click(kicksOption);

    // Continue with organization
    await waitFor(() => {
      const continueButton = screen.getByText('Continue with Organization');
      expect(continueButton).not.toBeDisabled();
      fireEvent.click(continueButton);
    });

    // Should complete organization
    await waitFor(() => {
      expect(screen.getByText('🎉 Organization Complete!')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(mockElectronAPI.copyFile).toHaveBeenCalledTimes(2);
  }, 15000);

  it('handles errors during the workflow', async () => {
    mockElectronAPI.selectDirectory
      .mockResolvedValueOnce('/output/Sample Library')
      .mockResolvedValueOnce('/input/samples');
    
    // Mock a copy error
    mockElectronAPI.copyFile.mockRejectedValue(new Error('Disk full'));

    renderWithTheme(<App />);

    // Select directories
    fireEvent.click(screen.getByText('Select Output Directory'));
    await waitFor(() => expect(mockElectronAPI.scanDirectory).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Select Input Directory'));
    await waitFor(() => expect(mockElectronAPI.getAudioFiles).toHaveBeenCalled());

    // Start organizing
    const startButton = await screen.findByText('Start Organizing Samples');
    fireEvent.click(startButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/Failed to organize files/)).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 10000);

  it('allows restarting the workflow after completion', async () => {
    mockElectronAPI.selectDirectory
      .mockResolvedValueOnce('/output/Sample Library')
      .mockResolvedValueOnce('/input/samples')
      .mockResolvedValueOnce('/output/New Library')
      .mockResolvedValueOnce('/input/new_samples');

    renderWithTheme(<App />);

    // Complete first workflow
    fireEvent.click(screen.getByText('Select Output Directory'));
    await waitFor(() => expect(mockElectronAPI.scanDirectory).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Select Input Directory'));
    await waitFor(() => expect(mockElectronAPI.getAudioFiles).toHaveBeenCalled());

    const startButton = await screen.findByText('Start Organizing Samples');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('🎉 Organization Complete!')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Restart workflow
    const restartButton = screen.getByText('Organize More Samples');
    fireEvent.click(restButton);

    // Should be back to initial state
    expect(screen.getByText('Select Output Directory')).toBeInTheDocument();
    expect(screen.getByText('Select Input Directory')).toBeInTheDocument();

    // Should be able to start new workflow
    fireEvent.click(screen.getByText('Select Output Directory'));
    await waitFor(() => {
      expect(mockElectronAPI.selectDirectory).toHaveBeenCalledTimes(3);
    });

    fireEvent.click(screen.getByText('Select Input Directory'));
    await waitFor(() => {
      expect(mockElectronAPI.selectDirectory).toHaveBeenCalledTimes(4);
    });
  }, 15000);

  it('handles empty directories gracefully', async () => {
    const emptyStructure: DirectoryStructure = {
      name: 'Empty Library',
      path: '/output/Empty Library',
      type: 'directory',
      children: []
    };

    mockElectronAPI.scanDirectory.mockResolvedValue(emptyStructure);
    mockElectronAPI.getAudioFiles.mockResolvedValue([]);
    mockElectronAPI.selectDirectory
      .mockResolvedValueOnce('/output/Empty Library')
      .mockResolvedValueOnce('/input/empty');

    renderWithTheme(<App />);

    // Select directories
    fireEvent.click(screen.getByText('Select Output Directory'));
    await waitFor(() => expect(mockElectronAPI.scanDirectory).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Select Input Directory'));
    await waitFor(() => expect(mockElectronAPI.getAudioFiles).toHaveBeenCalled());

    // Should show empty states
    await waitFor(() => {
      expect(screen.getByText('Empty Library')).toBeInTheDocument();
      expect(screen.getByText('Found 0 audio files:')).toBeInTheDocument();
    });

    // Start button should be disabled
    const startButton = screen.getByText('Start Organizing Samples');
    expect(startButton).toBeDisabled();
  });

  it('preserves file information throughout the workflow', async () => {
    const detailedFiles: AudioFile[] = [
      {
        name: 'Kick_C_128BPM.wav',
        path: '/input/detailed/Kick_C_128BPM.wav',
        size: 2048000, // 2MB
        extension: '.wav'
      }
    ];

    mockElectronAPI.getAudioFiles.mockResolvedValue(detailedFiles);
    mockElectronAPI.selectDirectory
      .mockResolvedValueOnce('/output/Sample Library')
      .mockResolvedValueOnce('/input/detailed');

    renderWithTheme(<App />);

    // Select directories
    fireEvent.click(screen.getByText('Select Output Directory'));
    await waitFor(() => expect(mockElectronAPI.scanDirectory).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Select Input Directory'));
    await waitFor(() => expect(mockElectronAPI.getAudioFiles).toHaveBeenCalled());

    // Verify file details are displayed
    await waitFor(() => {
      expect(screen.getByText('Kick_C_128BPM.wav')).toBeInTheDocument();
      expect(screen.getByText('2.0 MB')).toBeInTheDocument();
      expect(screen.getByText('WAV')).toBeInTheDocument();
    });

    // Start organizing
    const startButton = await screen.findByText('Start Organizing Samples');
    fireEvent.click(startButton);

    // Verify file details are preserved in matching progress
    await waitFor(() => {
      expect(screen.getByText('Kick_C_128BPM.wav')).toBeInTheDocument();
    });

    // Complete workflow
    await waitFor(() => {
      expect(screen.getByText('🎉 Organization Complete!')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify correct file path was used for copying
    expect(mockElectronAPI.copyFile).toHaveBeenCalledWith(
      '/input/detailed/Kick_C_128BPM.wav',
      expect.stringContaining('Kicks/Kick_C_128BPM.wav')
    );
  }, 10000);

  it('handles user cancellation during directory selection', async () => {
    mockElectronAPI.selectDirectory.mockResolvedValue(null);

    renderWithTheme(<App />);

    // Try to select output directory but cancel
    fireEvent.click(screen.getByText('Select Output Directory'));

    await waitFor(() => {
      expect(mockElectronAPI.selectDirectory).toHaveBeenCalledTimes(1);
    });

    // Should remain in initial state
    expect(screen.getByText('Select Output Directory')).toBeInTheDocument();
    expect(screen.queryByText('Directory Structure:')).not.toBeInTheDocument();
    
    // Start button should remain disabled
    const startButton = screen.getByText('Start Organizing Samples');
    expect(startButton).toBeDisabled();
  });
});