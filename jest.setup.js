// Extend expect with custom matchers

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
  Accuracy: {
    Highest: 'highest'
  }
}));

// Mock @rnmapbox/maps
jest.mock('@rnmapbox/maps', () => ({
  setAccessToken: jest.fn(),
  MapView: 'MapView',
  PointAnnotation: 'PointAnnotation',
  Camera: 'Camera',
  StyleURL: {
    Dark: 'mapbox://styles/mapbox/dark-v10',
    Light: 'mapbox://styles/mapbox/light-v10'
  }
}));

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: 'Image'
}));

// Mock expo-asset
jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({ uri: 'mock-uri' }))
  }
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  isAssetLoaded: jest.fn(() => true),
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(() => Promise.resolve()),
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
}));
