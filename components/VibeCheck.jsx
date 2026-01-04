import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

export default function VibeCheck({ onFeedback }) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  const vibes = [
    { id: 'happy', icon: 'smile-o', label: 'Happy' },
    { id: 'neutral', icon: 'meh-o', label: 'Neutral' },
    { id: 'sad', icon: 'frown-o', label: 'Sad' },
  ];

  // Check if VibeCheck should be visible on component mount
  useEffect(() => {
    checkVisibility();
  }, []);

  const checkVisibility = async () => {
    try {
      const lastAnswered = await AsyncStorage.getItem('vibeCheckLastAnswered');
      if (lastAnswered) {
        const lastAnsweredTime = parseInt(lastAnswered);
        const currentTime = Date.now();
        const timeDifference = currentTime - lastAnsweredTime;
        const sixtyMinutes = 60 * 60 * 1000; // 60 minutes in milliseconds
        
        if (timeDifference < sixtyMinutes) {
          setIsVisible(false);
        }
      }
    } catch (error) {
      // console.log('Error checking VibeCheck visibility:', error);
    }
  };

  const handleSelect = async (vibe) => {
    setSelected(vibe);
    
    // Store the current timestamp when answered
    try {
      await AsyncStorage.setItem('vibeCheckLastAnswered', Date.now().toString());
    } catch (error) {
      // console.log('Error storing VibeCheck timestamp:', error);
    }
    
    // Hide the component immediately after selection
    setIsVisible(false);
    
    if (onFeedback) {
      await onFeedback(vibe);
    }
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]} testID="vibe-check">
      <Text style={[styles.title, { color: colors.foreground }]}>How are you feeling?</Text>
      <View style={styles.vibesContainer}>
        {vibes.map((vibe) => (
          <TouchableOpacity
            key={vibe.id}
            testID={`vibe-${vibe.id}`}
            style={[
              styles.vibeButton,
              { borderColor: colors.border },
              selected === vibe.id && [styles.vibeButtonSelected, { borderColor: colors.accent, backgroundColor: colors.background }],
            ]}
            onPress={() => handleSelect(vibe.id)}
          >
            <FontAwesome name={vibe.icon} size={32} color={colors.foreground} />
            <Text style={[styles.vibeLabel, { color: colors.muted }]}>{vibe.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    paddingVertical: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  vibesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  vibeButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  vibeButtonSelected: {
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  vibeEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  vibeLabel: {
    fontSize: 12,
    color: '#666',
  },
});
