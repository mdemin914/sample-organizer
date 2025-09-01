# Sample Organizer

A macOS application for automatically organizing musical samples into a structured folder hierarchy.

## Features

- **Automatic Directory Scanning**: Scans your output directory to understand its folder structure
- **Intelligent File Matching**: Uses keyword matching and fuzzy logic to categorize samples
- **Flexible Organization**: Supports nested folder structures (e.g., `drums/cymbals/hats`)
- **Manual Review**: Allows you to manually assign unmatched files to appropriate folders
- **Progress Tracking**: Shows real-time progress during file organization
- **Duplicate Handling**: Automatically handles duplicate filenames by adding numbering

## How It Works

1. **Select Output Directory**: Choose the directory where you want your samples organized
2. **Scan Structure**: The app scans your output directory to understand the existing folder hierarchy
3. **Select Input Directory**: Choose the directory containing samples you want to organize
4. **Organize**: The app automatically categorizes and copies samples to appropriate folders
5. **Review**: Manually assign any unmatched files to their desired locations

## Supported Audio Formats

- WAV (.wav)
- AIFF (.aif, .aiff)
- MP3 (.mp3)
- FLAC (.flac)
- M4A (.m4a)
- OGG (.ogg)

## Intelligent Categorization

The app uses multiple strategies to match files:

- **Direct Matching**: Looks for exact folder names in filenames
- **Keyword Matching**: Uses musical terminology to categorize samples
- **Fuzzy Matching**: Handles typos and variations in naming

### Example Categories

- **Drums**: kick, snare, tom, hi-hat, crash, ride, cymbal
- **Synth**: lead, pad, arp, pluck, bell, chord
- **Bass**: bass, sub, 808, 909, bassline
- **FX**: effect, sweep, riser, atmosphere, ambient
- **Vocal**: voice, choir, chant, scream
- **Guitar**: acoustic, electric, distortion, riff
- **Piano**: keys, keyboard, rhodes, organ
- **Strings**: violin, cello, orchestra, ensemble
- **Brass**: trumpet, trombone, horn, saxophone
- **Woodwind**: flute, clarinet, oboe, bassoon
- **Ethnic**: world, african, indian, latin, celtic
- **Foley**: sound effect, impact, whoosh

## Building and Running

### Requirements
- macOS 14.0 or later
- Xcode 15.0 or later

### Build Steps
1. Open `SampleOrganizer.xcodeproj` in Xcode
2. Select your target device (macOS)
3. Build and run the project (⌘+R)

## Usage Example

1. **Setup Output Structure**:
   ```
   MySamples/
   ├── drums/
   │   ├── kicks/
   │   ├── snares/
   │   ├── cymbals/
   │   └── percussion/
   ├── synth/
   │   ├── leads/
   │   ├── pads/
   │   └── plucks/
   └── bass/
       ├── 808/
       └── sub/
   ```

2. **Organize Samples**:
   - Select your output directory (MySamples)
   - Select your input directory (containing loose samples)
   - Click "Organize Samples"
   - Review any unmatched files manually

## File Naming Best Practices

For best automatic categorization, use descriptive filenames:
- `kick_heavy_808.wav` → automatically goes to `drums/kicks/`
- `synth_lead_melody.aif` → automatically goes to `synth/leads/`
- `bass_sub_deep.wav` → automatically goes to `bass/sub/`

## Technical Details

- Built with SwiftUI for macOS
- Uses async/await for file operations
- Implements intelligent fuzzy matching algorithms
- Handles file permissions and error cases gracefully
- Supports nested directory structures of any depth

## License

This project is open source and available under the MIT License.