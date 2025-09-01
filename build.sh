#!/bin/bash

# Sample Organizer Build Script
# This script builds the macOS app using xcodebuild

echo "Building Sample Organizer..."

# Check if xcodebuild is available
if ! command -v xcodebuild &> /dev/null; then
    echo "Error: xcodebuild not found. Please install Xcode Command Line Tools."
    exit 1
fi

# Build the project
xcodebuild -project SampleOrganizer.xcodeproj \
           -scheme SampleOrganizer \
           -configuration Release \
           -derivedDataPath build \
           build

if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "App location: build/Build/Products/Release/SampleOrganizer.app"
    
    # Optional: Copy to Applications folder
    read -p "Would you like to install to Applications folder? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp -R "build/Build/Products/Release/SampleOrganizer.app" "/Applications/"
        echo "Installed to Applications folder!"
    fi
else
    echo "Build failed!"
    exit 1
fi