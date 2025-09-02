# Sample Organizer

A Mac OS desktop application built with Electron and TypeScript for organizing musical samples on your hard drive.

## Features

### Core Organization Features

- **Directory Scanning**: Automatically scans input and output directories for audio files
- **Smart File Matching**: Uses keyword matching to suggest appropriate sample categories
- **AI-Powered Classification**: OpenAI integration for intelligent sample categorization
- **Confidence Scoring**: Shows confidence levels for automatic file mappings
- **Manual Override**: Edit file mappings for unmatched or incorrectly categorized samples
- **Individual AI Classify**: Re-classify individual files using AI with one-click
- **Duplicate Detection**: Automatically identifies duplicate filenames across your collection
- **File Operations**: Move or copy samples to organized folder structures

### Playback & Preview

- **Built-in Audio Player**: Preview samples directly in the app before organizing
- **Full Playback Controls**: Play, pause, seek, volume control, and loop functionality
- **Waveform Navigation**: Click and drag to scrub through audio files
- **Loop Mode**: Perfect for analyzing drum patterns and loops

### User Interface

- **Modern Material-UI**: Clean, professional interface with responsive design
- **Dark/Light Theme**: Toggle between themes for comfortable use
- **Virtualized Lists**: Handle thousands of samples with smooth scrolling performance
- **Interactive Tree View**: Browse destination folder structure with file counts
- **Folder Quick Access**: Click destination paths to open in Finder/Explorer
- **Real-time Progress**: Visual feedback for all operations

## How It Works

1. **Configure API Key** (Optional): Add your OpenAI API key to enable AI-powered classification
2. **Select Destination Directory**: Choose where you want your organized samples to be stored
3. **Scan Structure**: The app analyzes your destination directory's folder hierarchy
4. **Import Samples**: Select the directory containing your unorganized samples
5. **Smart Classification**:
   - **Keyword Matching**: Initial categorization based on filename patterns
   - **AI Auto-Map**: Use OpenAI to intelligently classify entire batches
   - **Individual AI Classify**: Re-classify specific files with AI assistance
6. **Preview & Review**:
   - **Audio Preview**: Listen to samples using the built-in player
   - **Edit Mappings**: Adjust destination folders as needed
   - **Duplicate Check**: Review any duplicate filenames
7. **Move Files**: Execute the organization with move or copy operations

## Classification System

### Built-in Keyword Recognition

The app includes built-in recognition for common drum sample types:

- **Kicks**: `kick`, `bass` → `drums/kick/`
- **Snares**: `snare` → `drums/snare/`
- **Hi-Hats**: `hihat`, `hat` → `drums/cymbals/hi-hats/`
- **Crashes**: `crash` → `drums/cymbals/crash/`
- **Toms**: `tom` → `drums/toms/`
- **Other Cymbals**: `cymbal` → `drums/cymbals/`
- **Unmatched**: → `drums/other/`

### AI-Powered Classification

With an OpenAI API key, the app can intelligently classify any type of audio sample:

- **Adaptive Learning**: AI learns from your existing folder structure
- **Context Awareness**: Considers filename patterns, folder names, and musical context
- **Broad Support**: Works with any genre - electronic, rock, jazz, orchestral, etc.
- **Custom Categories**: Automatically adapts to your unique organizational system

### Supported Audio Formats

- **Lossless**: WAV, AIFF, FLAC
- **Compressed**: MP3, OGG

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd sample-organizer
```

2. Install dependencies:

```bash
npm install
```

3. Build the application:

```bash
npm run build
```

4. Start the application:

```bash
npm start
```

### Development Mode

For development with hot reloading:

```bash
npm run dev
```

This will:

- Build the main process
- Build the renderer process in development mode
- Start the app with developer tools open

### Build Scripts

- `npm run build` - Build both main and renderer processes for production
- `npm run build:main` - Build only the main process (Electron)
- `npm run build:renderer` - Build only the renderer process (React)
- `npm run build:renderer:dev` - Build renderer in development mode

## Project Structure

```
sample-organizer/
├── src/                           # Source code
│   ├── main.ts                    # Main Electron process & IPC handlers
│   ├── preload.ts                 # Context bridge for secure IPC
│   ├── renderer.tsx               # Root React component & app logic
│   ├── components/                # React UI components
│   │   ├── Controls.tsx           # Main control bar (API key, buttons)
│   │   ├── ImportSamples.tsx      # Sample list with virtualized scrolling
│   │   ├── Destination.tsx        # Folder tree view component
│   │   └── Player.tsx             # Audio player controls
│   ├── context/
│   │   └── PlaybackContext.tsx    # Audio playback state management
│   ├── services/
│   │   ├── openaiUtil.ts         # OpenAI API integration
│   │   └── __tests__/
│   │       └── openaiUtil.test.ts # API service tests
│   ├── utils/
│   │   ├── categorizeSamples.ts   # Keyword-based classification
│   │   └── randomSample.ts        # Array sampling utility
│   └── types/
│       ├── window.d.ts            # Global type definitions
│       └── react-window.d.ts      # Virtualization types
├── dist/                          # Compiled output (auto-generated)
├── assets/
│   └── icon.png                   # App icon
├── index.html                     # Electron renderer entry point
├── package.json                   # Dependencies & build scripts
├── tsconfig.json                  # TypeScript compiler config
├── webpack.config.js              # Renderer build configuration
├── jest.config.js                 # Testing configuration
└── README.md                      # This documentation
```

## Technology Stack

### Core Framework

- **Electron**: Cross-platform desktop app framework
- **TypeScript**: Type-safe JavaScript with strict typing
- **React**: Modern UI framework with hooks and context
- **Webpack**: Module bundler for optimized builds

### UI & Styling

- **Material-UI (MUI)**: Complete component library with theming
- **@mui/x-tree-view**: Advanced tree components for folder navigation
- **@mui/x-data-grid**: High-performance data grids (virtualized)
- **@mui/icons-material**: Comprehensive icon set

### Audio & AI

- **Web Audio API**: Native browser audio playback and control
- **OpenAI API**: GPT-4 powered intelligent sample classification
- **react-window**: Virtualized scrolling for large sample collections

### Development Tools

- **Jest**: Testing framework with TypeScript support
- **Concurrently**: Parallel script execution for development
- **Electronmon**: Hot reloading for Electron development
- **fs-extra**: Enhanced file system operations

## Building for Distribution

To create a distributable package:

```bash
npm run dist
```

This will create a `.dmg` file in the `dist` folder for macOS distribution.

### Environment Variables

For AI-powered features, you can either:

- **Runtime Configuration**: Enter your OpenAI API key directly in the app interface (recommended)
- **Development Environment**: Set `OPENAI_API_KEY` in a `.env` file for testing and development

The AI features are completely optional - the app works perfectly without an API key using built-in keyword matching.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Troubleshooting

### Common Issues

1. **Build fails**: Make sure all dependencies are installed with `npm install`
2. **App won't start**: Check that both main and renderer processes built successfully
3. **File operations fail**: Ensure the app has proper permissions for the directories you're working with
4. **Audio won't play**: Check that audio files are valid and in supported formats (WAV, AIFF, FLAC, MP3, OGG)
5. **AI classification fails**: Verify your OpenAI API key is valid and has sufficient credits
6. **Large collections slow**: The app uses virtualization, but very large directories (10k+ files) may take time to scan
7. **Theme/UI issues**: Try toggling between light and dark mode using the theme button

### Getting Help

If you encounter issues:

1. Check the console output for error messages
2. Ensure all dependencies are properly installed
3. Verify your Node.js version is compatible
4. Check file permissions for the directories you're trying to access

## Roadmap

### Planned Features

- **MIDI Support**: Organization and preview of MIDI pattern files (`.mid`)
- **Waveform Visualization**: Visual waveforms for better sample identification
- **Batch Operations**: Bulk file operations and selection
- **Custom Categorization Rules**: User-defined keyword matching rules
- **Export/Import Settings**: Save and share classification configurations
- **Plugin System**: Support for custom classification algorithms

### Recently Added

- ✅ Built-in audio player with full controls
- ✅ AI-powered sample classification via OpenAI
- ✅ Dark/light theme support
- ✅ Virtualized scrolling for large collections
- ✅ Individual file AI re-classification
- ✅ Duplicate detection and file operation feedback
