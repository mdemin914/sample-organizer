import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MatchingProgress from '../MatchingProgress';
import { AudioFile } from '../../types';

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

describe('MatchingProgress', () => {
  const mockAudioFiles: AudioFile[] = [
    {
      name: 'Kick_Drum.wav',
      path: '/path/Kick_Drum.wav',
      size: 1024000,
      extension: '.wav'
    },
    {
      name: 'Snare_Hit.mp3',
      path: '/path/Snare_Hit.mp3',
      size: 512000,
      extension: '.mp3'
    },
    {
      name: 'Hi_Hat.flac',
      path: '/path/Hi_Hat.flac',
      size: 2048000,
      extension: '.flac'
    }
  ];

  it('renders the matching progress screen', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={mockAudioFiles} isMatching={true} />
    );

    expect(screen.getByText('Analyzing Audio Files')).toBeInTheDocument();
    expect(screen.getByText('Matching 3 files with your folder structure...')).toBeInTheDocument();
  });

  it('shows progress bar when matching is active', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={mockAudioFiles} isMatching={true} />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('This may take a few moments...')).toBeInTheDocument();
  });

  it('hides progress bar when not matching', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={mockAudioFiles} isMatching={false} />
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('This may take a few moments...')).not.toBeInTheDocument();
  });

  it('displays the correct number of files being processed', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={mockAudioFiles} isMatching={true} />
    );

    expect(screen.getByText('Matching 3 files with your folder structure...')).toBeInTheDocument();
  });

  it('shows list of files being processed', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={mockAudioFiles} isMatching={true} />
    );

    expect(screen.getByText('Files being processed:')).toBeInTheDocument();
    expect(screen.getByText('Kick_Drum.wav')).toBeInTheDocument();
    expect(screen.getByText('Snare_Hit.mp3')).toBeInTheDocument();
    expect(screen.getByText('Hi_Hat.flac')).toBeInTheDocument();
  });

  it('displays file extensions in the list', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={mockAudioFiles} isMatching={true} />
    );

    expect(screen.getByText('.WAV')).toBeInTheDocument();
    expect(screen.getByText('.MP3')).toBeInTheDocument();
    expect(screen.getByText('.FLAC')).toBeInTheDocument();
  });

  it('limits display to first 20 files', () => {
    const manyFiles: AudioFile[] = Array.from({ length: 25 }, (_, i) => ({
      name: `file_${i + 1}.wav`,
      path: `/path/file_${i + 1}.wav`,
      size: 1024000,
      extension: '.wav'
    }));

    renderWithTheme(
      <MatchingProgress audioFiles={manyFiles} isMatching={true} />
    );

    expect(screen.getByText('Matching 25 files with your folder structure...')).toBeInTheDocument();
    expect(screen.getByText('file_1.wav')).toBeInTheDocument();
    expect(screen.getByText('file_20.wav')).toBeInTheDocument();
    expect(screen.queryByText('file_21.wav')).not.toBeInTheDocument();
    expect(screen.getByText('...and 5 more files')).toBeInTheDocument();
  });

  it('shows explanation of how matching works', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={mockAudioFiles} isMatching={true} />
    );

    expect(screen.getByText('How matching works:')).toBeInTheDocument();
    expect(screen.getByText(/The app analyzes file names and compares them with your folder structure/)).toBeInTheDocument();
    expect(screen.getByText(/It looks for keywords like "kick", "snare", "hi-hat", "crash"/)).toBeInTheDocument();
    expect(screen.getByText(/Files with low confidence matches will be presented for manual assignment/)).toBeInTheDocument();
  });

  it('displays search icon', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={mockAudioFiles} isMatching={true} />
    );

    // Check for search icon (rendered as SVG element)
    const searchIcons = document.querySelectorAll('[data-testid="SearchIcon"]');
    expect(searchIcons.length).toBeGreaterThan(0);
  });

  it('displays audio file icons in the list', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={mockAudioFiles} isMatching={true} />
    );

    // Check for audio file icons (rendered as SVG elements)
    const audioIcons = document.querySelectorAll('[data-testid="AudioFileIcon"]');
    expect(audioIcons.length).toBeGreaterThan(0);
  });

  it('handles empty file list', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={[]} isMatching={true} />
    );

    expect(screen.getByText('Matching 0 files with your folder structure...')).toBeInTheDocument();
    expect(screen.getByText('Files being processed:')).toBeInTheDocument();
    expect(screen.queryByText('...and')).not.toBeInTheDocument();
  });

  it('handles single file', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={[mockAudioFiles[0]]} isMatching={true} />
    );

    expect(screen.getByText('Matching 1 files with your folder structure...')).toBeInTheDocument();
    expect(screen.getByText('Kick_Drum.wav')).toBeInTheDocument();
    expect(screen.queryByText('...and')).not.toBeInTheDocument();
  });

  it('applies proper styling to the container', () => {
    renderWithTheme(
      <MatchingProgress audioFiles={mockAudioFiles} isMatching={true} />
    );

    const mainContainer = screen.getByText('Analyzing Audio Files').closest('div');
    expect(mainContainer).toHaveClass('MuiPaper-root');
  });

  it('shows correct file count in "more files" message', () => {
    const manyFiles: AudioFile[] = Array.from({ length: 30 }, (_, i) => ({
      name: `file_${i + 1}.wav`,
      path: `/path/file_${i + 1}.wav`,
      size: 1024000,
      extension: '.wav'
    }));

    renderWithTheme(
      <MatchingProgress audioFiles={manyFiles} isMatching={true} />
    );

    expect(screen.getByText('...and 10 more files')).toBeInTheDocument();
  });

  it('handles files with different extensions correctly', () => {
    const mixedFiles: AudioFile[] = [
      { name: 'file1.wav', path: '/path/file1.wav', size: 1000, extension: '.wav' },
      { name: 'file2.mp3', path: '/path/file2.mp3', size: 1000, extension: '.mp3' },
      { name: 'file3.flac', path: '/path/file3.flac', size: 1000, extension: '.flac' },
      { name: 'file4.aiff', path: '/path/file4.aiff', size: 1000, extension: '.aiff' },
      { name: 'file5.m4a', path: '/path/file5.m4a', size: 1000, extension: '.m4a' }
    ];

    renderWithTheme(
      <MatchingProgress audioFiles={mixedFiles} isMatching={true} />
    );

    expect(screen.getByText('.WAV')).toBeInTheDocument();
    expect(screen.getByText('.MP3')).toBeInTheDocument();
    expect(screen.getByText('.FLAC')).toBeInTheDocument();
    expect(screen.getByText('.AIFF')).toBeInTheDocument();
    expect(screen.getByText('.M4A')).toBeInTheDocument();
  });
});