# Sample Organizer

A Mac OS desktop application built with Electron and TypeScript for organizing musical samples on your hard drive.

## Features

- **Directory Scanning**: Automatically scans input and output directories
- **Smart File Matching**: Uses keyword matching to suggest appropriate sample categories
- **Confidence Scoring**: Shows confidence levels for automatic file mappings
- **Manual Override**: Edit file mappings for unmatched or incorrectly categorized samples
- **File Copying**: Safely copy samples to organized folder structures
- **Modern UI**: Built with Material-UI for a clean, professional interface

## How It Works

1. **Select Output Directory**: Choose where you want your organized samples to be stored
2. **Scan Structure**: The app scans your output directory to understand the existing folder hierarchy
3. **Select Input Directory**: Choose the directory containing your unorganized samples
4. **Automatic Mapping**: The app suggests where each sample should go based on filename analysis
5. **Review & Edit**: Review the suggested mappings and edit any that need adjustment
6. **Copy Files**: Execute the file copying operation to organize your samples

## Sample Categories

The app recognizes common drum sample types:

- **Kicks**: `kick`, `bass` → `drums/kick/`
- **Snares**: `snare` → `drums/snare/`
- **Hi-Hats**: `hihat`, `hat` → `drums/cymbals/hi-hats/`
- **Crashes**: `crash` → `drums/cymbals/crash/`
- **Toms**: `tom` → `drums/toms/`
- **Other Cymbals**: `cymbal` → `drums/cymbals/`
- **Unmatched**: → `drums/other/`

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
├── src/
│   ├── main.ts          # Main Electron process
│   ├── preload.ts       # Preload script for IPC
│   └── renderer.tsx     # React renderer component
├── dist/                # Compiled JavaScript (generated)
├── assets/              # App assets (icons, etc.)
├── index.html           # Main HTML file
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── webpack.config.js    # Webpack configuration
└── README.md            # This file
```

## Technology Stack

- **Electron**: Cross-platform desktop app framework
- **TypeScript**: Type-safe JavaScript
- **React**: UI framework
- **Material-UI**: Component library for modern design
- **Webpack**: Module bundler for the renderer process

## Building for Distribution

To create a distributable package:

```bash
npm run dist
```

This will create a `.dmg` file in the `dist` folder for macOS distribution.

### Environment Variables

Set `OPENAI_API_KEY` in a `.env` file to enable AI auto-mapping features and to run Jest live tests.

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

### Getting Help

If you encounter issues:

1. Check the console output for error messages
2. Ensure all dependencies are properly installed
3. Verify your Node.js version is compatible
4. Check file permissions for the directories you're trying to access

## TODO

- Add support for organizing and previewing MIDI pattern files (`.mid`) alongside audio samples.
