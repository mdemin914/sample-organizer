# 🎵 Sample Organizer

A cross-platform desktop application that intelligently organizes your musical samples into structured folders. Built with Electron, React, TypeScript, and Material-UI.

## Features

- **🎯 Intelligent Matching**: Automatically matches audio files to appropriate folders based on file names, keywords, and musical characteristics
- **🔍 Smart Analysis**: Recognizes instrument types (kick, snare, hi-hat, etc.), musical keys, BPM, and genre indicators
- **🖱️ Manual Override**: Review and manually assign files that couldn't be matched automatically
- **📁 Flexible Structure**: Works with any existing folder structure you already have
- **⚡ Cross-Platform**: Runs on macOS, Windows, and Linux
- **🎨 Modern UI**: Beautiful dark theme with intuitive Material-UI components
- **📊 Progress Tracking**: Real-time feedback during the organization process

## How It Works

1. **Select Output Directory**: Choose the directory containing your organized folder structure (e.g., `Drums → Cymbals → Hi-Hats`)
2. **Select Input Directory**: Choose the directory containing the audio samples you want to organize
3. **Automatic Matching**: The app analyzes file names and matches them to appropriate folders using intelligent algorithms
4. **Manual Review**: Review any files that couldn't be matched with high confidence
5. **Organization**: Files are copied to their destination folders while preserving the originals

## Supported Audio Formats

- WAV (.wav)
- MP3 (.mp3) 
- FLAC (.flac)
- AIFF (.aiff, .aif)
- M4A (.m4a)
- OGG (.ogg)

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development version:
   ```bash
   npm start
   ```

### Building for Production

To build the app for your platform:

```bash
npm run build
npm run dist
```

This will create distributable files in the `release` directory.

## Usage

### Setting Up Your Folder Structure

The app works best when you have a well-organized output directory structure. For example:

```
Sample Library/
├── Drums/
│   ├── Kicks/
│   ├── Snares/
│   ├── Hi-Hats/
│   │   ├── Closed/
│   │   └── Open/
│   ├── Cymbals/
│   │   ├── Crash/
│   │   └── Ride/
│   └── Percussion/
├── Bass/
│   ├── 808s/
│   └── Sub Bass/
├── Leads/
├── Pads/
└── FX/
    ├── Risers/
    └── Impacts/
```

### Matching Algorithm

The app uses several strategies to match files:

1. **Keyword Recognition**: Recognizes common sample keywords (kick, snare, lead, bass, etc.)
2. **Partial String Matching**: Matches parts of file names with folder names
3. **Musical Context**: Detects musical keys (C, Dm, F#, etc.) and BPM values
4. **Category Grouping**: Groups related instruments and sample types
5. **Confidence Scoring**: Assigns confidence scores to matches

### File Naming Best Practices

For best results, name your samples descriptively:

- ✅ Good: `Kick_Drum_C_128BPM.wav`, `Snare_Trap_Dry.wav`, `Lead_Synth_Am.wav`
- ❌ Less ideal: `Sample_001.wav`, `Audio_File.wav`, `Untitled.wav`

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── DirectorySelector.tsx
│   ├── DirectoryTree.tsx
│   ├── AudioFileList.tsx
│   ├── MatchingProgress.tsx
│   └── ManualAssignment.tsx
├── utils/              # Utility functions
│   └── fileMatcher.ts  # Core matching algorithm
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main app component
└── index.tsx           # App entry point

electron/
├── main.ts             # Main Electron process
└── preload.ts          # Preload script for IPC
```

### Key Technologies

- **Electron**: Cross-platform desktop app framework
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Material-UI v5**: Component library and design system
- **Node.js File System**: For directory scanning and file operations

### Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run dist` - Create distributable packages
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

**App won't start:**
- Ensure Node.js v16+ is installed
- Delete `node_modules` and run `npm install` again

**Files not being matched:**
- Check that your folder structure contains recognizable keywords
- Try renaming files to include instrument/sample type keywords
- Use the manual assignment feature for edge cases

**Permissions errors:**
- Ensure the app has read access to input directories
- Ensure the app has write access to output directories
- On macOS, you may need to grant folder access permissions

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter issues or have suggestions, please create an issue in the repository.