// Color scheme constants for Link Up app
export const colors = {
  light: {
    // Light mode colors
    background: '#ffffff',
    foreground: '#000000',
    muted: '#666666',
    border: '#e5e5e5',
    surface: '#f8f9fa',
    accent: '#007AFF',
    primary: '#007AFF',
    secondary: '#5856d6',
    success: '#34c759',
    warning: '#ff9500',
    error: '#ff3b30',
    info: '#5ac8fa',
  },
  dark: {
    // Monochrome minimalistic dark mode colors
    background: '#0A0A0A',
    foreground: '#EAEAEA',
    muted: '#777777',
    border: '#2A2A2A',
    surface: '#111111',
    accent: '#FFFFFF',
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    success: '#6B6B6B',
    warning: '#8A8A8A',
    error: '#999999',
    info: '#A1A1A1',
  },
} as const;

export type ColorScheme = 'light' | 'dark';

// Helper function to get colors based on theme
export const getColors = (isDark: boolean) => {
  return isDark ? colors.dark : colors.light;
};

// CSS-like color variables for consistency
export const colorVariables = {
  light: {
    '--background': colors.light.background,
    '--foreground': colors.light.foreground,
    '--color-muted': colors.light.muted,
    '--color-border': colors.light.border,
    '--color-surface': colors.light.surface,
    '--color-accent': colors.light.accent,
  },
  dark: {
    '--background': colors.dark.background,
    '--foreground': colors.dark.foreground,
    '--color-muted': colors.dark.muted,
    '--color-border': colors.dark.border,
    '--color-surface': colors.dark.surface,
    '--color-accent': colors.dark.accent,
  },
} as const;
