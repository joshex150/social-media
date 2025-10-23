import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ActivityCard({ activity, onJoin, onView }) {
  const { _id: id, title, category, participants, maxParticipants, date } = activity;
  
  // Calculate participant count
  const participantCount = Array.isArray(participants) ? participants.length : 0;
  
  // Calculate distance (mock for now - would need user location)
  // Use a stable hash of the activity ID to generate consistent distance
  const distance = Math.abs(id.split('').reduce((hash, char) => {
    return hash + char.charCodeAt(0);
  }, 0)) % 10 + 1; // Mock distance between 1-10km
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.card} testID={`activity-card-${id}`}>
      <View style={styles.header}>
        <Text style={styles.title} testID="activity-title">{title}</Text>
        <Text style={styles.category} testID="activity-category">{category}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.distance} testID="activity-distance">{distance}km</Text>
        <Text style={styles.participants}>
          {participantCount}/{maxParticipants} participants
        </Text>
        <Text style={styles.time}>{formatTime(date)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.viewButton]}
          onPress={() => onView(id)}
          testID="view-button"
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.joinButton]}
          onPress={() => onJoin(id)}
          testID="join-button"
        >
          <Text style={[styles.buttonText, styles.joinButtonText]}>Join</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  distance: {
    fontSize: 14,
    color: '#333',
  },
  participants: {
    fontSize: 14,
    color: '#333',
  },
  time: {
    fontSize: 14,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  joinButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  joinButtonText: {
    color: '#fff',
  },
});
