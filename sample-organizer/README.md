# Sample Organizer for Mac OS

A desktop application for intelligently organizing musical samples on your hard drive.

## Features

- **Smart Categorization**: Automatically categorizes samples based on audio analysis and filename patterns
- **Directory Structure Visualization**: See and understand your output folder structure
- **Manual Override**: Review and manually categorize samples with low confidence matches
- **Batch Processing**: Process entire directories of samples efficiently
- **Progress Tracking**: Real-time progress updates during organization

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the application:
   ```bash
   python src/main.py
   ```

## Usage

1. Select your output directory (where samples will be organized)
2. Select your input directory (containing unorganized samples)
3. Click "Scan" to analyze the directory structures
4. Click "Organize" to start the categorization process
5. Review and manually categorize any uncertain matches
6. Complete the organization process

## Requirements

- Python 3.9+
- Mac OS 10.14+
- ffmpeg (for audio processing)