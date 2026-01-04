import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Inline color definitions to avoid import issues
const colors = {
  light: {
    background: '#ffffff',
    foreground: '#000000',
    muted: '#666666',
    border: '#e5e5e5',
    surface: '#f8f9fa',
    accent: '#000000',
    primary: '#000000',
    secondary: '#666666',
    success: '#666666',
    warning: '#666666',
    error: '#666666',
    info: '#666666',
  },
  dark: {
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

type ColorScheme = 'light' | 'dark';

const getColors = (isDark: boolean) => {
  return isDark ? colors.dark : colors.light;
};

interface ThemeContextType {
  isDark: boolean;
  colors: ReturnType<typeof getColors>;
  toggleTheme: () => void;
  setTheme: (theme: ColorScheme) => void;
  followSystem: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize with system color scheme
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

  // Load theme preference from storage and listen to system changes
  useEffect(() => {
    let isMounted = true;
    
    const loadTheme = async () => {
      try {
        // Add a small delay to prevent race conditions
        await new Promise(resolve => setTimeout(resolve, 25));
        
        if (!isMounted) return;
        
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme && isMounted) {
          // User has a saved preference, use it
          setIsDark(savedTheme === 'dark');
        } else if (isMounted) {
          // No saved preference, follow system
          setIsDark(Appearance.getColorScheme() === 'dark');
        }
      } catch (error) {
        if (isMounted) {
          console.warn('Failed to load theme, using system default:', error);
          // Fallback to system scheme
          setIsDark(Appearance.getColorScheme() === 'dark');
        }
      }
    };

    loadTheme();

    // Listen to system color scheme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (isMounted) {
        // Only follow system changes if user hasn't set a preference
        AsyncStorage.getItem('theme').then((savedTheme) => {
          if (!savedTheme && isMounted) {
            setIsDark(colorScheme === 'dark');
          }
        }).catch(() => {
          // Ignore AsyncStorage errors
        });
      }
    });

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  // Save theme preference to storage
  const saveTheme = async (theme: ColorScheme) => {
    try {
      await AsyncStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    saveTheme(newTheme ? 'dark' : 'light');
  };

  const setTheme = (theme: ColorScheme) => {
    setIsDark(theme === 'dark');
    saveTheme(theme);
  };

  const followSystem = () => {
    // Remove saved preference to follow system
    AsyncStorage.removeItem('theme');
    setIsDark(Appearance.getColorScheme() === 'dark');
  };

  const colors = getColors(isDark);

  const value: ThemeContextType = {
    isDark,
    colors,
    toggleTheme,
    setTheme,
    followSystem,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
