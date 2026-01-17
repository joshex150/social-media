import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/contexts/ThemeContext';
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SPACING } from '@/constants/spacing';
import { circleAPI } from '@/services/api';
import { getAuthToken } from '@/services/api';

interface HotAlertButtonProps {
  activityId: string;
  activityDate: string;
  activityDuration: number;
  isParticipant: boolean;
}

export default function HotAlertButton({ 
  activityId, 
  activityDate, 
  activityDuration,
  isParticipant 
}: HotAlertButtonProps) {
  const { colors } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Check if activity is currently active
    const checkActivityStatus = () => {
      const now = new Date();
      const activityStart = new Date(activityDate);
      const activityEnd = new Date(activityStart.getTime() + (activityDuration * 60000));

      setIsActive(now >= activityStart && now <= activityEnd);
    };

    checkActivityStatus();
    const interval = setInterval(checkActivityStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [activityDate, activityDuration]);

  const handleHotAlert = () => {
    if (!isParticipant) {
      Alert.alert('Not a Participant', 'You must be a participant to send a hot alert.');
      return;
    }

    Alert.alert(
      '🚨 Hot Alert',
      'This will immediately notify your Inner Circle of a serious problem. Are you sure you need to send this alert?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSending(true);
              const token = await getAuthToken();
              if (!token) {
                Alert.alert('Error', 'Please log in to send a hot alert');
                return;
              }

              const response = await circleAPI.sendHotAlert(activityId, token);
              
              if (response.success) {
                Alert.alert(
                  'Alert Sent',
                  'Your Inner Circle has been notified. Help is on the way.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Error', response.message || 'Failed to send hot alert');
              }
            } catch (error) {
              console.error('Hot alert error:', error);
              Alert.alert('Error', 'Failed to send hot alert. Please try again.');
            } finally {
              setIsSending(false);
            }
          }
        }
      ]
    );
  };

  if (!isActive || !isParticipant) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.error }]}
      onPress={handleHotAlert}
      disabled={isSending}
      activeOpacity={0.8}
    >
      <FontAwesome name="exclamation-triangle" size={20} color={colors.background} />
      <Text style={[styles.buttonText, { color: colors.background }]}>
        {isSending ? 'Sending...' : 'Hot Alert'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PADDING.button.vertical + 4,
    paddingHorizontal: PADDING.button.horizontal * 1.5,
    borderRadius: BORDER_RADIUS.large,
    gap: GAPS.small,
    marginVertical: MARGIN.text.bottom,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
