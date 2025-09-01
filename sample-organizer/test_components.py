#!/usr/bin/env python3
"""
Test script to verify components work correctly
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_imports():
    """Test that all imports work."""
    print("Testing imports...")
    
    try:
        from core import DirectoryScanner, SampleAnalyzer, SampleOrganizer
        print("✓ Core modules imported successfully")
    except Exception as e:
        print(f"✗ Error importing core modules: {e}")
        return False
        
    try:
        from ui import SampleOrganizerApp, DirectoryTreeWidget, SampleReviewDialog, ProgressDialog
        print("✓ UI modules imported successfully")
    except Exception as e:
        print(f"✗ Error importing UI modules: {e}")
        return False
        
    return True

def test_directory_scanner():
    """Test directory scanner functionality."""
    print("\nTesting DirectoryScanner...")
    
    try:
        from pathlib import Path
        from core import DirectoryScanner
        
        scanner = DirectoryScanner()
        
        # Test with current directory
        result = scanner.scan_directory(Path('.'))
        print(f"✓ Scanned current directory: {result.file_count} files found")
        
        # Test suggested structure
        suggested = scanner.suggest_directory_structure()
        print(f"✓ Generated suggested structure with {len(suggested.children)} top-level categories")
        
        return True
    except Exception as e:
        print(f"✗ Error testing DirectoryScanner: {e}")
        return False

def test_sample_analyzer():
    """Test sample analyzer functionality."""
    print("\nTesting SampleAnalyzer...")
    
    try:
        from core import SampleAnalyzer
        
        analyzer = SampleAnalyzer()
        print("✓ SampleAnalyzer created successfully")
        
        # Test filename analysis
        test_names = ["kick_01.wav", "snare_drum.mp3", "hihat_closed.aif"]
        for name in test_names:
            cat, subcat = analyzer._analyze_filename(name)
            print(f"  - {name} → {cat}/{subcat}")
            
        return True
    except Exception as e:
        print(f"✗ Error testing SampleAnalyzer: {e}")
        return False

def main():
    """Run all tests."""
    print("Sample Organizer Component Tests")
    print("================================\n")
    
    all_passed = True
    
    # Test imports
    if not test_imports():
        all_passed = False
        
    # Test directory scanner
    if not test_directory_scanner():
        all_passed = False
        
    # Test sample analyzer
    if not test_sample_analyzer():
        all_passed = False
        
    print("\n" + "="*40)
    if all_passed:
        print("✓ All tests passed!")
    else:
        print("✗ Some tests failed")
        
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())