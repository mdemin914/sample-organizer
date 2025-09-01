# Resources

This directory contains resources for the Sample Organizer application.

## Icons

- `app_icon.png` - Main application icon (1024x1024)
- `app_icon.icns` - Mac OS icon file

To create an .icns file from a PNG:
```bash
# Create icon set
mkdir AppIcon.iconset
sips -z 16 16     app_icon.png --out AppIcon.iconset/icon_16x16.png
sips -z 32 32     app_icon.png --out AppIcon.iconset/icon_16x16@2x.png
sips -z 32 32     app_icon.png --out AppIcon.iconset/icon_32x32.png
sips -z 64 64     app_icon.png --out AppIcon.iconset/icon_32x32@2x.png
sips -z 128 128   app_icon.png --out AppIcon.iconset/icon_128x128.png
sips -z 256 256   app_icon.png --out AppIcon.iconset/icon_128x128@2x.png
sips -z 256 256   app_icon.png --out AppIcon.iconset/icon_256x256.png
sips -z 512 512   app_icon.png --out AppIcon.iconset/icon_256x256@2x.png
sips -z 512 512   app_icon.png --out AppIcon.iconset/icon_512x512.png
sips -z 1024 1024 app_icon.png --out AppIcon.iconset/icon_512x512@2x.png

# Convert to icns
iconutil -c icns AppIcon.iconset
```

## Sample Files

Place sample audio files here for testing purposes.