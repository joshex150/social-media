import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, RefreshControl, Dimensions } from "react-native";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ActivityCard from "@/components/ActivityCard";
import VibeCheck from "@/components/VibeCheck";
import RequestBanner from "@/components/RequestBanner";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

const { width } = Dimensions.get('window');

interface Activity {
  id: string;
  title: string;
  category: string;
  distance: string;
  participants: number;
  maxParticipants: number;
  startTime: number;
}

interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  activityId: string;
  activityTitle: string;
  message: string;
  timestamp: number;
}

interface Stats {
  totalActivities: number;
  totalConnections: number;
  streakDays: number;
  thisWeekActivities: number;
}

interface Notification {
  id: string;
  type: 'join_request' | 'activity_reminder' | 'new_activity' | 'achievement';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export default function HomeScreen() {
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ totalActivities: 0, totalConnections: 0, streakDays: 0, thisWeekActivities: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  useEffect(() => {
    loadHomeData();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timeInterval);
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load upcoming activities
      const activitiesResponse = await fetch('/api/events?upcoming=true&limit=5');
      const activitiesData = await activitiesResponse.json();
      setUpcomingActivities(activitiesData.activities || []);

      // Load join requests
      const requestsResponse = await fetch('/api/events/requests');
      const requestsData = await requestsResponse.json();
      setJoinRequests(requestsData.requests || []);

      // Load user stats
      const statsResponse = await fetch('/api/user/stats');
      const statsData = await statsResponse.json();
      setStats(statsData.stats || { totalActivities: 0, totalConnections: 0, streakDays: 0, thisWeekActivities: 0 });

      // Load notifications
      const notificationsResponse = await fetch('/api/notifications');
      const notificationsData = await notificationsResponse.json();
      setNotifications(notificationsData.notifications || []);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleJoinRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/events/requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        Alert.alert('Success', `Request ${action}ed successfully!`);
        loadHomeData(); // Refresh data
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} request`);
    }
  };

  const handleVibeFeedback = async (vibe: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'vibe', emotion: vibe }),
      });
    } catch (error) {
      console.error('Failed to submit vibe feedback:', error);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  return (
    <ScrollView 
      style={[styles.container, safeArea.content]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Enhanced Header */}
      <View style={[styles.header, safeArea.header]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.title}>Welcome back!</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {}}
          >
            <View style={styles.notificationIcon}>
              <FontAwesome name="bell" size={20} color="#000" />
              {getUnreadNotificationsCount() > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {getUnreadNotificationsCount()}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Connect with people around you</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statsCard, styles.statsCardPrimary]}>
            <View style={styles.statsIconContainer}>
              <FontAwesome name="calendar" size={20} color="#000" />
            </View>
            <Text style={[styles.statsNumber, styles.statsNumberWhite]}>{stats.totalActivities}</Text>
            <Text style={[styles.statsLabel, styles.statsLabelWhite]}>Activities</Text>
          </View>
          <View style={[styles.statsCard, styles.statsCardSecondary]}>
            <View style={[styles.statsIconContainer, styles.statsIconSecondary]}>
              <FontAwesome name="users" size={20} color="#000" />
            </View>
            <Text style={styles.statsNumber}>{stats.totalConnections}</Text>
            <Text style={styles.statsLabel}>Connections</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statsCard, styles.statsCardAccent]}>
            <View style={[styles.statsIconContainer, styles.statsIconAccent]}>
              <FontAwesome name="fire" size={20} color="#000" />
            </View>
            <Text style={styles.statsNumber}>{stats.streakDays}</Text>
            <Text style={styles.statsLabel}>Day Streak</Text>
          </View>
          <View style={[styles.statsCard, styles.statsCardSuccess]}>
            <View style={[styles.statsIconContainer, styles.statsIconSuccess]}>
              <FontAwesome name="line-chart" size={20} color="#000" />
            </View>
            <Text style={styles.statsNumber}>{stats.thisWeekActivities}</Text>
            <Text style={styles.statsLabel}>This Week</Text>
          </View>
        </View>
      </View>

      {/* Join Requests */}
      {joinRequests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Join Requests</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{joinRequests.length}</Text>
            </View>
          </View>
          {joinRequests.slice(0, 2).map((request) => (
            <RequestBanner
              key={request.id}
              request={request}
              onAccept={() => handleJoinRequest(request.id, 'accept')}
              onReject={() => handleJoinRequest(request.id, 'reject')}
            />
          ))}
          {joinRequests.length > 2 && (
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>View {joinRequests.length - 2} more</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Vibe Check */}
      <View style={styles.section}>
        <VibeCheck onFeedback={handleVibeFeedback} />
      </View>

      {/* Upcoming Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Activities</Text>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {upcomingActivities.length > 0 ? (
          upcomingActivities.slice(0, 3).map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onJoin={() => console.log('Join activity:', activity.id)}
              onView={() => router.push(`/activity/${activity.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="bullseye" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No upcoming activities</Text>
            <Text style={styles.emptySubtitle}>Check out the Explore tab to find activities</Text>
            <TouchableOpacity 
              style={styles.emptyActionButton}
              onPress={() => router.push('/explore')}
            >
              <Text style={styles.emptyActionText}>Explore Activities</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() =>{}}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {notifications.slice(0, 3).map((notification) => (
            <TouchableOpacity key={notification.id} style={styles.notificationItem}>
              <View style={styles.notificationIcon}>
                <FontAwesome 
                  name={
                    notification.type === 'join_request' ? 'user-plus' : 
                    notification.type === 'activity_reminder' ? 'clock-o' :
                    notification.type === 'new_activity' ? 'plus-circle' : 'trophy'
                  } 
                  size={20} 
                  color="#000" 
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{formatTime(notification.timestamp)}</Text>
              </View>
              {!notification.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: PADDING.header.horizontal,
    paddingVertical: PADDING.header.vertical,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: MARGIN.text.bottom,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    marginBottom: 2,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: "#666",
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    position: "relative",
  },
  notificationIconText: {
    fontSize: 24,
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: "#fff",
    fontWeight: FONT_WEIGHTS.bold,
  },
  statsContainer: {
    marginTop: PADDING.content.vertical,
    paddingHorizontal: PADDING.section.vertical,
    paddingVertical: PADDING.section.vertical,
    gap: GAPS.medium,
  },
  statsRow: {
    flexDirection: "row",
    gap: GAPS.medium,
  },
  statsCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.vertical + 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsCardPrimary: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  statsCardSecondary: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  statsCardAccent: {
    backgroundColor: "#f1f3f4",
    borderColor: "#dee2e6",
  },
  statsCardSuccess: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: GAPS.small,
  },
  statsIconSecondary: {
    backgroundColor: "#e9ecef",
  },
  statsIconAccent: {
    backgroundColor: "#dee2e6",
  },
  statsIconSuccess: {
    backgroundColor: "#e9ecef",
  },
  statsNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#1f2937",
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: FONT_SIZES.sm,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: FONT_WEIGHTS.medium,
  },
  statsNumberWhite: {
    color: "#fff",
  },
  statsLabelWhite: {
    color: "#e5e7eb",
  },
  section: {
    paddingHorizontal: PADDING.section.vertical,
    paddingVertical: PADDING.section.vertical,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: PADDING.content.vertical,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
  },
  badge: {
    backgroundColor: "#000",
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    color: "#fff",
    fontWeight: FONT_WEIGHTS.bold,
  },
  seeAllButton: {
    paddingHorizontal: PADDING.buttonSmall.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical,
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    color: "#000",
    fontWeight: FONT_WEIGHTS.medium,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAPS.small,
  },
  quickActionCard: {
    width: (width - PADDING.section.horizontal * 2 - GAPS.small) / 2,
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: GAPS.small,
  },
  primaryAction: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: 4,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: "#666",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: PADDING.content.horizontal * 2,
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.medium,
    marginTop: GAPS.small,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: PADDING.content.vertical,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: MARGIN.text.bottom,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    textAlign: "center",
    marginBottom: PADDING.content.vertical,
  },
  emptyActionButton: {
    backgroundColor: "#000",
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical,
  },
  emptyActionText: {
    fontSize: FONT_SIZES.sm,
    color: "#fff",
    fontWeight: FONT_WEIGHTS.medium,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  notificationTypeIcon: {
    fontSize: 24,
    marginRight: PADDING.content.vertical,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.xs,
    color: "#666",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
    color: "#999",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff4444",
  },
  bottomSpacing: {
    height: 100,
  },
});
