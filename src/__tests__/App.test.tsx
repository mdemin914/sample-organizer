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

describe('App', () => {
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
          }
        ]
      }
    ]
  };

  const mockAudioFiles: AudioFile[] = [
    {
      name: 'kick.wav',
      path: '/input/kick.wav',
      size: 1024000,
      extension: '.wav'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main title and description', () => {
    renderWithTheme(<App />);
    
    expect(screen.getByText('🎵 Sample Organizer')).toBeInTheDocument();
    expect(screen.getByText('Intelligently organize your musical samples into structured folders')).toBeInTheDocument();
  });

  it('renders directory selectors', () => {
    renderWithTheme(<App />);
    
    expect(screen.getByText('Output Directory')).toBeInTheDocument();
    expect(screen.getByText('Input Directory')).toBeInTheDocument();
    expect(screen.getByText('Select Output Directory')).toBeInTheDocument();
    expect(screen.getByText('Select Input Directory')).toBeInTheDocument();
  });

  it('shows start organizing button when both directories are selected', async () => {
    mockElectronAPI.scanDirectory.mockResolvedValue(mockDirectoryStructure);
    mockElectronAPI.getAudioFiles.mockResolvedValue(mockAudioFiles);

    renderWithTheme(<App />);
    
    // Initially, button should be disabled
    const startButton = screen.getByText('Start Organizing Samples');
    expect(startButton).toBeDisabled();

    // Mock selecting output directory
    mockElectronAPI.selectDirectory.mockResolvedValueOnce('/output/path');
    const outputButton = screen.getByText('Select Output Directory');
    fireEvent.click(outputButton);

    await waitFor(() => {
      expect(mockElectronAPI.scanDirectory).toHaveBeenCalledWith('/output/path');
    });

    // Mock selecting input directory
    mockElectronAPI.selectDirectory.mockResolvedValueOnce('/input/path');
    const inputButton = screen.getByText('Select Input Directory');
    fireEvent.click(inputButton);

    await waitFor(() => {
      expect(mockElectronAPI.getAudioFiles).toHaveBeenCalledWith('/input/path');
    });

    // Button should now be enabled
    await waitFor(() => {
      expect(startButton).not.toBeDisabled();
    });
  });

  it('displays directory structure after output directory is selected', async () => {
    mockElectronAPI.scanDirectory.mockResolvedValue(mockDirectoryStructure);
    mockElectronAPI.selectDirectory.mockResolvedValue('/output/path');

    renderWithTheme(<App />);
    
    const outputButton = screen.getByText('Select Output Directory');
    fireEvent.click(outputButton);

    await waitFor(() => {
      expect(screen.getByText('Directory Structure:')).toBeInTheDocument();
      expect(screen.getByText('Sample Library')).toBeInTheDocument();
    });
  });

  it('displays audio files after input directory is selected', async () => {
    mockElectronAPI.getAudioFiles.mockResolvedValue(mockAudioFiles);
    mockElectronAPI.selectDirectory.mockResolvedValue('/input/path');

    renderWithTheme(<App />);
    
    const inputButton = screen.getByText('Select Input Directory');
    fireEvent.click(inputButton);

    await waitFor(() => {
      expect(screen.getByText('Found 1 audio files:')).toBeInTheDocument();
      expect(screen.getByText('kick.wav')).toBeInTheDocument();
    });
  });

  it('shows scanning indicator when scanning directories', async () => {
    mockElectronAPI.scanDirectory.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockDirectoryStructure), 100)));
    mockElectronAPI.selectDirectory.mockResolvedValue('/output/path');

    renderWithTheme(<App />);
    
    const outputButton = screen.getByText('Select Output Directory');
    fireEvent.click(outputButton);

    // Should show scanning indicator
    expect(screen.getByText('Scanning directory structure...')).toBeInTheDocument();

    // Wait for scanning to complete
    await waitFor(() => {
      expect(screen.queryByText('Scanning directory structure...')).not.toBeInTheDocument();
    });
  });

  it('displays error messages when operations fail', async () => {
    mockElectronAPI.scanDirectory.mockRejectedValue(new Error('Permission denied'));
    mockElectronAPI.selectDirectory.mockResolvedValue('/output/path');

    renderWithTheme(<App />);
    
    const outputButton = screen.getByText('Select Output Directory');
    fireEvent.click(outputButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to scan output directory/)).toBeInTheDocument();
    });
  });

  it('shows matching progress when organizing starts', async () => {
    // Setup successful directory and file selection
    mockElectronAPI.scanDirectory.mockResolvedValue(mockDirectoryStructure);
    mockElectronAPI.getAudioFiles.mockResolvedValue(mockAudioFiles);
    mockElectronAPI.selectDirectory
      .mockResolvedValueOnce('/output/path')
      .mockResolvedValueOnce('/input/path');

    renderWithTheme(<App />);
    
    // Select directories
    fireEvent.click(screen.getByText('Select Output Directory'));
    await waitFor(() => expect(mockElectronAPI.scanDirectory).toHaveBeenCalled());
    
    fireEvent.click(screen.getByText('Select Input Directory'));
    await waitFor(() => expect(mockElectronAPI.getAudioFiles).toHaveBeenCalled());
    
    // Start organizing
    const startButton = await screen.findByText('Start Organizing Samples');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Analyzing Audio Files')).toBeInTheDocument();
    });
  });

  it('handles file copying operations', async () => {
    mockElectronAPI.copyFile.mockResolvedValue(true);
    mockElectronAPI.scanDirectory.mockResolvedValue(mockDirectoryStructure);
    mockElectronAPI.getAudioFiles.mockResolvedValue(mockAudioFiles);
    mockElectronAPI.selectDirectory
      .mockResolvedValueOnce('/output/path')
      .mockResolvedValueOnce('/input/path');

    renderWithTheme(<App />);
    
    // Select directories and start organizing
    fireEvent.click(screen.getByText('Select Output Directory'));
    await waitFor(() => expect(mockElectronAPI.scanDirectory).toHaveBeenCalled());
    
    fireEvent.click(screen.getByText('Select Input Directory'));
    await waitFor(() => expect(mockElectronAPI.getAudioFiles).toHaveBeenCalled());
    
    const startButton = await screen.findByText('Start Organizing Samples');
    fireEvent.click(startButton);

    // Should eventually show completion
    await waitFor(() => {
      expect(screen.getByText('🎉 Organization Complete!')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('allows restarting the process after completion', async () => {
    mockElectronAPI.copyFile.mockResolvedValue(true);
    mockElectronAPI.scanDirectory.mockResolvedValue(mockDirectoryStructure);
    mockElectronAPI.getAudioFiles.mockResolvedValue(mockAudioFiles);
    mockElectronAPI.selectDirectory
      .mockResolvedValueOnce('/output/path')
      .mockResolvedValueOnce('/input/path');

    renderWithTheme(<App />);
    
    // Go through the complete process
    fireEvent.click(screen.getByText('Select Output Directory'));
    await waitFor(() => expect(mockElectronAPI.scanDirectory).toHaveBeenCalled());
    
    fireEvent.click(screen.getByText('Select Input Directory'));
    await waitFor(() => expect(mockElectronAPI.getAudioFiles).toHaveBeenCalled());
    
    const startButton = await screen.findByText('Start Organizing Samples');
    fireEvent.click(startButton);

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('🎉 Organization Complete!')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Click restart button
    const restartButton = screen.getByText('Organize More Samples');
    fireEvent.click(restartButton);

    // Should be back to initial state
    expect(screen.getByText('Select Output Directory')).toBeInTheDocument();
    expect(screen.getByText('Select Input Directory')).toBeInTheDocument();
  });

  it('dismisses error messages when close button is clicked', async () => {
    mockElectronAPI.scanDirectory.mockRejectedValue(new Error('Test error'));
    mockElectronAPI.selectDirectory.mockResolvedValue('/output/path');

    renderWithTheme(<App />);
    
    const outputButton = screen.getByText('Select Output Directory');
    fireEvent.click(outputButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to scan output directory/)).toBeInTheDocument();
    });

    // Find and click the close button on the alert
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText(/Failed to scan output directory/)).not.toBeInTheDocument();
  });

  it('shows correct file count when more than 10 files are found', async () => {
    const manyFiles: AudioFile[] = Array.from({ length: 15 }, (_, i) => ({
      name: `file_${i + 1}.wav`,
      path: `/input/file_${i + 1}.wav`,
      size: 1024000,
      extension: '.wav'
    }));

    mockElectronAPI.getAudioFiles.mockResolvedValue(manyFiles);
    mockElectronAPI.selectDirectory.mockResolvedValue('/input/path');

    renderWithTheme(<App />);
    
    const inputButton = screen.getByText('Select Input Directory');
    fireEvent.click(inputButton);

    await waitFor(() => {
      expect(screen.getByText('Found 15 audio files:')).toBeInTheDocument();
      expect(screen.getByText('...and 5 more files')).toBeInTheDocument();
    });
  });
});