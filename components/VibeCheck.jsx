import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function VibeCheck({ onFeedback }) {
  const [selected, setSelected] = useState(null);

  const vibes = [
    { id: 'happy', icon: 'smile-o', label: 'Happy' },
    { id: 'neutral', icon: 'meh-o', label: 'Neutral' },
    { id: 'sad', icon: 'frown-o', label: 'Sad' },
  ];

  const handleSelect = async (vibe) => {
    setSelected(vibe);
    if (onFeedback) {
      await onFeedback(vibe);
    }
  };

  return (
    <View style={styles.container} testID="vibe-check">
      <Text style={styles.title}>How are you feeling?</Text>
      <View style={styles.vibesContainer}>
        {vibes.map((vibe) => (
          <TouchableOpacity
            key={vibe.id}
            testID={`vibe-${vibe.id}`}
            style={[
              styles.vibeButton,
              selected === vibe.id && styles.vibeButtonSelected,
            ]}
            onPress={() => handleSelect(vibe.id)}
          >
            <FontAwesome name={vibe.icon} size={32} color="#000" />
            <Text style={styles.vibeLabel}>{vibe.label}</Text>
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
