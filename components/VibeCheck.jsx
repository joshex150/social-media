import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

export default function VibeCheck({ onFeedback }) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef(null);

  const modes = [
    { 
      id: 'normal', 
      icon: 'compass', 
      label: 'Normal Mode',
      description: 'Activities based on your interests, paired with explorers'
    },
    { 
      id: 'side-quest', 
      icon: 'rocket', 
      label: 'Side Quest Mode',
      description: 'New adventures, paired with adventurers'
    },
  ];

  // For testing: use 2 minutes instead of 60 minutes
  // Change this to test the hide functionality faster
  const SIXTY_MINUTES = __DEV__ ? 2 * 60 * 1000 : 60 * 60 * 1000; // 2 minutes in dev, 60 minutes in production

  const loadSelectedMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('activityMode');
      if (savedMode) {
        setSelected(savedMode);
      } else {
        setSelected(null);
      }
    } catch (error) {
      // console.log('Error loading selected mode:', error);
    }
  };

  const checkVisibility = useCallback(async () => {
    try {
      const savedMode = await AsyncStorage.getItem('activityMode');
      const lastSelectedTime = await AsyncStorage.getItem('activityModeSelectedTime');
      
      // Clear any existing timeout first
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      
      if (!savedMode) {
        // No mode selected, always show
        setIsVisible(true);
        return;
      }

      if (!lastSelectedTime) {
        // Mode exists but no timestamp (cleared from privacy settings), show it
        setIsVisible(true);
        return;
      }

      const lastSelectedTimestamp = parseInt(lastSelectedTime);
      const currentTime = Date.now();
      const timeDifference = currentTime - lastSelectedTimestamp;
      const remainingTime = SIXTY_MINUTES - timeDifference;

      if (timeDifference >= SIXTY_MINUTES) {
        // 60 minutes have passed, show the component again
        setIsVisible(true);
      } else {
        // Still within 60 minutes, keep it hidden and set up timeout to show again
        setIsVisible(false);
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(true);
          hideTimeoutRef.current = null;
        }, remainingTime);
      }
    } catch (error) {
      // On error, show the component
      setIsVisible(true);
    }
  }, []);

  // Load selected mode and check visibility on component mount
  useEffect(() => {
    loadSelectedMode();
    checkVisibility();
    
    // Set up interval to check visibility every minute
    const interval = setInterval(() => {
      checkVisibility();
    }, 60000); // Check every minute

    // Listen for app state changes to check visibility when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkVisibility();
      }
    });

    return () => {
      clearInterval(interval);
      subscription?.remove();
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [checkVisibility]);

  // Check visibility when screen comes into focus (e.g., returning from privacy settings)
  useFocusEffect(
    useCallback(() => {
      checkVisibility();
      loadSelectedMode(); // Also reload the selected mode
    }, [checkVisibility])
  );

  const handleSelect = async (mode) => {
    setSelected(mode);
    
    // Store the selected mode and timestamp
    try {
      const timestamp = Date.now().toString();
      await AsyncStorage.setItem('activityMode', mode);
      await AsyncStorage.setItem('activityModeSelectedTime', timestamp);
      
      // Hide immediately after selection
      setIsVisible(false);
      
      // Clear any existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      
      // Set up timeout to show again after 60 minutes
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        hideTimeoutRef.current = null;
      }, SIXTY_MINUTES);
    } catch (error) {
      // Ignore errors
    }
    
    if (onFeedback) {
      await onFeedback(mode);
    }
  };

  const handleClear = async () => {
    setSelected(null);
    try {
      await AsyncStorage.removeItem('activityMode');
      await AsyncStorage.removeItem('activityModeSelectedTime');
      setIsVisible(true); // Show it again when cleared
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (onFeedback) {
        await onFeedback(null);
      }
    } catch (error) {
      // Ignore errors
    }
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]} testID="vibe-check">
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Activity Mode</Text>
        {selected && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
          >
            <FontAwesome name="times-circle" size={16} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.modesContainer}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            testID={`mode-${mode.id}`}
            style={[
              styles.modeButton,
              { borderColor: colors.border },
              selected === mode.id && [styles.modeButtonSelected, { borderColor: colors.accent, backgroundColor: colors.background }],
            ]}
            onPress={() => handleSelect(mode.id)}
          >
            <FontAwesome name={mode.icon} size={28} color={selected === mode.id ? colors.accent : colors.foreground} />
            <Text style={[styles.modeLabel, { color: selected === mode.id ? colors.accent : colors.foreground }]}>{mode.label}</Text>
            <Text style={[styles.modeDescription, { color: colors.muted }]}>{mode.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {!selected && (
        <Text style={[styles.noModeText, { color: colors.muted }]}>No mode selected - showing all activities</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    paddingVertical: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  clearButton: {
    padding: 4,
  },
  modesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 120,
    justifyContent: 'center',
  },
  modeButtonSelected: {
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  noModeText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
