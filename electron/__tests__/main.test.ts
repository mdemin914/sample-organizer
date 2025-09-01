/**
 * @jest-environment node
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// Mock electron modules
const mockDialog = {
  showOpenDialog: jest.fn(),
};

const mockIpcMain = {
  handle: jest.fn(),
};

const mockBrowserWindow = {
  loadURL: jest.fn(),
  show: jest.fn(),
  once: jest.fn(),
  webContents: {
    openDevTools: jest.fn(),
  },
};

jest.mock('electron', () => ({
  app: {
    whenReady: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    quit: jest.fn(),
  },
  BrowserWindow: jest.fn(() => mockBrowserWindow),
  dialog: mockDialog,
  ipcMain: mockIpcMain,
}));

jest.mock('electron-is-dev', () => false);

// Mock fs/promises
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Electron Main Process', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('IPC Handlers', () => {
    beforeEach(() => {
      // Import the main file to register IPC handlers
      jest.isolateModules(() => {
        require('../main');
      });
    });

    describe('select-directory handler', () => {
      it('should return selected directory path', async () => {
        mockDialog.showOpenDialog.mockResolvedValue({
          canceled: false,
          filePaths: ['/selected/directory'],
        });

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'select-directory'
        )?.[1];

        const result = await handler();
        expect(result).toBe('/selected/directory');
        expect(mockDialog.showOpenDialog).toHaveBeenCalledWith(
          expect.anything(),
          { properties: ['openDirectory'] }
        );
      });

      it('should return null when dialog is canceled', async () => {
        mockDialog.showOpenDialog.mockResolvedValue({
          canceled: true,
          filePaths: [],
        });

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'select-directory'
        )?.[1];

        const result = await handler();
        expect(result).toBeNull();
      });

      it('should return null when no paths are selected', async () => {
        mockDialog.showOpenDialog.mockResolvedValue({
          canceled: false,
          filePaths: [],
        });

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'select-directory'
        )?.[1];

        const result = await handler();
        expect(result).toBeNull();
      });
    });

    describe('scan-directory handler', () => {
      it('should scan directory structure recursively', async () => {
        const mockStats = {
          isDirectory: jest.fn(),
        };

        mockFs.stat.mockImplementation((filePath) => {
          if (filePath === '/test/root') {
            mockStats.isDirectory.mockReturnValue(true);
            return Promise.resolve(mockStats as any);
          } else if (filePath === '/test/root/folder1') {
            mockStats.isDirectory.mockReturnValue(true);
            return Promise.resolve(mockStats as any);
          } else if (filePath === '/test/root/folder2') {
            mockStats.isDirectory.mockReturnValue(true);
            return Promise.resolve(mockStats as any);
          }
          return Promise.resolve(mockStats as any);
        });

        mockFs.readdir.mockImplementation((dirPath) => {
          if (dirPath === '/test/root') {
            return Promise.resolve(['folder1', 'folder2'] as any);
          } else if (dirPath === '/test/root/folder1') {
            return Promise.resolve([]);
          } else if (dirPath === '/test/root/folder2') {
            return Promise.resolve([]);
          }
          return Promise.resolve([]);
        });

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'scan-directory'
        )?.[1];

        const result = await handler(null, '/test/root');

        expect(result).toEqual({
          name: 'root',
          path: '/test/root',
          type: 'directory',
          children: [
            {
              name: 'folder1',
              path: '/test/root/folder1',
              type: 'directory',
              children: [],
            },
            {
              name: 'folder2',
              path: '/test/root/folder2',
              type: 'directory',
              children: [],
            },
          ],
        });
      });

      it('should handle scan errors gracefully', async () => {
        mockFs.stat.mockRejectedValue(new Error('Permission denied'));

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'scan-directory'
        )?.[1];

        await expect(handler(null, '/test/invalid')).rejects.toThrow('Permission denied');
      });

      it('should skip inaccessible files and continue scanning', async () => {
        const mockStats = {
          isDirectory: jest.fn().mockReturnValue(true),
        };

        mockFs.stat.mockImplementation((filePath) => {
          if (filePath === '/test/root/inaccessible') {
            return Promise.reject(new Error('Permission denied'));
          }
          return Promise.resolve(mockStats as any);
        });

        mockFs.readdir.mockImplementation((dirPath) => {
          if (dirPath === '/test/root') {
            return Promise.resolve(['accessible', 'inaccessible'] as any);
          }
          return Promise.resolve([]);
        });

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'scan-directory'
        )?.[1];

        const result = await handler(null, '/test/root');

        expect(result.children).toHaveLength(1);
        expect(result.children[0].name).toBe('accessible');
      });
    });

    describe('get-audio-files handler', () => {
      it('should find audio files recursively', async () => {
        const mockStats = {
          isDirectory: jest.fn(),
          isFile: jest.fn(),
          size: 1024000,
        };

        mockFs.stat.mockImplementation((filePath) => {
          if (filePath.includes('.wav') || filePath.includes('.mp3')) {
            mockStats.isDirectory.mockReturnValue(false);
            mockStats.isFile.mockReturnValue(true);
            return Promise.resolve(mockStats as any);
          } else {
            mockStats.isDirectory.mockReturnValue(true);
            mockStats.isFile.mockReturnValue(false);
            return Promise.resolve(mockStats as any);
          }
        });

        mockFs.readdir.mockImplementation((dirPath) => {
          if (dirPath === '/test/audio') {
            return Promise.resolve(['kick.wav', 'snare.mp3', 'subfolder'] as any);
          } else if (dirPath === '/test/audio/subfolder') {
            return Promise.resolve(['hihat.wav'] as any);
          }
          return Promise.resolve([]);
        });

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'get-audio-files'
        )?.[1];

        const result = await handler(null, '/test/audio');

        expect(result).toHaveLength(3);
        expect(result).toContainEqual({
          name: 'kick.wav',
          path: '/test/audio/kick.wav',
          size: 1024000,
          extension: '.wav',
        });
        expect(result).toContainEqual({
          name: 'snare.mp3',
          path: '/test/audio/snare.mp3',
          size: 1024000,
          extension: '.mp3',
        });
        expect(result).toContainEqual({
          name: 'hihat.wav',
          path: '/test/audio/subfolder/hihat.wav',
          size: 1024000,
          extension: '.wav',
        });
      });

      it('should filter only audio file extensions', async () => {
        const mockStats = {
          isDirectory: jest.fn().mockReturnValue(false),
          isFile: jest.fn().mockReturnValue(true),
          size: 1024000,
        };

        mockFs.stat.mockResolvedValue(mockStats as any);
        mockFs.readdir.mockResolvedValue([
          'audio.wav',
          'audio.mp3',
          'audio.flac',
          'audio.aiff',
          'audio.m4a',
          'audio.ogg',
          'document.txt',
          'image.jpg',
          'video.mp4',
        ] as any);

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'get-audio-files'
        )?.[1];

        const result = await handler(null, '/test/mixed');

        expect(result).toHaveLength(6);
        expect(result.every(file => 
          ['.wav', '.mp3', '.flac', '.aiff', '.m4a', '.ogg'].includes(file.extension)
        )).toBe(true);
      });

      it('should handle errors when scanning for audio files', async () => {
        mockFs.readdir.mockRejectedValue(new Error('Directory not found'));

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'get-audio-files'
        )?.[1];

        await expect(handler(null, '/test/nonexistent')).rejects.toThrow('Directory not found');
      });

      it('should skip inaccessible directories and continue', async () => {
        const mockStats = {
          isDirectory: jest.fn(),
          isFile: jest.fn(),
          size: 1024000,
        };

        mockFs.stat.mockImplementation((filePath) => {
          if (filePath.includes('accessible.wav')) {
            mockStats.isDirectory.mockReturnValue(false);
            mockStats.isFile.mockReturnValue(true);
            return Promise.resolve(mockStats as any);
          } else {
            mockStats.isDirectory.mockReturnValue(true);
            mockStats.isFile.mockReturnValue(false);
            return Promise.resolve(mockStats as any);
          }
        });

        mockFs.readdir.mockImplementation((dirPath) => {
          if (dirPath === '/test/mixed') {
            return Promise.resolve(['accessible.wav', 'inaccessible_folder'] as any);
          } else if (dirPath === '/test/mixed/inaccessible_folder') {
            return Promise.reject(new Error('Permission denied'));
          }
          return Promise.resolve([]);
        });

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'get-audio-files'
        )?.[1];

        const result = await handler(null, '/test/mixed');

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('accessible.wav');
      });
    });

    describe('copy-file handler', () => {
      it('should copy file to destination', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        mockFs.copyFile.mockResolvedValue(undefined);

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'copy-file'
        )?.[1];

        const result = await handler(null, '/source/file.wav', '/dest/folder/file.wav');

        expect(result).toBe(true);
        expect(mockFs.mkdir).toHaveBeenCalledWith('/dest/folder', { recursive: true });
        expect(mockFs.copyFile).toHaveBeenCalledWith('/source/file.wav', '/dest/folder/file.wav');
      });

      it('should handle copy errors', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        mockFs.copyFile.mockRejectedValue(new Error('Disk full'));

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'copy-file'
        )?.[1];

        await expect(handler(null, '/source/file.wav', '/dest/file.wav')).rejects.toThrow('Disk full');
      });

      it('should handle directory creation errors', async () => {
        mockFs.mkdir.mockRejectedValue(new Error('Permission denied'));

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'copy-file'
        )?.[1];

        await expect(handler(null, '/source/file.wav', '/dest/folder/file.wav')).rejects.toThrow('Permission denied');
      });

      it('should create nested directories', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        mockFs.copyFile.mockResolvedValue(undefined);

        const handler = mockIpcMain.handle.mock.calls.find(
          ([channel]) => channel === 'copy-file'
        )?.[1];

        await handler(null, '/source/file.wav', '/dest/deep/nested/folder/file.wav');

        expect(mockFs.mkdir).toHaveBeenCalledWith('/dest/deep/nested/folder', { recursive: true });
      });
    });
  });

  describe('Helper Functions', () => {
    // These tests would require extracting helper functions or testing through IPC handlers
    it('should handle case-insensitive audio extensions', async () => {
      const mockStats = {
        isDirectory: jest.fn().mockReturnValue(false),
        isFile: jest.fn().mockReturnValue(true),
        size: 1024000,
      };

      mockFs.stat.mockResolvedValue(mockStats as any);
      mockFs.readdir.mockResolvedValue([
        'audio.WAV',
        'audio.MP3',
        'audio.FLAC',
        'audio.wav',
        'audio.mp3',
      ] as any);

      const handler = mockIpcMain.handle.mock.calls.find(
        ([channel]) => channel === 'get-audio-files'
      )?.[1];

      const result = await handler(null, '/test/case');

      expect(result).toHaveLength(5);
      expect(result.map(f => f.extension)).toEqual(['.wav', '.mp3', '.flac', '.wav', '.mp3']);
    });

    it('should extract correct file names from paths', async () => {
      const mockStats = {
        isDirectory: jest.fn().mockReturnValue(false),
        isFile: jest.fn().mockReturnValue(true),
        size: 1024000,
      };

      mockFs.stat.mockResolvedValue(mockStats as any);
      mockFs.readdir.mockResolvedValue(['test file with spaces.wav'] as any);

      const handler = mockIpcMain.handle.mock.calls.find(
        ([channel]) => channel === 'get-audio-files'
      )?.[1];

      const result = await handler(null, '/test/spaces');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('test file with spaces.wav');
      expect(result[0].extension).toBe('.wav');
    });
  });

  describe('Error Handling', () => {
    it('should log errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockFs.stat.mockRejectedValue(new Error('Test error'));

      const handler = mockIpcMain.handle.mock.calls.find(
        ([channel]) => channel === 'scan-directory'
      )?.[1];

      await expect(handler(null, '/test/error')).rejects.toThrow('Test error');
      expect(consoleSpy).toHaveBeenCalledWith('Error scanning directory:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle malformed paths gracefully', async () => {
      const handler = mockIpcMain.handle.mock.calls.find(
        ([channel]) => channel === 'scan-directory'
      )?.[1];

      // Test with invalid path characters
      await expect(handler(null, '')).rejects.toThrow();
      await expect(handler(null, null)).rejects.toThrow();
    });
  });
});