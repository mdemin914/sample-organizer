// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock electron APIs for testing
const mockElectronAPI = {
  selectDirectory: jest.fn(),
  scanDirectory: jest.fn(),
  getAudioFiles: jest.fn(),
  copyFile: jest.fn(),
};

// Add the mock to global window object
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// Export the mock for use in tests
export { mockElectronAPI };