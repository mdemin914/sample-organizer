import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AudioFileList from '../AudioFileList';
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

describe('AudioFileList', () => {
  const mockAudioFiles: AudioFile[] = [
    {
      name: 'Kick_Drum.wav',
      path: '/path/Kick_Drum.wav',
      size: 1024000, // 1MB
      extension: '.wav'
    },
    {
      name: 'Snare_Hit.mp3',
      path: '/path/Snare_Hit.mp3',
      size: 512000, // 512KB
      extension: '.mp3'
    },
    {
      name: 'Hi_Hat.flac',
      path: '/path/Hi_Hat.flac',
      size: 2048000, // 2MB
      extension: '.flac'
    },
    {
      name: 'Bass_Line.m4a',
      path: '/path/Bass_Line.m4a',
      size: 768000, // 768KB
      extension: '.m4a'
    },
    {
      name: 'Lead_Synth.aiff',
      path: '/path/Lead_Synth.aiff',
      size: 1536000, // 1.5MB
      extension: '.aiff'
    }
  ];

  it('renders audio files list', () => {
    renderWithTheme(<AudioFileList files={mockAudioFiles} />);
    
    expect(screen.getByText('Kick_Drum.wav')).toBeInTheDocument();
    expect(screen.getByText('Snare_Hit.mp3')).toBeInTheDocument();
    expect(screen.getByText('Hi_Hat.flac')).toBeInTheDocument();
  });

  it('displays file extensions as colored chips', () => {
    renderWithTheme(<AudioFileList files={mockAudioFiles} />);
    
    expect(screen.getByText('WAV')).toBeInTheDocument();
    expect(screen.getByText('MP3')).toBeInTheDocument();
    expect(screen.getByText('FLAC')).toBeInTheDocument();
    expect(screen.getByText('M4A')).toBeInTheDocument();
    expect(screen.getByText('AIFF')).toBeInTheDocument();
  });

  it('formats file sizes correctly', () => {
    renderWithTheme(<AudioFileList files={mockAudioFiles} />);
    
    expect(screen.getByText('1.0 MB')).toBeInTheDocument(); // 1024000 bytes
    expect(screen.getByText('512.0 KB')).toBeInTheDocument(); // 512000 bytes
    expect(screen.getByText('2.0 MB')).toBeInTheDocument(); // 2048000 bytes
    expect(screen.getByText('750.0 KB')).toBeInTheDocument(); // 768000 bytes
    expect(screen.getByText('1.5 MB')).toBeInTheDocument(); // 1536000 bytes
  });

  it('handles zero byte files', () => {
    const zeroByteFile: AudioFile = {
      name: 'empty.wav',
      path: '/path/empty.wav',
      size: 0,
      extension: '.wav'
    };

    renderWithTheme(<AudioFileList files={[zeroByteFile]} />);
    
    expect(screen.getByText('empty.wav')).toBeInTheDocument();
    expect(screen.getByText('0 B')).toBeInTheDocument();
  });

  it('respects maxItems prop', () => {
    renderWithTheme(<AudioFileList files={mockAudioFiles} maxItems={3} />);
    
    // Should show first 3 files
    expect(screen.getByText('Kick_Drum.wav')).toBeInTheDocument();
    expect(screen.getByText('Snare_Hit.mp3')).toBeInTheDocument();
    expect(screen.getByText('Hi_Hat.flac')).toBeInTheDocument();
    
    // Should not show the 4th and 5th files
    expect(screen.queryByText('Bass_Line.m4a')).not.toBeInTheDocument();
    expect(screen.queryByText('Lead_Synth.aiff')).not.toBeInTheDocument();
  });

  it('displays empty state when no files provided', () => {
    renderWithTheme(<AudioFileList files={[]} />);
    
    expect(screen.getByText('No audio files found')).toBeInTheDocument();
  });

  it('handles very large file sizes', () => {
    const largeFile: AudioFile = {
      name: 'large_sample.wav',
      path: '/path/large_sample.wav',
      size: 1073741824, // 1GB
      extension: '.wav'
    };

    renderWithTheme(<AudioFileList files={[largeFile]} />);
    
    expect(screen.getByText('large_sample.wav')).toBeInTheDocument();
    expect(screen.getByText('1.0 GB')).toBeInTheDocument();
  });

  it('handles small file sizes in bytes', () => {
    const smallFile: AudioFile = {
      name: 'tiny.wav',
      path: '/path/tiny.wav',
      size: 500, // 500 bytes
      extension: '.wav'
    };

    renderWithTheme(<AudioFileList files={[smallFile]} />);
    
    expect(screen.getByText('tiny.wav')).toBeInTheDocument();
    expect(screen.getByText('500 B')).toBeInTheDocument();
  });

  it('uses correct color for different file extensions', () => {
    renderWithTheme(<AudioFileList files={mockAudioFiles} />);
    
    // Check that chips are rendered (exact color testing would require more complex setup)
    const wavChip = screen.getByText('WAV');
    const mp3Chip = screen.getByText('MP3');
    const flacChip = screen.getByText('FLAC');
    
    expect(wavChip).toHaveClass('MuiChip-root');
    expect(mp3Chip).toHaveClass('MuiChip-root');
    expect(flacChip).toHaveClass('MuiChip-root');
  });

  it('displays audio file icons', () => {
    renderWithTheme(<AudioFileList files={mockAudioFiles.slice(0, 2)} />);
    
    // Check for audio file icons (rendered as SVG elements)
    const audioIcons = document.querySelectorAll('[data-testid="AudioFileIcon"]');
    expect(audioIcons.length).toBeGreaterThan(0);
  });

  it('handles files with unusual extensions', () => {
    const unusualFile: AudioFile = {
      name: 'sample.ogg',
      path: '/path/sample.ogg',
      size: 1024000,
      extension: '.ogg'
    };

    renderWithTheme(<AudioFileList files={[unusualFile]} />);
    
    expect(screen.getByText('sample.ogg')).toBeInTheDocument();
    expect(screen.getByText('OGG')).toBeInTheDocument();
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
  });

  it('handles very long file names', () => {
    const longNameFile: AudioFile = {
      name: 'This_is_a_very_long_file_name_that_might_cause_layout_issues_in_the_UI_component.wav',
      path: '/path/This_is_a_very_long_file_name_that_might_cause_layout_issues_in_the_UI_component.wav',
      size: 1024000,
      extension: '.wav'
    };

    renderWithTheme(<AudioFileList files={[longNameFile]} />);
    
    expect(screen.getByText('This_is_a_very_long_file_name_that_might_cause_layout_issues_in_the_UI_component.wav')).toBeInTheDocument();
  });

  it('maintains proper list structure', () => {
    renderWithTheme(<AudioFileList files={mockAudioFiles.slice(0, 3)} />);
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });
});