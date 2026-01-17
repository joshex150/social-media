import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Logo, { LogoProps } from './Logo';

/**
 * ThemedLogo - A theme-responsive version of Logo
 * Use this component when ThemeProvider is available (in the main app)
 * For splash screens and loading states before ThemeProvider, use Logo directly
 */
export default function ThemedLogo(props: Omit<LogoProps, 'color'>) {
  const { colors } = useTheme();
  
  return <Logo {...props} color={colors.foreground} />;
}
