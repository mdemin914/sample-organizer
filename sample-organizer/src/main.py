#!/usr/bin/env python3
"""
Sample Organizer - Main Application Entry Point
"""

import sys
import os
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Check for required dependencies
try:
    import tkinter as tk
except ImportError:
    print("Error: tkinter is not installed. On Mac, it should come with Python.")
    print("Try: brew install python-tk")
    sys.exit(1)

try:
    import customtkinter
except ImportError:
    print("Error: customtkinter is not installed.")
    print("Please run: pip install customtkinter")
    sys.exit(1)

try:
    import librosa
except ImportError:
    print("Error: librosa is not installed.")
    print("Please run: pip install librosa")
    sys.exit(1)

try:
    import pygame
except ImportError:
    print("Error: pygame is not installed.")
    print("Please run: pip install pygame")
    sys.exit(1)

from ui.main_window import SampleOrganizerApp


def main():
    """Main entry point for the application."""
    try:
        app = SampleOrganizerApp()
        app.run()
    except Exception as e:
        print(f"Error running application: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()