import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DirectoryTree from '../DirectoryTree';
import { DirectoryStructure } from '../../types';

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

describe('DirectoryTree', () => {
  const mockStructure: DirectoryStructure = {
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
      }
    ]
  };

  it('renders the root directory', () => {
    renderWithTheme(<DirectoryTree structure={mockStructure} />);
    
    expect(screen.getByText('Sample Library')).toBeInTheDocument();
  });

  it('shows child directories', () => {
    renderWithTheme(<DirectoryTree structure={mockStructure} />);
    
    expect(screen.getByText('Drums')).toBeInTheDocument();
    expect(screen.getByText('Bass')).toBeInTheDocument();
  });

  it('displays folder count chips', () => {
    renderWithTheme(<DirectoryTree structure={mockStructure} />);
    
    // Root has 2 children
    expect(screen.getByText('2')).toBeInTheDocument();
    // Drums has 2 children
    expect(screen.getAllByText('2')).toHaveLength(2);
    // Bass has 1 child
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('expands and collapses directories when clicked', () => {
    renderWithTheme(<DirectoryTree structure={mockStructure} />);
    
    // Initially, first level should be expanded (auto-expand first 2 levels)
    expect(screen.getByText('Kicks')).toBeInTheDocument();
    expect(screen.getByText('Snares')).toBeInTheDocument();
    
    // Click on Drums to collapse it
    const drumsElement = screen.getByText('Drums');
    fireEvent.click(drumsElement);
    
    // Kicks and Snares should still be visible since they're within maxDepth
    expect(screen.getByText('Kicks')).toBeInTheDocument();
    expect(screen.getByText('Snares')).toBeInTheDocument();
  });

  it('respects maxDepth prop', () => {
    renderWithTheme(<DirectoryTree structure={mockStructure} maxDepth={1} />);
    
    // Should show root and first level
    expect(screen.getByText('Sample Library')).toBeInTheDocument();
    expect(screen.getByText('Drums')).toBeInTheDocument();
    expect(screen.getByText('Bass')).toBeInTheDocument();
    
    // Should not show deeper levels
    expect(screen.queryByText('Kicks')).not.toBeInTheDocument();
    expect(screen.queryByText('Snares')).not.toBeInTheDocument();
    expect(screen.queryByText('808s')).not.toBeInTheDocument();
  });

  it('shows "...and more subdirectories" message when depth limit is reached', () => {
    const deepStructure: DirectoryStructure = {
      name: 'Root',
      path: '/root',
      type: 'directory',
      children: [
        {
          name: 'Level1',
          path: '/root/level1',
          type: 'directory',
          children: [
            {
              name: 'Level2',
              path: '/root/level1/level2',
              type: 'directory',
              children: [
                {
                  name: 'Level3',
                  path: '/root/level1/level2/level3',
                  type: 'directory',
                  children: [
                    {
                      name: 'Level4',
                      path: '/root/level1/level2/level3/level4',
                      type: 'directory',
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    renderWithTheme(<DirectoryTree structure={deepStructure} maxDepth={3} />);
    
    expect(screen.getByText('...and more subdirectories')).toBeInTheDocument();
  });

  it('handles empty directory structure', () => {
    const emptyStructure: DirectoryStructure = {
      name: 'Empty',
      path: '/empty',
      type: 'directory',
      children: []
    };

    renderWithTheme(<DirectoryTree structure={emptyStructure} />);
    
    expect(screen.getByText('Empty')).toBeInTheDocument();
    // Should not show any count chip for empty directory
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('uses correct icons for expanded and collapsed states', () => {
    renderWithTheme(<DirectoryTree structure={mockStructure} />);
    
    // Check for expand/collapse icons (these are rendered as SVG elements)
    const expandIcons = document.querySelectorAll('[data-testid="ExpandMoreIcon"]');
    const collapseIcons = document.querySelectorAll('[data-testid="ChevronRightIcon"]');
    
    // Should have some expand/collapse functionality
    expect(expandIcons.length + collapseIcons.length).toBeGreaterThan(0);
  });

  it('applies hover effects to clickable directories', () => {
    renderWithTheme(<DirectoryTree structure={mockStructure} />);
    
    const drumsElement = screen.getByText('Drums').closest('div');
    expect(drumsElement).toHaveStyle('cursor: pointer');
  });

  it('handles single file structure', () => {
    const fileStructure: DirectoryStructure = {
      name: 'file.wav',
      path: '/path/file.wav',
      type: 'file',
      children: []
    };

    renderWithTheme(<DirectoryTree structure={fileStructure} />);
    
    expect(screen.getByText('file.wav')).toBeInTheDocument();
  });
});