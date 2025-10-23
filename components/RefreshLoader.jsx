import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const RefreshLoader = ({ 
  refreshing = false, 
  progress = 0, 
  title = "Pull to refresh",
  refreshingTitle = "Refreshing...",
  color = "#000",
  size = 20,
  showProgress = true,
  animationType = "spin", // "spin", "pulse", "bounce"
  customIcon = null
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (refreshing) {
      // Start spinning animation
      if (animationType === "spin") {
        Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ).start();
      }

      // Start scale animation based on type
      if (animationType === "pulse" || animationType === "bounce") {
        const scaleAnimation = animationType === "bounce" 
          ? Animated.sequence([
              Animated.timing(scaleValue, {
                toValue: 1.3,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(scaleValue, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
              }),
            ])
          : Animated.sequence([
              Animated.timing(scaleValue, {
                toValue: 1.2,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(scaleValue, {
                toValue: 0.8,
                duration: 600,
                useNativeDriver: true,
              }),
            ]);

        Animated.loop(scaleAnimation).start();
      }
    } else {
      // Stop animations
      spinValue.setValue(0);
      scaleValue.setValue(0.8);
    }
  }, [refreshing, animationType]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = scaleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const progressRotation = progress * 360;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Progress Ring with Glow Effect */}
        <View style={styles.progressContainer}>

          {/* Center Icon with Background Circle */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: color + '15' }]}>
              {refreshing ? (
                <Animated.View
                  style={[
                    styles.iconWrapper,
                    {
                      transform: [
                        animationType === "spin" && { rotate: spin },
                        (animationType === "pulse" || animationType === "bounce") && { scale: scale }
                      ].filter(Boolean)
                    }
                  ]}
                >
                  {customIcon || <FontAwesome name="refresh" size={size} color={color} />}
                </Animated.View>
              ) : (
                <Animated.View
                  style={[
                    styles.iconWrapper,
                    {
                      transform: [
                        { rotate: `${progressRotation}deg` }
                      ]
                    }
                  ]}
                >
                  {customIcon || <FontAwesome name="arrow-down" size={size} color={color} />}
                </Animated.View>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  content: {
    alignItems: 'center',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    marginTop: 15,
  },
  progressRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressFill: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transformOrigin: 'center',
  },
  progressGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transformOrigin: 'center',
    top: -5,
    left: -5,
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    marginHorizontal: 3,
  },
});

export default RefreshLoader;
