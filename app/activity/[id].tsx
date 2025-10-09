import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaStyle } from '@/hooks/useSafeAreaStyle';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView from '@/components/MapView';
import ChatBox from '@/components/ChatBox';
import FeedbackModal from '@/components/FeedbackModal';

const { width } = Dimensions.get('window');

export default function ActivityDetailsScreen() {
  const [activity, setActivity] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showFeedback, setShowFeedback] = useState(false);
  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    loadActivityDetails();
  }, [id]);

  const loadActivityDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();
      setActivity(data.activity);
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Failed to load activity details:', error);
      Alert.alert('Error', 'Failed to load activity details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      const response = await fetch(`/api/events/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          userId: 'user_123',
          userName: 'You',
          message: 'I\'d like to join this activity!',
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Join request sent!');
        loadActivityDetails(); // Refresh data
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send join request');
    }
  };

  const handleSendMessage = async (message) => {
    try {
      const response = await fetch(`/api/events/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          userId: 'user_123',
          userName: 'You',
        }),
      });

      if (response.ok) {
        // Message sent successfully
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleFeedback = async (feedback) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: id,
          type: 'activity',
          ...feedback,
        }),
      });

      if (response.ok) {
        setShowFeedback(false);
        Alert.alert('Success', 'Feedback submitted!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, safeArea.content]}>
        <Text style={styles.loadingText}>Loading activity details...</Text>
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={[styles.container, styles.centered, safeArea.content]}>
        <Text style={styles.errorText}>Activity not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, safeArea.content]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{activity.title}</Text>
        <TouchableOpacity onPress={() => setShowFeedback(true)} style={styles.feedbackButton}>
          <Text style={styles.feedbackButtonText}>Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && styles.activeTab]}
          onPress={() => setActiveTab('map')}
        >
          <Text style={[styles.tabText, activeTab === 'map' && styles.activeTabText]}>
            Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Chat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'details' && (
        <ScrollView style={styles.content}>
          <View style={styles.detailsCard}>
            <Text style={styles.category}>{activity.category}</Text>
            <Text style={styles.description}>{activity.description}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{activity.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>When:</Text>
              <Text style={styles.infoValue}>{formatTime(activity.startTime)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Participants:</Text>
              <Text style={styles.infoValue}>
                {participants.length} / {activity.maxParticipants}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance:</Text>
              <Text style={styles.infoValue}>{activity.distance}km away</Text>
            </View>
          </View>

          {/* Participants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participants</Text>
            {participants.map((participant) => (
              <View key={participant.id} style={styles.participantItem}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantInitial}>
                    {participant.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  <Text style={styles.participantStatus}>{participant.status}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Join Button */}
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <Text style={styles.joinButtonText}>Request to Join</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {activeTab === 'map' && (
        <View style={styles.mapContainer}>
          <MapView
            event={activity}
            participants={participants}
          />
        </View>
      )}

      {activeTab === 'chat' && (
        <ChatBox
          eventId={id}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          onSubmit={handleFeedback}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  feedbackButton: {
    paddingVertical: 4,
  },
  feedbackButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
  },
  content: {
    flex: 1,
  },
  detailsCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantInitial: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  participantStatus: {
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
});
