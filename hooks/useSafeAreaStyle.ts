import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

/**
 * Custom hook for Dynamic Island and safe area handling
 * Provides pre-configured styles that respect safe areas
 */
export function useSafeAreaStyle() {
  const insets = useSafeAreaInsets();

  return {
    // Safe area styles for different use cases
    container: {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    
    // Header styles that avoid Dynamic Island
    header: {
      paddingTop: Math.max(insets.top, 44), // Ensure minimum 44pt header height
      paddingBottom: 12,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    
    // Content styles that respect safe areas
    content: {
      paddingTop: 8,
      paddingBottom: Math.max(insets.bottom, 8),
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    
    // Tab bar styles
    tabBar: {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    
    // Full screen content that goes edge-to-edge
    fullScreen: {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    
    // Modal content styles
    modal: {
      paddingTop: Math.max(insets.top, 20),
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    
    // Raw insets for custom usage
    insets,
    
    // Helper to check if device has Dynamic Island
    hasDynamicIsland: insets.top > 44,
    
    // Helper to check if device has home indicator
    hasHomeIndicator: insets.bottom > 0,
  };
}

/**
 * Pre-defined safe area styles for common use cases
 */
export const safeAreaStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  fullScreen: {
    flex: 1,
  },
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
