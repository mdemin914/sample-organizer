import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DirectorySelector from '../DirectorySelector';
import { mockElectronAPI } from '../../setupTests';

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

describe('DirectorySelector', () => {
  const mockOnDirectorySelect = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the select directory button', () => {
    renderWithTheme(
      <DirectorySelector
        onDirectorySelect={mockOnDirectorySelect}
        selectedPath={null}
        label="Select Directory"
      />
    );

    expect(screen.getByText('Select Directory')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls electronAPI.selectDirectory when button is clicked', async () => {
    mockElectronAPI.selectDirectory.mockResolvedValue('/test/path');

    renderWithTheme(
      <DirectorySelector
        onDirectorySelect={mockOnDirectorySelect}
        selectedPath={null}
        label="Select Directory"
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockElectronAPI.selectDirectory).toHaveBeenCalledTimes(1);
      expect(mockOnDirectorySelect).toHaveBeenCalledWith('/test/path');
    });
  });

  it('does not call onDirectorySelect when electronAPI returns null', async () => {
    mockElectronAPI.selectDirectory.mockResolvedValue(null);

    renderWithTheme(
      <DirectorySelector
        onDirectorySelect={mockOnDirectorySelect}
        selectedPath={null}
        label="Select Directory"
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockElectronAPI.selectDirectory).toHaveBeenCalledTimes(1);
      expect(mockOnDirectorySelect).not.toHaveBeenCalled();
    });
  });

  it('displays selected path when provided', () => {
    const selectedPath = '/home/user/music/samples';
    
    renderWithTheme(
      <DirectorySelector
        onDirectorySelect={mockOnDirectorySelect}
        selectedPath={selectedPath}
        label="Select Directory"
      />
    );

    expect(screen.getByText('Selected Directory:')).toBeInTheDocument();
    expect(screen.getByText(selectedPath)).toBeInTheDocument();
  });

  it('handles electronAPI errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockElectronAPI.selectDirectory.mockRejectedValue(new Error('Permission denied'));

    renderWithTheme(
      <DirectorySelector
        onDirectorySelect={mockOnDirectorySelect}
        selectedPath={null}
        label="Select Directory"
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockElectronAPI.selectDirectory).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalledWith('Failed to select directory:', expect.any(Error));
      expect(mockOnDirectorySelect).not.toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('renders with custom label', () => {
    const customLabel = 'Choose Output Folder';
    
    renderWithTheme(
      <DirectorySelector
        onDirectorySelect={mockOnDirectorySelect}
        selectedPath={null}
        label={customLabel}
      />
    );

    expect(screen.getByText(customLabel)).toBeInTheDocument();
  });

  it('shows success styling when path is selected', () => {
    renderWithTheme(
      <DirectorySelector
        onDirectorySelect={mockOnDirectorySelect}
        selectedPath="/test/path"
        label="Select Directory"
      />
    );

    const successPaper = screen.getByText('Selected Directory:').closest('div');
    expect(successPaper).toHaveClass('MuiPaper-root');
  });
});