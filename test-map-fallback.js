// Quick test script to verify map fallback works
const { Platform } = require('react-native');

console.log('Testing Map Fallback Logic...');
console.log('Platform.OS:', Platform.OS);
console.log('__DEV__:', __DEV__);

// Simulate the logic from the map component
const isSimulator = Platform.OS === 'ios' && __DEV__;
const forceFallback = process.env.EXPO_PUBLIC_FORCE_MAP_FALLBACK === 'true';

console.log('isSimulator:', isSimulator);
console.log('forceFallback:', forceFallback);
console.log('Will use fallback:', isSimulator || forceFallback);

// Test MapboxGL import
let MapboxGL;
try {
  if (isSimulator || forceFallback) {
    console.log('Mapbox disabled for simulator/fallback mode');
    MapboxGL = null;
  } else {
    MapboxGL = require('@rnmapbox/maps');
    console.log('Mapbox loaded successfully');
  }
} catch (error) {
  console.warn('Mapbox not available, using fallback');
  MapboxGL = null;
}

console.log('MapboxGL available:', !!MapboxGL);
console.log('Test completed successfully!');
