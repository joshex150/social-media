import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export const DarkModeTest: React.FC = () => {
  const { isDark, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        Dark Mode Test
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Current theme: {isDark ? 'Dark' : 'Light'}
      </Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        Background: {colors.background}
      </Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        Foreground: {colors.foreground}
      </Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        Muted: {colors.muted}
      </Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        Border: {colors.border}
      </Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        Surface: {colors.surface}
      </Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        Accent: {colors.accent}
      </Text>
      
      <View style={styles.toggleContainer}>
        <ThemeToggle />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  toggleContainer: {
    marginTop: 20,
  },
});

export default DarkModeTest;
