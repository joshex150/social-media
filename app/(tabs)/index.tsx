import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, RefreshControl, Dimensions, AppState } from "react-native";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useTheme } from "../../contexts/ThemeContext";
import { useRouter, useFocusEffect } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActivityCard from "@/components/ActivityCard";
import VibeCheck from "@/components/VibeCheck";
import RequestBanner from "@/components/RequestBanner";
import RefreshLoader from "@/components/RefreshLoader";
import CustomAlert from "@/components/CustomAlert";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SPACING } from "@/constants/spacing";
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
  const errorHandler = useErrorHandler();
  const { colors } = useTheme();
  const [stats, setStats] = useState<Stats>({
    totalActivities: 0,
    totalConnections: 0,
    streakDays: 0,
    thisWeekActivities: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [activityMode, setActivityMode] = useState<'normal' | 'side-quest' | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const { alert, showAlert, hideAlert } = useCustomAlert();

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
    leaveActivity,
    respondToJoinRequest,
    isAuthenticated,
    isGuest
  } = useApi();


  // Load data from API
  const loadData = async () => {
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
        showAlert(
          'Join Request',
          `Request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`,
          'success'
        );
      } else {
        showAlert('Error', result.error || 'Failed to process request', 'error');
      }
    } catch (error) {
      errorHandler.handleError(error, 'Processing join request');
      showAlert('Error', 'Failed to process request', 'error');
    }
  };

  const handleVibeFeedback = async (mode: string | null) => {
    if (mode) {
      setActivityMode(mode as 'normal' | 'side-quest');
      showAlert('Mode Updated!', `You're now in ${mode === 'normal' ? 'Normal Mode' : 'Side Quest Mode'}`, 'success');
    } else {
      setActivityMode(null);
      showAlert('Mode Cleared', 'Activity mode has been cleared. Showing all activities.', 'success');
    }
  };

  // Load saved mode on mount and when screen is focused
  const loadMode = useCallback(async () => {
    try {
      const savedMode = await AsyncStorage.getItem('activityMode');
      if (savedMode && (savedMode === 'normal' || savedMode === 'side-quest')) {
        setActivityMode(savedMode as 'normal' | 'side-quest');
      } else {
        setActivityMode(null);
      }
    } catch (error) {
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    loadMode();
    
    // Set up interval to reload mode periodically (in case it was cleared from settings)
    const interval = setInterval(() => {
      loadMode();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [loadMode]);

  // Reload mode when screen comes into focus (e.g., returning from settings)
  useFocusEffect(
    useCallback(() => {
      loadMode();
    }, [loadMode])
  );

  const getUnreadNotificationsCount = () => {
    return notifications?.filter(notification => !notification.isRead).length || 0;
  };

  // Find the nearest/closest activity the user has joined
  const nearestJoinedActivity = useMemo(() => {
    if (!activities || !user?.id) return null;
    
    const now = new Date();
    const joinedActivities = activities.filter(activity => {
      // Check if user is a participant
      const isParticipant = Array.isArray(activity.participants) && 
        activity.participants.some((p: any) => {
          if (typeof p === 'object' && p !== null) {
            return (p._id?.toString() === user.id?.toString()) || 
                   (p.id?.toString() === user.id?.toString());
          }
          return p?.toString() === user.id?.toString();
        });
      
      // Check if activity is upcoming
      const activityDate = new Date(activity.date);
      return isParticipant && activityDate > now && activity.status === 'upcoming';
    });
    
    if (joinedActivities.length === 0) return null;
    
    // Sort by date and return the nearest one
    return joinedActivities.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];
  }, [activities, user]);

  // Countdown timer for nearest activity
  useEffect(() => {
    if (!nearestJoinedActivity) {
      setCountdown('');
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const activityDate = new Date(nearestJoinedActivity.date);
      const diff = activityDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nearestJoinedActivity]);

  const formatActivityTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Filter upcoming activities based on selected mode
  const upcomingActivities = useMemo(() => {
    if (!activities) return [];
    const now = new Date();
    let filtered = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate > now && activity.status === 'upcoming';
    });

    // Apply mode-based filtering
    if (activityMode) {
      const userInterests = user?.preferences?.categories || [];
      
      if (activityMode === 'normal') {
        // Normal mode: Show activities based on interests, prioritize lower plan creators (free/silver)
        if (userInterests.length > 0) {
          filtered = filtered.filter(activity => {
            // Filter by interests
            return userInterests.includes(activity.category);
          });
        }
        // If no interests, show all activities but still prioritize by plan
        
        // Sort: prioritize lower plan creators (free, silver) first
        filtered.sort((a, b) => {
          const planOrder = { 'free': 0, 'silver': 1, 'gold': 2, 'platinum': 3 };
          const aPlan = planOrder[a.createdBy?.subscription as keyof typeof planOrder] ?? 3;
          const bPlan = planOrder[b.createdBy?.subscription as keyof typeof planOrder] ?? 3;
          return aPlan - bPlan;
        });
      } else if (activityMode === 'side-quest') {
        // Side Quest mode: Show activities NOT in interests, prioritize higher plan creators (gold/platinum)
        if (userInterests.length > 0) {
          filtered = filtered.filter(activity => {
            // Show activities that are NOT in user interests
            return !userInterests.includes(activity.category);
          });
        }
        // If no interests, show all activities (everything is "new")
        
        // Sort: prioritize higher plan creators (gold, platinum) first
        filtered.sort((a, b) => {
          const planOrder = { 'free': 3, 'silver': 2, 'gold': 1, 'platinum': 0 };
          const aPlan = planOrder[a.createdBy?.subscription as keyof typeof planOrder] ?? 3;
          const bPlan = planOrder[b.createdBy?.subscription as keyof typeof planOrder] ?? 3;
          return aPlan - bPlan;
        });
      }
    }

    return filtered;
  }, [activities, activityMode, user?.preferences?.categories]);

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
        showAlert('Success', 'You have joined the activity!', 'success');
        await refreshData(); // Refresh to update participant status
      } else {
        showAlert('Error', result.error || 'Failed to join activity', 'error');
      }
    } catch (error) {
      showAlert('Error', 'Failed to join activity', 'error');
    }
  }, [joinActivity, refreshData]);

  const handleLeaveActivity = useCallback(async (activityId: string) => {
    try {
      const result = await leaveActivity(activityId);
      if (result.success) {
        showAlert('Success', 'You have left the activity', 'success');
        await refreshData(); // Refresh to update participant status
      } else {
        showAlert('Error', result.error || 'Failed to leave activity', 'error');
      }
    } catch (error) {
      showAlert('Error', 'Failed to leave activity', 'error');
    }
  }, [leaveActivity, refreshData]);

  const handleViewActivity = useCallback((activityId: string) => {
    router.push(`/activity/${activityId}`);
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Refresh Loader - Only show when actively refreshing */}
      {refreshing && (
        <View style={styles.refreshLoaderContainer}>
          <RefreshLoader
            refreshing={refreshing}
            progress={refreshProgress}
            title=""
            refreshingTitle="Refreshing..."
            color={null}
            size={20}
            showProgress={true}
            animationType="spin"
          />
        </View>
      )}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
      {/* FotMob-style Header - Only show for authenticated users */}
      {isAuthenticated && !isGuest && nearestJoinedActivity ? (
        <View style={[styles.matchHeaderContainer, {paddingTop: 50}]}>
          <TouchableOpacity 
            style={[styles.matchHeader, { borderBottomColor: colors.border }]}
            onPress={() => handleViewActivity(nearestJoinedActivity._id)}
            activeOpacity={0.8}
          >
            {/* Top Row - Date, Time, Icons */}
            <View style={styles.matchHeaderTop}>
              <View style={styles.matchHeaderTopLeft}>
                <Text style={[styles.matchHeaderLabel, { color: colors.muted }]}>
                  {formatActivityDate(nearestJoinedActivity.date)}
                </Text>
              </View>
              <View style={styles.matchHeaderTopCenter}>
                <Text style={[styles.matchTime, { color: colors.foreground }]}>
                  {formatActivityTime(nearestJoinedActivity.date)}
                </Text>
              </View>
              <View style={styles.matchHeaderTopRight}>
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push('/system-notifications');
                  }}
                >
                  <FontAwesome name="bell" size={20} color={colors.foreground} />
                  {isAuthenticated && !isGuest && getUnreadNotificationsCount() > 0 && (
                    <View style={[styles.headerNotificationBadge, { backgroundColor: colors.error }]}>
                      <Text style={[styles.headerNotificationBadgeText, { color: colors.background }]}>
                        {getUnreadNotificationsCount()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push(`/activity/${nearestJoinedActivity._id}`);
                  }}
                >
                  <FontAwesome name="heart" size={20} color={colors.foreground} />
                </TouchableOpacity> */}
              </View>
            </View>
            
            {/* Main Info Row - Activity Details */}
            <View style={styles.matchInfoContainer}>
              <View style={styles.matchTeamLeft}>
                <View style={[styles.matchTeamLogo, { backgroundColor: colors.border }]}>
                  <FontAwesome 
                    name={
                      nearestJoinedActivity.category === 'fitness' ? 'heart' :
                      nearestJoinedActivity.category === 'learning' ? 'book' :
                      nearestJoinedActivity.category === 'food' ? 'cutlery' :
                      nearestJoinedActivity.category === 'travel' ? 'plane' :
                      nearestJoinedActivity.category === 'music' ? 'music' :
                      nearestJoinedActivity.category === 'sports' ? 'futbol-o' :
                      nearestJoinedActivity.category === 'tech' ? 'laptop' : 'users'
                    } 
                    size={28} 
                    color={colors.foreground} 
                  />
                </View>
                <View style={styles.matchTeamInfo}>
                  <Text 
                    style={[styles.matchTeamName, { color: colors.foreground }]} 
                    numberOfLines={2}
                  >
                    {nearestJoinedActivity.title}
                  </Text>
                  <Text 
                    style={[styles.matchTeamSubtext, { color: colors.muted }]} 
                    numberOfLines={1}
                  >
                    {nearestJoinedActivity.category}
                  </Text>
                </View>
              </View>
              
              <View style={styles.matchCenter}>
                {countdown && (
                  <>
                    <Text style={[styles.matchCountdown, { color: colors.foreground }]}>
                      {countdown}
                    </Text>
                    <Text style={[styles.matchCountdownLabel, { color: colors.muted }]}>
                      Time until start
                    </Text>
                  </>
                )}
              </View>
              
              <View style={styles.matchTeamRight}>
                <View style={styles.matchTeamInfo}>
                  <Text 
                    style={[styles.matchTeamName, { color: colors.foreground, textAlign: 'right' }]} 
                    numberOfLines={2}
                  >
                    {nearestJoinedActivity.location.name}
                  </Text>
                  <Text 
                    style={[styles.matchTeamSubtext, { color: colors.muted, textAlign: 'right' }]} 
                    numberOfLines={1}
                  >
                    Location
                  </Text>
                </View>
                <View style={[styles.matchTeamLogo, { backgroundColor: colors.border }]}>
                  <FontAwesome name="map-marker" size={24} color={colors.foreground} />
                </View>
              </View>
            </View>
            
            {/* Bottom Info Bar */}
            <View style={[styles.matchBottomBar, { borderTopColor: colors.border }]}>
              <View style={styles.matchInfoItem}>
                <FontAwesome name="users" size={14} color={colors.muted} />
                <Text style={[styles.matchInfoText, { color: colors.muted }]}>
                  {nearestJoinedActivity.participants.length}/{nearestJoinedActivity.maxParticipants} joined
                </Text>
              </View>
              <View style={styles.matchInfoItem}>
                <FontAwesome name="clock-o" size={14} color={colors.muted} />
                <Text style={[styles.matchInfoText, { color: colors.muted }]}>
                  {nearestJoinedActivity.duration}min
                </Text>
              </View>
              <View style={styles.matchInfoItem}>
                <FontAwesome name="circle" size={6} color={colors.accent} />
                <Text style={[styles.matchInfoText, { color: colors.accent }]}>
                  Joined
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        // Fallback header when no joined activity
        <>
          <View style={[styles.headerContainer, safeArea.header]}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
              <View style={styles.headerLeft}>
                <Text style={[styles.title, { color: colors.foreground }]}>Welcome back!</Text>
              </View>
              <View style={styles.headerRight}>
                {isAuthenticated && !isGuest && (
                  <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => router.push('/system-notifications')}
                  >
                    <View style={styles.notificationButtonIcon}>
                      <FontAwesome name="bell" size={20} color={colors.foreground} />
                      {getUnreadNotificationsCount() > 0 && (
                        <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                          <Text style={[styles.notificationBadgeText, { color: colors.background }]}>
                            {getUnreadNotificationsCount()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {isGuest ? 'Login to access all features' : 'Connect with people around you'}
          </Text>
        </>
      )}

      {/* Stats Cards - Redesigned - Only show for authenticated users */}
      {isAuthenticated && !isGuest && (
      <View style={styles.statsContainer}>
        {/* Main Stats Row - Horizontal Cards */}
        <View style={styles.mainStatsRow}>
          <View style={[styles.mainStatsCard, styles.primaryCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.mainStatsIconContainer}>
                <FontAwesome name="calendar" size={24} color={colors.background} />
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
          
          <TouchableOpacity 
            style={[styles.mainStatsCard, styles.secondaryCard]}
            onPress={() => router.push('/circle')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.mainStatsIconContainer, { backgroundColor: colors.surface }]}>
                <FontAwesome name="users" size={24} color={colors.foreground} />
              </View>
              <View style={[styles.cardBadge, { backgroundColor: colors.surface }]}>
                <Text style={[styles.badgeText, { color: colors.foreground }]}>Network</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.mainStatsNumberSecondary}>{stats.totalConnections}</Text>
              <Text style={styles.mainStatsLabelSecondary}>Circle</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Secondary Stats Row - Compact Cards */}
        {/* <View style={styles.secondaryStatsRow}>
          <View style={[styles.secondaryStatsCard, styles.streakCard]}>
            <View style={styles.secondaryIconContainer}>
              <FontAwesome name="fire" size={18} color={colors.foreground} />
            </View>
            <View style={styles.secondaryContent}>
              <Text style={styles.secondaryNumber}>{stats.streakDays}</Text>
              <Text style={styles.secondaryLabel}>Day Streak</Text>
            </View>
          </View>
          
          <View style={[styles.secondaryStatsCard, styles.weekCard]}>
            <View style={styles.secondaryIconContainer}>
              <FontAwesome name="line-chart" size={18} color={colors.foreground} />
            </View>
            <View style={styles.secondaryContent}>
              <Text style={styles.secondaryNumber}>{stats.thisWeekActivities}</Text>
              <Text style={styles.secondaryLabel}>This Week</Text>
            </View>
          </View>
          
          <View style={[styles.secondaryStatsCard, styles.achievementCard]}>
            <View style={styles.secondaryIconContainer}>
              <FontAwesome name="trophy" size={18} color={colors.foreground} />
            </View>
            <View style={styles.secondaryContent}>
              <Text style={styles.secondaryNumber}>12</Text>
              <Text style={styles.secondaryLabel}>Achievements</Text>
            </View>
          </View>
        </View> */}
      </View>
      )}

      {/* Join Requests Banner - Only show for authenticated users */}
      {isAuthenticated && !isGuest && joinRequests.length > 0 && (
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
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Activities</Text>
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
              currentUserId={user?.id}
              onJoin={isGuest ? () => {
                showAlert('Login Required', 'Please login to join activities', 'info', [
                  { text: 'Cancel', style: 'cancel', onPress: () => {} },
                  { text: 'Login', onPress: () => router.push('/login') }
                ]);
              } : () => handleJoinActivity(activity._id)}
              onView={() => handleViewActivity(activity._id)}
              onManage={isGuest ? () => {
                showAlert('Login Required', 'Please login to manage activities', 'info', [
                  { text: 'Cancel', style: 'cancel', onPress: () => {} },
                  { text: 'Login', onPress: () => router.push('/login') }
                ]);
              } : (activityId: string) => router.push(`/activity/${activityId}/manage`)}
              onLeave={isGuest ? () => {
                showAlert('Login Required', 'Please login to leave activities', 'info', [
                  { text: 'Cancel', style: 'cancel', onPress: () => {} },
                  { text: 'Login', onPress: () => router.push('/login') }
                ]);
              } : () => handleLeaveActivity(activity._id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="bullseye" size={48} color={colors.muted} />
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

      {/* Recent Notifications - Only show for authenticated users */}
      {isAuthenticated && !isGuest && notifications?.length > 0 && (
        <View style={styles.notificationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Notifications</Text>
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
                  color={colors.foreground}
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
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/create-activity')}
          >
            <FontAwesome name="plus" size={24} color={colors.foreground} />
            <Text style={[styles.quickActionText, { color: colors.foreground }]}>Create Activity</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/explore')}
          >
            <FontAwesome name="search" size={24} color={colors.foreground} />
            <Text style={[styles.quickActionText, { color: colors.foreground }]}>Find Friends</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>

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
  headerContainer: {
    width: '100%',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.header.vertical,
    marginBottom: PADDING.content.vertical,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAPS.small,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
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
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
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
    marginTop: GAPS.large
  },
  quickActionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    alignItems: "center",
    marginHorizontal: GAPS.small,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    marginTop: GAPS.small,
    fontWeight: FONT_WEIGHTS.medium,
  },
  // FotMob-style header styles
  matchHeaderContainer: {
    marginBottom: MARGIN.section.bottom,
    marginHorizontal: -PADDING.content.horizontal, // Counteract ScrollView padding for full width
  },
  matchHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    // borderRadius: BORDER_RADIUS.large,
    minHeight: 180,
  },
  matchHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  matchHeaderTopLeft: {
    flex: 1,
  },
  matchHeaderTopCenter: {
    flex: 1,
    alignItems: 'center',
  },
  matchHeaderTopRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: GAPS.medium,
  },
  matchHeaderLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchTime: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  headerIconButton: {
    padding: SPACING.sm,
    position: 'relative',
  },
  headerNotificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  headerNotificationBadgeText: {
    fontSize: FONT_SIZES.xs - 1,
    fontWeight: FONT_WEIGHTS.bold,
  },
  matchInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  matchTeamLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAPS.medium,
  },
  matchTeamRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: GAPS.medium,
  },
  matchTeamLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchTeamInfo: {
    flex: 1,
  },
  matchTeamName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs / 2,
  },
  matchTeamSubtext: {
    fontSize: FONT_SIZES.xs,
    textTransform: 'capitalize',
  },
  matchCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    minWidth: 100,
  },
  matchCountdown: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  matchCountdownLabel: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs / 2,
    textAlign: 'center',
  },
  matchBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  matchInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAPS.small,
  },
  matchInfoText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
});