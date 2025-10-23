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
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaStyle } from '@/hooks/useSafeAreaStyle';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView from '@/components/MapView';
import ChatBox from '@/components/ChatBox';
import FeedbackModal from '@/components/FeedbackModal';
import { useApi } from '@/contexts/ApiContext';
import type { Activity, Chat } from '@/services/api';

const { width } = Dimensions.get('window');

export default function ActivityDetailsScreen() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showFeedback, setShowFeedback] = useState(false);
  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { activities, chats, loadActivities, loadChats } = useApi();

  // Load activity and chat data
  const loadActivityData = async () => {
    if (!id) return;
    
    await Promise.all([loadActivities(), loadChats()]);
    
    const activityData = activities.find(a => a._id === id);
    if (activityData) {
      setActivity(activityData);
      
      // Find associated chat
      const chatData = chats.find(c => c.activityId === activityData._id);
      if (chatData) {
        setChat(chatData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadActivityData();
  }, [id]);

  const handleJoinActivity = () => {
    Alert.alert(
      'Join Activity',
      'Request to join this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          onPress: () => {
            Alert.alert('Success', 'Join request sent!');
          }
        }
      ]
    );
  };

  const handleSendMessage = async (message: string) => {
    if (!chat) return;
    
    // Simulate sending message
    const newMessage = {
      id: Date.now().toString(),
      chatId: chat.id,
      senderId: 'current',
      senderName: 'You',
      text: message,
      timestamp: new Date().toISOString(),
      type: 'text' as const
    };

    // Update chat with new message
    setChat(prev => {
      if (!prev) return null;
      return {
        ...prev,
        lastMessage: {
          text: message,
          sender: 'You',
          timestamp: new Date().toISOString()
        },
        messages: [...prev.messages, newMessage]
      };
    });
  };

  const handleFeedback = async (feedback: any) => {
    Alert.alert('Thank you!', 'Your feedback has been recorded.');
    setShowFeedback(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, safeArea.content]}>
        <FontAwesome name="spinner" size={32} color="#000" />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={[styles.container, styles.centerContent, safeArea.content]}>
        <FontAwesome name="exclamation-triangle" size={48} color="#ccc" />
        <Text style={styles.errorTitle}>Activity not found</Text>
        <Text style={styles.errorSubtitle}>This activity may have been removed or doesn't exist.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, safeArea.content]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
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
          <FontAwesome name="info-circle" size={16} color={activeTab === 'details' ? "#000" : "#666"} />
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && styles.activeTab]}
          onPress={() => setActiveTab('map')}
        >
          <FontAwesome name="map-marker" size={16} color={activeTab === 'map' ? "#000" : "#666"} />
          <Text style={[styles.tabText, activeTab === 'map' && styles.activeTabText]}>
            Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <FontAwesome name="comment" size={16} color={activeTab === 'chat' ? "#000" : "#666"} />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Chat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
          {/* Activity Image */}
          {activity.imageUrl && (
            <View style={styles.imageContainer}>
              <Text style={styles.imagePlaceholder}>📸 Activity Image</Text>
            </View>
          )}

          {/* Basic Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Activity Information</Text>
            <View style={styles.infoRow}>
              <FontAwesome name="calendar" size={16} color="#666" />
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{formatDate(activity.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="clock-o" size={16} color="#666" />
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>{formatTime(activity.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="map-marker" size={16} color="#666" />
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{activity.location.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="users" size={16} color="#666" />
              <Text style={styles.infoLabel}>Participants:</Text>
              <Text style={styles.infoValue}>
                {activity.participants.length}/{activity.maxParticipants}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="tag" size={16} color="#666" />
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>{activity.category}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Description</Text>
            <Text style={styles.description}>{activity.description}</Text>
          </View>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {activity.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Participants */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Participants ({activity.participants.length})</Text>
            {activity.participants.map((participant) => (
              <View key={participant.id} style={styles.participantItem}>
                <View style={styles.participantAvatar}>
                  <FontAwesome name="user" size={16} color="#000" />
                </View>
                <Text style={styles.participantName}>{participant.name}</Text>
              </View>
            ))}
          </View>

          {/* Join Button */}
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinActivity}>
            <FontAwesome name="plus" size={20} color="#fff" />
            <Text style={styles.joinButtonText}>Join Activity</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {activeTab === 'map' && (
        <View style={styles.tabContent}>
          <MapView
            event={{
              location: activity.location.name,
              latitude: activity.location.latitude,
              longitude: activity.location.longitude
            }}
            participants={activity.participants}
          />
        </View>
      )}

      {activeTab === 'chat' && chat && (
        <View style={styles.tabContent}>
          <ChatBox
            messages={chat.messages}
            onSendMessage={handleSendMessage}
            onTyping={() => {}}
          />
        </View>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        visible={showFeedback}
        event={activity}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedback}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
  },
  tabContent: {
    flex: 1,
  },
  tabContentContainer: {
    padding: 16,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#000',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantName: {
    fontSize: 14,
    color: '#000',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 16,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});