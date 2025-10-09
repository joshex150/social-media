# Map Fallback for Simulator

## Problem
Mapbox doesn't work properly on iOS Simulator and Android Emulator, causing the app to crash or not display maps correctly.

## Solution
Added automatic fallback detection that shows a placeholder view instead of the actual map when running on simulators.

## Features

### Automatic Detection
- **iOS Simulator**: Automatically detects and uses fallback
- **Android Emulator**: Uses fallback if Mapbox fails to load
- **Physical Devices**: Uses full Mapbox functionality

### Manual Override
You can force fallback mode by setting an environment variable:

```bash
# Force fallback mode (useful for testing)
EXPO_PUBLIC_FORCE_MAP_FALLBACK=true npx expo start
```

### Fallback UI
The fallback shows:
- Current location coordinates
- Number of friends nearby
- Number of events nearby
- Ghost mode status (if enabled)
- Clear indication that it's running in simulator mode

## Files Modified

1. **`app/(tabs)/map.tsx`** - Main map screen with fallback
2. **`components/MapView.jsx`** - MapView component with fallback

## Usage

The fallback is completely automatic - no code changes needed. The app will:
- Show the real map on physical devices
- Show the fallback UI on simulators
- Gracefully handle Mapbox loading errors

## Testing

To test the fallback UI:
1. Run on iOS Simulator - should show fallback automatically
2. Set `EXPO_PUBLIC_FORCE_MAP_FALLBACK=true` - forces fallback on any device
3. Run on physical device - should show real map

## Benefits

- ✅ No more crashes on simulator
- ✅ App remains functional for development
- ✅ Clear indication of simulator mode
- ✅ All map data still accessible
- ✅ Easy to test map-related features
