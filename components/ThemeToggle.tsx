import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: number;
  style?: any;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24, style }) => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style
      ]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <FontAwesome
        name={isDark ? 'sun-o' : 'moon-o'}
        size={size}
        color={colors.foreground}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default ThemeToggle;
