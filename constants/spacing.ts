/**
 * Standardized spacing system for consistent padding and margins
 * Based on 4px grid system for optimal mobile design
 */

export const SPACING = {
  // Base spacing units (4px grid)
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 20,   // 20px
  xxl: 24,  // 24px
  xxxl: 32, // 32px
  huge: 48, // 48px
} as const;

export const PADDING = {
  // Screen-level padding
  screen: {
    horizontal: SPACING.lg,    // 16px
    vertical: SPACING.sm,      // 8px
  },
  
  // Header padding
  header: {
    horizontal: SPACING.lg,    // 16px
    vertical: SPACING.md,      // 12px
  },
  
  // Content padding
  content: {
    horizontal: SPACING.lg,    // 16px
    vertical: SPACING.sm,      // 8px
  },
  
  // Card padding
  card: {
    horizontal: SPACING.md,    // 12px
    vertical: SPACING.md,      // 12px
  },
  
  // Input padding
  input: {
    horizontal: SPACING.md,    // 12px
    vertical: SPACING.sm,      // 8px
  },
  
  // Button padding
  button: {
    horizontal: SPACING.lg,    // 16px
    vertical: SPACING.sm,      // 8px
  },
  
  // Small button padding
  buttonSmall: {
    horizontal: SPACING.md,    // 12px
    vertical: SPACING.xs,      // 4px
  },
  
  // Section padding
  section: {
    horizontal: SPACING.lg,    // 16px
    vertical: SPACING.sm,      // 8px
  },
  
  // List padding
  list: {
    horizontal: SPACING.lg,    // 16px
    vertical: SPACING.sm,      // 8px
  },
} as const;

export const MARGIN = {
  // Component margins
  component: {
    bottom: SPACING.md,        // 12px
    top: SPACING.md,           // 12px
  },
  
  // Section margins
  section: {
    bottom: SPACING.lg,        // 16px
    top: SPACING.lg,           // 16px
  },
  
  // Text margins
  text: {
    bottom: SPACING.xs,        // 4px
    top: SPACING.xs,           // 4px
  },
  
  // Card margins
  card: {
    bottom: SPACING.sm,        // 8px
    top: SPACING.sm,           // 8px
  },
} as const;

export const GAPS = {
  // Flex gaps
  small: SPACING.sm,           // 8px
  medium: SPACING.md,          // 12px
  large: SPACING.lg,           // 16px
} as const;

export const BORDER_RADIUS = {
  small: 6,
  medium: 8,
  large: 12,
  xl: 16,
  full: 999,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
} as const;

export const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;
