import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withRepeat, withTiming, interpolate } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface LogoProps {
  size?: number;
  animated?: boolean;
  style?: ViewStyle;
  color?: string; // Color prop - use when ThemeProvider is not available
}

export default function Logo({ size = 48, animated = true, style, color = '#ffffff' }: LogoProps) {
  const progress = useSharedValue(0);
  
  useEffect(() => {
    if (animated) {
      progress.value = withRepeat(
        withTiming(1, { duration: 5882 }),
        -1,
        false
      );
    }
  }, [animated, progress]);

  const animatedProps = useAnimatedProps(() => {
    const offset = interpolate(progress.value, [0, 1], [0, 256.58892822265625]);
    return {
      strokeDashoffset: animated ? offset : 0,
    };
  });
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
      >
        <G>
          <AnimatedPath
            d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="butt"
            fill="none"
            strokeDasharray="238.62770324707031 17.961224975585935"
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
