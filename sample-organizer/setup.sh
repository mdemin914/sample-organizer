#!/bin/bash
# Setup script for Sample Organizer on Mac OS

echo "Sample Organizer Setup Script"
echo "============================"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed."
    echo "Please install Python 3.9 or later from python.org or using Homebrew:"
    echo "  brew install python@3.11"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "Found Python $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if ffmpeg is installed (required for some audio formats)
if ! command -v ffmpeg &> /dev/null; then
    echo ""
    echo "Warning: ffmpeg is not installed."
    echo "Some audio formats may not be supported."
    echo "To install ffmpeg, run: brew install ffmpeg"
fi

echo ""
echo "Setup complete!"
echo ""
echo "To run the application:"
echo "  ./run.sh"
echo ""
echo "Or manually:"
echo "  source venv/bin/activate"
echo "  python src/main.py"