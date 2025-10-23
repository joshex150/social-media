import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { PADDING } from '@/constants/spacing';

/**
 * Custom hook for Dynamic Island and safe area handling
 * Provides pre-configured styles that respect safe areas
 */
export function useSafeAreaStyle() {
  const insets = useSafeAreaInsets();

  // Use stable defaults to prevent flicker
  const stableInsets = {
    top: insets.top || 44, // Default to 44 if not calculated yet
    bottom: insets.bottom || 0,
    left: insets.left || 0,
    right: insets.right || 0,
  };

  return {
    // Safe area styles for different use cases
    container: {
      paddingTop: stableInsets.top,
      paddingBottom: stableInsets.bottom,
      paddingLeft: stableInsets.left,
      paddingRight: stableInsets.right,
    },
    
    // Header styles that avoid Dynamic Island
    header: {
      paddingTop: Math.max(stableInsets.top, 44), // Ensure minimum 44pt header height
      paddingBottom: PADDING.header.vertical,
      // paddingLeft: 8,
      // paddingRight: 8,
    },
    
    // Content styles that respect safe areas
    content: {
      paddingTop: PADDING.content.vertical,
      paddingBottom: Math.max(stableInsets.bottom, PADDING.content.vertical),
      paddingLeft: 8,
      paddingRight: 8,
    },
    
    // Tab bar styles
    tabBar: {
      paddingBottom: stableInsets.bottom,
      paddingLeft: stableInsets.left,
      paddingRight: stableInsets.right,
    },
    
    // Full screen content that goes edge-to-edge
    fullScreen: {
      paddingTop: stableInsets.top,
      paddingBottom: stableInsets.bottom,
    },
    
    // Modal content styles
    modal: {
      paddingTop: Math.max(stableInsets.top, 20),
      paddingBottom: stableInsets.bottom,
      paddingLeft: stableInsets.left,
      paddingRight: stableInsets.right,
    },
    
    // Raw insets for custom usage
    insets: stableInsets,
    
    // Helper to check if device has Dynamic Island
    hasDynamicIsland: stableInsets.top > 44,
    
    // Helper to check if device has home indicator
    hasHomeIndicator: stableInsets.bottom > 0,
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
