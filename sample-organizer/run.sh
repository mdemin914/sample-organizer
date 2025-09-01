#!/bin/bash
# Run script for Sample Organizer

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Running setup..."
    ./setup.sh
fi

# Activate virtual environment
source venv/bin/activate

# Run the application
echo "Starting Sample Organizer..."
python src/main.py