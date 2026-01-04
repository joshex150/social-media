/**
 * Themed components for Link Up app with custom dark mode support
 */

import React from 'react';
import { Text as DefaultText, View as DefaultView, TouchableOpacity as DefaultTouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type TouchableOpacityProps = ThemeProps & React.ComponentProps<typeof DefaultTouchableOpacity>;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ReturnType<typeof useTheme>['colors']
) {
  const { isDark, colors } = useTheme();
  const colorFromProps = props[isDark ? 'dark' : 'light'];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'foreground');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function TouchableOpacity(props: TouchableOpacityProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'surface');

  return <DefaultTouchableOpacity style={[{ backgroundColor }, style]} {...otherProps} />;
}
