import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaStyle } from '@/hooks/useSafeAreaStyle';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import MapView from '@/components/MapView';
import ChatBox from '@/components/ChatBox';
import FeedbackModal from '@/components/FeedbackModal';
import HotAlertButton from '@/components/HotAlertButton';
import { useApi } from '@/contexts/ApiContext';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import CustomAlert from '@/components/CustomAlert';
import type { Activity, Chat } from '@/services/api';
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SPACING } from '@/constants/spacing';
import { circleAPI } from '@/services/api';
import { getAuthToken } from '@/services/api';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function ActivityDetailsScreen() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [locationTrackingActive, setLocationTrackingActive] = useState(false);
  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const { user } = useApi();
  const { activities, chats, loadActivities, loadChats } = useApi();
  const { alert, showAlert, hideAlert } = useCustomAlert();

  // Load activity and chat data
  const loadActivityData = async () => {
    if (!id) return;
    
    // Activities and chats are loaded centrally by ApiContext
    
    const activityData = activities.find(a => a._id === id);
    if (activityData) {
      setActivity(activityData);
      
      // Check if user is a participant (participants are now always populated as User objects)
      const participant = activityData.participants.some((p) => {
        if (typeof p === 'object' && p !== null) {
          const participantId = (p as any).id || (p as any)._id || p;
          return participantId?.toString() === user?.id?.toString();
        }
        const pStr = typeof p === 'string' ? p : String(p);
        return pStr === user?.id?.toString();
      });
      setIsParticipant(participant);
      
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
  }, [id, activities, chats, user]);

  // Location tracking during active events
  useEffect(() => {
    if (!activity || !isParticipant || !user?.id) return;

    let locationInterval: ReturnType<typeof setInterval> | null = null;
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const startLocationTracking = async () => {
      try {
        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          return;
        }

        // Check if location services are available
        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          console.log('Location services are disabled');
          return;
        }

        // Start location tracking
        locationInterval = setInterval(async () => {
          if (!activity || !locationTrackingActive) {
            if (locationInterval) {
              clearInterval(locationInterval);
              locationInterval = null;
            }
            return;
          }

          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });

            const token = await getAuthToken();
            if (token) {
              await circleAPI.updateLocation(
                activity._id,
                location.coords.latitude,
                location.coords.longitude,
                location.coords.accuracy || undefined,
                token
              );
            }
          } catch (error) {
            console.error('Error updating location:', error);
            // Stop tracking on persistent errors
            if (locationInterval) {
              clearInterval(locationInterval);
              locationInterval = null;
            }
            setLocationTrackingActive(false);
          }
        }, 30000); // Update every 30 seconds
      } catch (error) {
        console.error('Error starting location tracking:', error);
        setLocationTrackingActive(false);
      }
    };

    const checkAndStartTracking = async () => {
      const now = new Date();
      const activityDate = new Date(activity.date);
      const endDate = new Date(activityDate.getTime() + (activity.duration * 60000));

      // Only track during active event
      if (now >= activityDate && now <= endDate) {
        if (!locationTrackingActive) {
          setLocationTrackingActive(true);
          await startLocationTracking();
        }
      } else {
        setLocationTrackingActive(false);
        if (locationInterval) {
          clearInterval(locationInterval);
          locationInterval = null;
        }
      }
    };

    checkAndStartTracking();
    checkInterval = setInterval(checkAndStartTracking, 60000); // Check every minute

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (locationInterval) {
        clearInterval(locationInterval);
      }
      setLocationTrackingActive(false);
    };
  }, [activity, isParticipant, user, locationTrackingActive]);

  const handleJoinActivity = () => {
    showAlert(
      'Join Activity',
      'Request to join this activity?',
      'info',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { 
          text: 'Join', 
          onPress: () => {
            showAlert('Success', 'Join request sent!', 'success');
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
    showAlert('Thank you!', 'Your feedback has been recorded.', 'success');
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
      <View style={[styles.container, styles.centerContent, safeArea.content, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.foreground} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading activity...</Text>
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={[styles.container, styles.centerContent, safeArea.content, { backgroundColor: colors.background }]}>
        <FontAwesome name="exclamation-triangle" size={48} color={colors.muted} />
        <Text style={[styles.errorTitle, { color: colors.foreground }]}>Activity not found</Text>
        <Text style={[styles.errorSubtitle, { color: colors.muted }]}>This activity may have been removed or doesn't exist.</Text>
        <TouchableOpacity 
          style={[styles.errorBackButton, { backgroundColor: colors.foreground }]} 
          onPress={() => router.back()}
        >
          <Text style={[styles.errorBackButtonText, { color: colors.background }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Safe Area */}
      <View style={[styles.headerContainer, safeArea.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{activity.title}</Text>
          <TouchableOpacity onPress={() => setShowFeedback(true)} style={styles.feedbackButton}>
            <FontAwesome name="heart-o" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && [styles.activeTab, { borderBottomColor: colors.foreground }]]}
          onPress={() => setActiveTab('details')}
        >
          <FontAwesome name="info-circle" size={18} color={activeTab === 'details' ? colors.foreground : colors.muted} />
          <Text style={[styles.tabText, { color: activeTab === 'details' ? colors.foreground : colors.muted }]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && [styles.activeTab, { borderBottomColor: colors.foreground }]]}
          onPress={() => setActiveTab('map')}
        >
          <FontAwesome name="map-marker" size={18} color={activeTab === 'map' ? colors.foreground : colors.muted} />
          <Text style={[styles.tabText, { color: activeTab === 'map' ? colors.foreground : colors.muted }]}>
            Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && [styles.activeTab, { borderBottomColor: colors.foreground }]]}
          onPress={() => setActiveTab('chat')}
        >
          <FontAwesome name="comment" size={18} color={activeTab === 'chat' ? colors.foreground : colors.muted} />
          <Text style={[styles.tabText, { color: activeTab === 'chat' ? colors.foreground : colors.muted }]}>
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
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Activity Information</Text>
            <View style={styles.infoRow}>
              <FontAwesome name="calendar" size={18} color={colors.muted} />
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Date:</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{formatDate(activity.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="clock-o" size={18} color={colors.muted} />
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Time:</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{formatTime(activity.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="map-marker" size={18} color={colors.muted} />
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Location:</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{activity.location.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="users" size={18} color={colors.muted} />
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Participants:</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>
                {activity.participants.length}/{activity.maxParticipants}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="tag" size={18} color={colors.muted} />
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Category:</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{activity.category}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Description</Text>
            <Text style={[styles.description, { color: colors.foreground }]}>{activity.description}</Text>
          </View>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.infoTitle, { color: colors.foreground }]}>Tags</Text>
              <View style={styles.tagsContainer}>
                {activity.tags.map((tag, index) => (
                  <View key={`tag-${tag}-${index}`} style={[styles.tag, { backgroundColor: colors.border }]}>
                    <Text style={[styles.tagText, { color: colors.foreground }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Participants */}
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Participants ({activity.participants.length})</Text>
            {activity.participants.map((participant) => (
              <View key={`participant-${participant.id}`} style={styles.participantItem}>
                <View style={[styles.participantAvatar, { backgroundColor: colors.border }]}>
                  <FontAwesome name="user" size={18} color={colors.foreground} />
                </View>
                <Text style={[styles.participantName, { color: colors.foreground }]}>{participant.name}</Text>
              </View>
            ))}
          </View>

          {/* Hot Alert Button - Only shows during active event for participants */}
          {isParticipant && activity && (
            <HotAlertButton
              activityId={activity._id}
              activityDate={activity.date}
              activityDuration={activity.duration}
              isParticipant={isParticipant}
            />
          )}

          {/* Join Button */}
          {!isParticipant && (
            <TouchableOpacity style={[styles.joinButton, { backgroundColor: colors.foreground }]} onPress={handleJoinActivity}>
              <FontAwesome name="plus" size={20} color={colors.background} />
              <Text style={[styles.joinButtonText, { color: colors.background }]}>Join Activity</Text>
            </TouchableOpacity>
          )}

          {/* Location Tracking Indicator */}
          {locationTrackingActive && (
            <View style={[styles.trackingIndicator, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <FontAwesome name="map-marker" size={16} color={colors.accent} />
              <Text style={[styles.trackingText, { color: colors.muted }]}>
                Live location tracking active
              </Text>
            </View>
          )}
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
            messages={chat.messages || []}
            onSendMessage={handleSendMessage}
            onTyping={() => {}}
            onLoadMore={() => {}}
            hasMore={false}
            isLoadingMore={false}
            typingUsers={[]}
            currentUserId={user?.id}
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

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: PADDING.content.horizontal,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    marginTop: MARGIN.section.top,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: MARGIN.section.top,
    marginBottom: MARGIN.text.bottom,
  },
  errorSubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: MARGIN.section.bottom,
    paddingHorizontal: PADDING.content.horizontal,
  },
  errorBackButton: {
    paddingHorizontal: PADDING.button.horizontal * 2,
    paddingVertical: PADDING.button.vertical + 4,
    borderRadius: BORDER_RADIUS.large,
  },
  errorBackButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  headerContainer: {
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.header.vertical,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    flex: 1,
    marginHorizontal: MARGIN.section.top,
  },
  feedbackButton: {
    padding: SPACING.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PADDING.header.vertical + 2,
    paddingHorizontal: PADDING.content.horizontal,
    gap: GAPS.small,
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  tabContent: {
    flex: 1,
  },
  tabContentContainer: {
    padding: PADDING.content.horizontal,
    paddingBottom: PADDING.content.horizontal * 2,
  },
  imageContainer: {
    height: 200,
    borderRadius: BORDER_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: MARGIN.section.bottom,
  },
  imagePlaceholder: {
    fontSize: FONT_SIZES.md,
  },
  infoCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal + 4,
    marginBottom: MARGIN.section.bottom,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: MARGIN.component.bottom,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MARGIN.text.bottom + 4,
    gap: GAPS.small,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    minWidth: 90,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    flex: 1,
    fontWeight: FONT_WEIGHTS.medium,
  },
  description: {
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAPS.small,
  },
  tag: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MARGIN.text.bottom + 4,
    gap: GAPS.medium,
  },
  participantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.large,
    paddingVertical: PADDING.button.vertical + 8,
    marginTop: MARGIN.section.top,
    gap: GAPS.medium,
  },
  joinButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PADDING.buttonSmall.vertical,
    paddingHorizontal: PADDING.button.horizontal,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    marginTop: MARGIN.text.bottom,
    gap: GAPS.small,
  },
  trackingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
});