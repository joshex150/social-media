import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import type { Activity } from '@/services/api';

interface ActivityCardProps {
  activity: Activity;
  onJoin?: (activityId: string) => void;
  onView?: (activityId: string) => void;
  onManage?: (activityId: string) => void;
  onLeave?: (activityId: string) => void;
  currentUserId?: string;
}

export default function ActivityCard({ 
  activity, 
  onJoin, 
  onView, 
  onManage, 
  onLeave, 
  currentUserId 
}: ActivityCardProps) {
  const { colors } = useTheme();
  const { _id: id, title, category, participants, maxParticipants, date, createdBy } = activity;
  
  // Check if current user is the creator
  const isCreator = createdBy && currentUserId && (
    (typeof createdBy === 'object' && createdBy !== null && (
      (createdBy as any)._id?.toString() === currentUserId?.toString() || 
      (createdBy as any).id?.toString() === currentUserId?.toString() ||
      createdBy.toString() === currentUserId?.toString()
    )) ||
    (typeof createdBy === 'string' && createdBy === currentUserId) ||
    (createdBy?.toString() === currentUserId?.toString())
  );
  
  // Check if current user is a participant (but not the creator)
  // Participants are now always populated as User objects from backend
  const isParticipant = !isCreator && currentUserId && Array.isArray(participants) && participants.some(p => {
    if (typeof p === 'object' && p !== null) {
      const participantId = (p as any).id || (p as any)._id || p;
      return participantId?.toString() === currentUserId?.toString();
    }
    return p?.toString() === currentUserId?.toString();
  });
  
  // Calculate participant count
  const participantCount = Array.isArray(participants) ? participants.length : 0;
  
  // Calculate distance (mock for now - would need user location)
  // Use a stable hash of the activity ID to generate consistent distance
  const distance = Math.abs(id.split('').reduce((hash, char) => {
    return hash + char.charCodeAt(0);
  }, 0)) % 10 + 1; // Mock distance between 1-10km
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} testID={`activity-card-${id}`}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]} testID="activity-title">{title}</Text>
        <Text style={[styles.category, { color: colors.muted }]} testID="activity-category">{category}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={[styles.distance, { color: colors.foreground }]} testID="activity-distance">{distance}km</Text>
        <Text style={[styles.participants, { color: colors.foreground }]}>
          {participantCount}/{maxParticipants} participants
        </Text>
        <Text style={[styles.time, { color: colors.foreground }]}>{formatTime(date)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.viewButton, { backgroundColor: colors.background, borderColor: colors.foreground }]}
          onPress={() => onView && onView(id)}
          testID="view-button"
        >
          <Text style={[styles.buttonText, { color: colors.foreground }]}>View</Text>
        </TouchableOpacity>
        
        {isCreator ? (
          <TouchableOpacity
            style={[styles.button, styles.manageButton, { backgroundColor: colors.accent }]}
            onPress={() => onManage && onManage(id)}
            testID="manage-button"
          >
            <Text style={[styles.buttonText, styles.manageButtonText, { color: colors.background }]}>Manage</Text>
          </TouchableOpacity>
        ) : isParticipant ? (
          <TouchableOpacity
            style={[styles.button, styles.leaveButton, { backgroundColor: colors.error }]}
            onPress={() => onLeave && onLeave(id)}
            testID="leave-button"
          >
            <Text style={[styles.buttonText, styles.leaveButtonText, { color: colors.background }]}>Leave</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.joinButton, { backgroundColor: colors.foreground }]}
            onPress={() => onJoin && onJoin(id)}
            testID="join-button"
          >
            <Text style={[styles.buttonText, styles.joinButtonText, { color: colors.background }]}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  distance: {
    fontSize: 14,
  },
  participants: {
    fontSize: 14,
  },
  time: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButton: {
    // Styles handled by backgroundColor
  },
  joinButton: {
    // Styles handled by backgroundColor
  },
  leaveButton: {
    // Styles handled by backgroundColor
  },
  viewButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  joinButtonText: {
    // Color handled by theme
  },
  manageButton: {
    // Background color handled by theme
  },
  manageButtonText: {
    // Color handled by theme
  },
  leaveButton: {
    // Background color handled by theme
  },
  leaveButtonText: {
    // Color handled by theme
  },
});
