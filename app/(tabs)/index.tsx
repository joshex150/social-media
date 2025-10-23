import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, RefreshControl, Dimensions } from "react-native";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ActivityCard from "@/components/ActivityCard";
import VibeCheck from "@/components/VibeCheck";
import RequestBanner from "@/components/RequestBanner";
import RefreshLoader from "@/components/RefreshLoader";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import type { Activity, JoinRequest, Notification } from "@/services/api";

const { width } = Dimensions.get('window');

interface Stats {
  totalActivities: number;
  totalConnections: number;
  streakDays: number;
  thisWeekActivities: number;
}

export default function HomeScreen() {
  const [stats, setStats] = useState<Stats>({
    totalActivities: 0,
    totalConnections: 0,
    streakDays: 0,
    thisWeekActivities: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [vibeFeedback, setVibeFeedback] = useState<string | null>(null);

  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { 
    user, 
    activities, 
    notifications, 
    joinRequests,
    loadActivities, 
    loadNotifications, 
    refreshData,
    joinActivity,
    respondToJoinRequest
  } = useApi();

  // Load data from API
  const loadData = async () => {
    await Promise.all([
      loadActivities(),
      loadNotifications(),
    ]);

    // Calculate stats from current user data
    if (user) {
      setStats({
        totalActivities: user.stats.activitiesCreated + user.stats.activitiesJoined,
        totalConnections: user.stats.connectionsMade,
        streakDays: user.stats.streakDays,
        thisWeekActivities: Math.floor(Math.random() * 5) + 3 // Random for demo
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setRefreshProgress(prev => {
        if (prev >= 1) {
          clearInterval(progressInterval);
          return 1;
        }
        return prev + 0.1;
      });
    }, 100);
    
    await refreshData();
    
    setTimeout(() => {
      setRefreshing(false);
      setRefreshProgress(0);
      clearInterval(progressInterval);
    }, 2000);
  }, [refreshData]);

  const handleJoinRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const result = await respondToJoinRequest(requestId, action);
      if (result.success) {
        Alert.alert(
          'Join Request',
          `Request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to process request');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process request');
    }
  };

  const handleVibeFeedback = async (vibe: string) => {
    setVibeFeedback(vibe);
    Alert.alert('Thank you!', 'Your feedback has been recorded.');
  };

  const getUnreadNotificationsCount = () => {
    return notifications?.filter(notification => !notification.isRead).length || 0;
  };

  // Filter upcoming activities
  const upcomingActivities = useMemo(() => {
    if (!activities) return [];
    const now = new Date();
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate > now && activity.status === 'upcoming';
    });
  }, [activities]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentInset, layoutMeasurement } = event.nativeEvent;
    const pullDistance = -contentOffset.y - contentInset.top;
    const refreshThreshold = 100; // Distance to pull before refresh triggers

    if (!refreshing && pullDistance > 0) {
      const progress = Math.min(pullDistance / refreshThreshold, 1);
      setRefreshProgress(progress);
    }
  }, [refreshing]);

  const handleJoinActivity = useCallback(async (activityId: string) => {
    try {
      const result = await joinActivity(activityId);
      if (result.success) {
        Alert.alert('Success', 'You have joined the activity!');
      } else {
        Alert.alert('Error', result.error || 'Failed to join activity');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to join activity');
    }
  }, [joinActivity]);

  const handleViewActivity = useCallback((activityId: string) => {
    router.push(`/activity/${activityId}`);
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Custom Refresh Loader - Only show when actively refreshing */}
      {refreshing && (
        <View style={styles.refreshLoaderContainer}>
          <RefreshLoader
            refreshing={refreshing}
            progress={refreshProgress}
            title=""
            refreshingTitle="Refreshing..."
            color="#000"
            size={20}
            showProgress={true}
            animationType="spin"
          />
        </View>
      )}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={['transparent']}
            progressBackgroundColor="transparent"
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Welcome back!</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/system-notifications')}
        >
          <View style={styles.notificationButtonIcon}>
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

      {/* Stats Cards - Redesigned */}
      <View style={styles.statsContainer}>
        {/* Main Stats Row - Horizontal Cards */}
        <View style={styles.mainStatsRow}>
          <View style={[styles.mainStatsCard, styles.primaryCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.mainStatsIconContainer}>
                <FontAwesome name="calendar" size={24} color="#fff" />
              </View>
              <View style={styles.cardBadge}>
                <Text style={styles.badgeText}>Total</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.mainStatsNumber}>{stats.totalActivities}</Text>
              <Text style={styles.mainStatsLabel}>Activities</Text>
            </View>
          </View>
          
          <View style={[styles.mainStatsCard, styles.secondaryCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.mainStatsIconContainer, { backgroundColor: "#e9ecef" }]}>
                <FontAwesome name="users" size={24} color="#000" />
              </View>
              <View style={[styles.cardBadge, { backgroundColor: "#e9ecef" }]}>
                <Text style={[styles.badgeText, { color: "#000" }]}>Network</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.mainStatsNumberSecondary}>{stats.totalConnections}</Text>
              <Text style={styles.mainStatsLabelSecondary}>Connections</Text>
            </View>
          </View>
        </View>

        {/* Secondary Stats Row - Compact Cards */}
        {/* <View style={styles.secondaryStatsRow}>
          <View style={[styles.secondaryStatsCard, styles.streakCard]}>
            <View style={styles.secondaryIconContainer}>
              <FontAwesome name="fire" size={18} color="#000" />
            </View>
            <View style={styles.secondaryContent}>
              <Text style={styles.secondaryNumber}>{stats.streakDays}</Text>
              <Text style={styles.secondaryLabel}>Day Streak</Text>
            </View>
          </View>
          
          <View style={[styles.secondaryStatsCard, styles.weekCard]}>
            <View style={styles.secondaryIconContainer}>
              <FontAwesome name="line-chart" size={18} color="#000" />
            </View>
            <View style={styles.secondaryContent}>
              <Text style={styles.secondaryNumber}>{stats.thisWeekActivities}</Text>
              <Text style={styles.secondaryLabel}>This Week</Text>
            </View>
          </View>
          
          <View style={[styles.secondaryStatsCard, styles.achievementCard]}>
            <View style={styles.secondaryIconContainer}>
              <FontAwesome name="trophy" size={18} color="#000" />
            </View>
            <View style={styles.secondaryContent}>
              <Text style={styles.secondaryNumber}>12</Text>
              <Text style={styles.secondaryLabel}>Achievements</Text>
            </View>
          </View>
        </View> */}
      </View>

      {/* Join Requests Banner */}
      {joinRequests.length > 0 && (
        <View style={styles.requestsContainer}>
          <Text style={styles.requestsTitle}>Join Requests</Text>
          {joinRequests.slice(0, 2).map((request) => (
            <RequestBanner
              key={request.id}
              request={request}
              onAccept={() => handleJoinRequest(request.id, 'accept')}
              onReject={() => handleJoinRequest(request.id, 'reject')}
            />
          ))}
          {joinRequests.length > 2 && (
            <TouchableOpacity style={styles.viewAllRequests}>
              <Text style={styles.viewAllText}>View All Requests ({joinRequests.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Vibe Check */}
      <VibeCheck onFeedback={handleVibeFeedback} />

      {/* Upcoming Activities */}
      <View style={styles.activitiesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Activities</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {upcomingActivities.length > 0 ? (
          upcomingActivities.slice(0, 3).map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              onJoin={() => handleJoinActivity(activity._id)}
              onView={() => handleViewActivity(activity._id)}
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
      {notifications?.length > 0 && (
        <View style={styles.notificationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/system-notifications')}
            >
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {notifications.slice(0, 3).map((notification) => (
            <TouchableOpacity key={notification._id} style={styles.notificationItem}>
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
                <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
              </View>
              {!notification.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/create-activity')}
          >
            <FontAwesome name="plus" size={24} color="#000" />
            <Text style={styles.quickActionText}>Create Activity</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/explore')}
          >
            <FontAwesome name="search" size={24} color="#000" />
            <Text style={styles.quickActionText}>Find Friends</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  refreshLoaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingTop: 20,
  },
  contentContainer: {
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: PADDING.content.vertical,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: "#666",
    marginBottom: PADDING.content.vertical,
  },
  notificationButton: {
    padding: GAPS.small,
  },
  notificationButtonIcon: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  requestsContainer: {
    marginBottom: PADDING.content.vertical,
  },
  requestsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.medium,
  },
  viewAllRequests: {
    alignItems: "center",
    paddingVertical: GAPS.medium,
  },
  viewAllText: {
    fontSize: FONT_SIZES.md,
    color: "#000",
    fontWeight: FONT_WEIGHTS.medium,
  },
  statsContainer: {
    marginBottom: PADDING.content.vertical,
  },
  
  // Main Stats Row - Large horizontal cards
  mainStatsRow: {
    flexDirection: "row",
    marginBottom: GAPS.large,
    gap: GAPS.medium,
  },
  mainStatsCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    minHeight: 120,
    justifyContent: "space-between",
  },
  primaryCard: {
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryCard: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: GAPS.medium,
  },
  mainStatsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#fff",
  },
  cardContent: {
    alignItems: "flex-start",
  },
  mainStatsNumber: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#fff",
    marginBottom: GAPS.small,
  },
  mainStatsLabel: {
    fontSize: FONT_SIZES.md,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: FONT_WEIGHTS.medium,
  },
  mainStatsLabelSecondary: {
    fontSize: FONT_SIZES.md,
    color: "#666",
    fontWeight: FONT_WEIGHTS.medium,
  },
  mainStatsNumberSecondary: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
    marginBottom: GAPS.small,
  },
  
  // Secondary Stats Row - Compact horizontal cards
  secondaryStatsRow: {
    flexDirection: "row",
    gap: GAPS.small,
  },
  secondaryStatsCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  streakCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#000",
  },
  weekCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#666",
  },
  achievementCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#999",
  },
  secondaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
  },
  secondaryContent: {
    flex: 1,
  },
  secondaryNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
    marginBottom: 2,
  },
  secondaryLabel: {
    fontSize: FONT_SIZES.xs,
    color: "#666",
    fontWeight: FONT_WEIGHTS.medium,
  },
  activitiesSection: {
    marginBottom: PADDING.content.vertical,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: GAPS.medium,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
  },
  seeAllButton: {
    paddingVertical: GAPS.small,
  },
  seeAllText: {
    fontSize: FONT_SIZES.md,
    color: "#000",
    fontWeight: FONT_WEIGHTS.medium,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: PADDING.content.vertical * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#666",
    marginTop: GAPS.medium,
    marginBottom: GAPS.small,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: "#999",
    textAlign: "center",
    marginBottom: GAPS.large,
  },
  emptyActionButton: {
    backgroundColor: "#000",
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.button.vertical,
    borderRadius: BORDER_RADIUS.medium,
  },
  emptyActionText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  notificationsSection: {
    marginBottom: PADDING.content.vertical,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.small,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    marginBottom: GAPS.small,
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
  quickActionsSection: {
    marginBottom: PADDING.content.vertical,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    alignItems: "center",
    marginHorizontal: GAPS.small,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    color: "#000",
    marginTop: GAPS.small,
    fontWeight: FONT_WEIGHTS.medium,
  },
});