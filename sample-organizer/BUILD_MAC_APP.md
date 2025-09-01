# Building Sample Organizer as a Mac App

This guide explains how to package the Sample Organizer as a native Mac application.

## Prerequisites

1. Install py2app:
   ```bash
   pip install py2app
   ```

2. Ensure all dependencies are installed:
   ```bash
   ./setup.sh
   ```

## Creating the Mac App Bundle

1. Create a setup.py file for py2app:

```python
from setuptools import setup

APP = ['src/main.py']
DATA_FILES = ['resources']
OPTIONS = {
    'argv_emulation': True,
    'packages': ['tkinter', 'customtkinter', 'librosa', 'pygame', 'sklearn', 'numpy', 'pandas'],
    'includes': ['ui', 'core', 'utils'],
    'iconfile': 'resources/app_icon.icns',
    'plist': {
        'CFBundleName': 'Sample Organizer',
        'CFBundleDisplayName': 'Sample Organizer',
        'CFBundleGetInfoString': "Organize your music samples intelligently",
        'CFBundleIdentifier': "com.yourcompany.sampleorganizer",
        'CFBundleVersion': "1.0.0",
        'CFBundleShortVersionString': "1.0.0",
        'NSHumanReadableCopyright': u"Copyright © 2024, Your Name, All Rights Reserved",
        'NSRequiresAquaSystemAppearance': False,  # Support dark mode
    }
}

setup(
    app=APP,
    data_files=DATA_FILES,
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)
```

2. Build the app:
   ```bash
   python setup.py py2app
   ```

3. The app will be created in the `dist` folder.

## Creating a DMG for Distribution

1. Install create-dmg (if not already installed):
   ```bash
   brew install create-dmg
   ```

2. Create the DMG:
   ```bash
   create-dmg \
     --volname "Sample Organizer" \
     --volicon "resources/app_icon.icns" \
     --window-pos 200 120 \
     --window-size 600 400 \
     --icon-size 100 \
     --icon "Sample Organizer.app" 175 190 \
     --hide-extension "Sample Organizer.app" \
     --app-drop-link 425 190 \
     "Sample-Organizer-1.0.0.dmg" \
     "dist/"
   ```

## Code Signing (Optional but Recommended)

To avoid Gatekeeper warnings:

1. Get a Developer ID certificate from Apple
2. Sign the app:
   ```bash
   codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" "dist/Sample Organizer.app"
   ```

3. Verify the signature:
   ```bash
   codesign --verify --verbose "dist/Sample Organizer.app"
   ```

## Notarization (Required for distribution outside Mac App Store)

1. Create an app-specific password at appleid.apple.com
2. Store credentials:
   ```bash
   xcrun altool --store-password-in-keychain-item "AC_PASSWORD" -u "your@email.com" -p "app-specific-password"
   ```

3. Notarize:
   ```bash
   xcrun altool --notarize-app --primary-bundle-id "com.yourcompany.sampleorganizer" --username "your@email.com" --password "@keychain:AC_PASSWORD" --file "Sample-Organizer-1.0.0.dmg"
   ```

4. Check status:
   ```bash
   xcrun altool --notarization-history 0 -u "your@email.com" -p "@keychain:AC_PASSWORD"
   ```

## Alternative: Using PyInstaller

If py2app has issues, you can use PyInstaller:

```bash
pip install pyinstaller

pyinstaller --onefile --windowed \
  --name "Sample Organizer" \
  --icon resources/app_icon.icns \
  --add-data "resources:resources" \
  src/main.py
```

The app will be in the `dist` folder.