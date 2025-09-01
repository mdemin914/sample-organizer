# Testing Guide for Sample Organizer

This document provides comprehensive information about the testing setup and strategies for the Sample Organizer application.

## Overview

The Sample Organizer uses a comprehensive testing strategy that includes:

- **Unit Tests**: Testing individual components and functions in isolation
- **Integration Tests**: Testing complete user workflows and component interactions
- **Electron Main Process Tests**: Testing the backend file system operations
- **Component Tests**: Testing React components with user interactions

## Test Structure

```
src/
├── __tests__/
│   ├── App.test.tsx              # Main app component tests
│   └── integration.test.tsx      # End-to-end workflow tests
├── components/__tests__/
│   ├── AudioFileList.test.tsx    # Audio file list component tests
│   ├── DirectorySelector.test.tsx # Directory selection tests
│   ├── DirectoryTree.test.tsx    # Directory tree display tests
│   └── MatchingProgress.test.tsx # Matching progress tests
├── utils/__tests__/
│   └── fileMatcher.test.ts       # File matching algorithm tests
└── setupTests.ts                 # Test configuration and mocks

electron/__tests__/
└── main.test.ts                  # Electron main process tests
```

## Testing Technologies

- **Jest**: Test runner and assertion library
- **React Testing Library**: React component testing utilities
- **@testing-library/jest-dom**: Additional DOM matchers
- **@testing-library/user-event**: User interaction simulation
- **ts-jest**: TypeScript support for Jest

## Running Tests

### All Tests
```bash
npm test              # Interactive test runner (React tests)
npm run test:all      # Run all tests with coverage
```

### Specific Test Suites
```bash
npm run test:coverage # React tests with coverage report
npm run test:electron # Electron main process tests only
```

### Test Options
```bash
npm test -- --coverage           # Run with coverage
npm test -- --watchAll=false     # Run once without watch mode
npm test -- --testNamePattern="DirectorySelector"  # Run specific tests
```

## Test Categories

### 1. Unit Tests

#### File Matching Algorithm (`src/utils/__tests__/fileMatcher.test.ts`)
Tests the core intelligence of the app:
- **Keyword Recognition**: Tests matching of musical terms (kick, snare, hi-hat, etc.)
- **Confidence Scoring**: Validates the scoring algorithm for match quality
- **Musical Context**: Tests BPM and key detection
- **Edge Cases**: Handles special characters, case sensitivity, long names
- **Error Handling**: Tests behavior with invalid inputs

**Key Test Cases:**
```typescript
it('should match kick drum to kicks folder', async () => {
  // Tests high-confidence automatic matching
});

it('should handle BPM matching', async () => {
  // Tests musical context awareness
});

it('should assign low confidence for weak matches', async () => {
  // Tests confidence scoring accuracy
});
```

#### Component Tests
Each component is tested for:
- **Rendering**: Correct display of content and UI elements
- **User Interactions**: Click events, form submissions, state changes
- **Props Handling**: Correct behavior with different prop values
- **Error States**: Graceful handling of error conditions

### 2. Integration Tests (`src/__tests__/integration.test.tsx`)

Tests complete user workflows:

#### Full Automatic Workflow
1. Select output directory
2. Select input directory  
3. Start organization process
4. Verify automatic file matching
5. Confirm successful completion

#### Manual Assignment Workflow
1. Setup with files requiring manual assignment
2. Navigate through manual assignment UI
3. Assign files to specific folders
4. Complete organization process

#### Error Handling Workflows
- Network/file system errors
- Permission issues
- Invalid directory structures
- Disk space issues

### 3. Electron Main Process Tests (`electron/__tests__/main.test.ts`)

Tests backend functionality:
- **IPC Handlers**: All electron-to-renderer communication
- **File System Operations**: Directory scanning, file copying
- **Error Handling**: Graceful handling of system-level errors
- **Security**: Proper path validation and sanitization

**Key Test Areas:**
```typescript
describe('scan-directory handler', () => {
  it('should scan directory structure recursively');
  it('should handle scan errors gracefully');
  it('should skip inaccessible files');
});

describe('copy-file handler', () => {
  it('should copy file to destination');
  it('should create nested directories');
  it('should handle copy errors');
});
```

## Test Mocking Strategy

### Electron API Mocking
The app uses a comprehensive mock of the Electron API:

```typescript
// setupTests.ts
const mockElectronAPI = {
  selectDirectory: jest.fn(),
  scanDirectory: jest.fn(),
  getAudioFiles: jest.fn(),
  copyFile: jest.fn(),
};
```

This allows testing all UI interactions without requiring the actual Electron environment.

### File System Mocking
Electron tests mock the `fs/promises` module to simulate various file system scenarios:

```typescript
// main.test.ts
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;
```

## Coverage Goals

The testing suite aims for:
- **Line Coverage**: >90%
- **Function Coverage**: >95%
- **Branch Coverage**: >85%
- **Statement Coverage**: >90%

### Coverage Reports
```bash
npm run test:coverage
```

This generates coverage reports in:
- Terminal output
- `coverage/lcov-report/index.html` (detailed HTML report)

## Test Data Patterns

### Mock Directory Structure
```typescript
const mockDirectoryStructure: DirectoryStructure = {
  name: 'Sample Library',
  path: '/output/Sample Library',
  type: 'directory',
  children: [
    {
      name: 'Drums',
      children: [
        { name: 'Kicks' },
        { name: 'Snares' },
        { name: 'Hi-Hats' }
      ]
    }
  ]
};
```

### Mock Audio Files
```typescript
const mockAudioFiles: AudioFile[] = [
  {
    name: 'Kick_Drum_C_128BPM.wav',
    path: '/input/Kick_Drum_C_128BPM.wav',
    size: 1024000,
    extension: '.wav'
  }
];
```

## Best Practices

### Test Naming
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Use consistent naming patterns

### Test Structure
```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup common to all tests
  });

  it('should do something specific when condition is met', () => {
    // Arrange
    // Act  
    // Assert
  });
});
```

### Async Testing
```typescript
it('should handle async operations', async () => {
  // Setup async mock
  mockElectronAPI.scanDirectory.mockResolvedValue(mockData);
  
  // Trigger action
  fireEvent.click(button);
  
  // Wait for async completion
  await waitFor(() => {
    expect(screen.getByText('Expected Result')).toBeInTheDocument();
  });
});
```

### Error Testing
```typescript
it('should handle errors gracefully', async () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  mockElectronAPI.scanDirectory.mockRejectedValue(new Error('Test error'));
  
  // Trigger error condition
  // Assert error handling
  
  consoleSpy.mockRestore();
});
```

## Continuous Integration

The testing setup is designed to work in CI environments:

```bash
# CI-friendly test commands
npm run test:all          # Run all tests once
npm run test:coverage     # Generate coverage reports
```

### Environment Variables
- `CI=true`: Automatically set by most CI systems
- `COVERAGE_THRESHOLD`: Can be set to enforce coverage requirements

## Debugging Tests

### Running Individual Tests
```bash
npm test -- --testNamePattern="specific test name"
npm test -- src/components/__tests__/DirectorySelector.test.tsx
```

### Debug Mode
```bash
npm test -- --no-coverage --verbose
```

### Common Issues

1. **Async Test Timeouts**: Increase timeout for complex workflows
```typescript
it('should complete complex workflow', async () => {
  // test code
}, 10000); // 10 second timeout
```

2. **Mock Cleanup**: Ensure mocks are cleared between tests
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

3. **DOM Cleanup**: React Testing Library handles this automatically

## Contributing to Tests

When adding new features:

1. **Write tests first** (TDD approach recommended)
2. **Test both happy path and error cases**
3. **Maintain coverage standards**
4. **Update this documentation** if adding new test patterns

### Test Checklist for New Features
- [ ] Unit tests for core logic
- [ ] Component tests for UI elements
- [ ] Integration tests for user workflows
- [ ] Error handling tests
- [ ] Edge case tests
- [ ] Mock cleanup and setup
- [ ] Documentation updates

## Performance Testing

While not included in the current suite, consider adding:
- Large file set testing (1000+ files)
- Deep directory structure testing (10+ levels)
- Memory usage monitoring
- File operation performance benchmarks

This comprehensive testing strategy ensures the Sample Organizer is reliable, maintainable, and provides a great user experience.