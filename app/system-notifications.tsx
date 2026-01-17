import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useRouter } from "expo-router";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import { useTheme } from "@/contexts/ThemeContext";
import type { Notification } from "@/services/api";

export default function SystemNotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { colors } = useTheme();

  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { notifications, loadNotifications, markNotificationAsRead } = useApi();
  const { alert, showAlert, hideAlert } = useCustomAlert();

  // Load notifications from API
  const loadNotificationsData = async () => {
    await loadNotifications();
    setLoading(false);
  };

  useEffect(() => {
    loadNotificationsData();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    markNotificationAsRead(notification._id);
    
    // Handle notification action based on type
    switch (notification.type) {
      case 'join_request':
        showAlert('Join Request', 'View join request details', 'info');
        break;
      case 'activity_reminder':
        showAlert('Activity Reminder', 'View activity details', 'info');
        break;
      case 'new_activity':
        showAlert('New Activity', 'View new activity', 'info');
        break;
      case 'achievement':
        showAlert('Achievement', 'View achievement details', 'success');
        break;
      default:
        showAlert('Notification', notification.message, 'info');
    }
  };

  const handleMarkAllRead = () => {
    // Mark all notifications as read
    notifications.forEach(notification => {
      if (!notification.isRead) {
        markNotificationAsRead(notification._id);
      }
    });
  };

  const handleClearAll = () => {
    showAlert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      'warning',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            // Clear all notifications (this would need to be implemented in the API)
            // console.log('Clear all notifications');
          }
        }
      ]
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'join_request':
        return 'user-plus';
      case 'activity_reminder':
        return 'clock-o';
      case 'new_activity':
        return 'plus-circle';
      case 'achievement':
        return 'trophy';
      default:
        return 'bell';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, safeArea.content, { backgroundColor: colors.background }]}>
        <FontAwesome name="spinner" size={32} color={colors.foreground} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
        <TouchableOpacity style={styles.menuButton}>
          <FontAwesome name="ellipsis-v" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && { backgroundColor: colors.foreground }
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            { color: colors.muted },
            filter === 'all' && { color: colors.background }
          ]}>
            All ({notifications?.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'unread' && { backgroundColor: colors.foreground }
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[
            styles.filterText,
            { color: colors.muted },
            filter === 'unread' && { color: colors.background }
          ]}>
            Unread ({notifications.filter(n => !n.isRead).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.surface }]} onPress={handleMarkAllRead}>
          <FontAwesome name="check" size={16} color={colors.foreground} />
          <Text style={[styles.actionText, { color: colors.foreground }]}>Mark All Read</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.surface }]} onPress={handleClearAll}>
          <FontAwesome name="trash" size={16} color={colors.foreground} />
          <Text style={[styles.actionText, { color: colors.foreground }]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        filteredNotifications.map((notification) => (
          <TouchableOpacity
            key={notification._id}
            style={[
              styles.notificationItem,
              { borderBottomColor: colors.border },
              !notification.isRead && { backgroundColor: colors.surface }
            ]}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={[styles.notificationAvatar, { backgroundColor: colors.surface }]}>
              <FontAwesome 
                name={getNotificationIcon(notification.type) as any} 
                size={20} 
                color={colors.foreground} 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, { color: colors.foreground }]}>{notification.title}</Text>
              <Text style={[styles.notificationMessage, { color: colors.muted }]}>{notification.message}</Text>
              <Text style={[styles.notificationTime, { color: colors.muted }]}>{formatTime(notification.createdAt)}</Text>
            </View>
            <View style={styles.notificationMeta}>
              {/* {!notification.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.foreground }]} />} */}
              <FontAwesome name="chevron-right" size={14} color={colors.muted} />
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="bell-slash" size={48} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.muted }]}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            {filter === 'unread' 
              ? 'All caught up! Check back later for new updates.'
              : 'You\'ll see notifications about activities, requests, and achievements here.'
            }
          </Text>
        </View>
      )}

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    marginTop: GAPS.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: PADDING.content.vertical,
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: GAPS.medium,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: GAPS.small,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  menuButton: {
    padding: GAPS.small,
  },
  filterContainer: {
    flexDirection: "row",
    borderRadius: BORDER_RADIUS.medium,
    padding: 4,
    marginBottom: GAPS.medium,
  },
  filterButton: {
    flex: 1,
    paddingVertical: GAPS.small,
    paddingHorizontal: GAPS.medium,
    borderRadius: BORDER_RADIUS.small,
    alignItems: "center",
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  actionContainer: {
    flexDirection: "row",
    marginBottom: GAPS.large,
    gap: GAPS.small,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: GAPS.medium,
    paddingHorizontal: GAPS.small,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: GAPS.small,
  },
  notificationItem: {
    flexDirection: "row",
    paddingVertical: PADDING.content.vertical,
    borderBottomWidth: 1,
  },
  notificationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: MARGIN.text.bottom,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    marginBottom: MARGIN.text.bottom,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
  },
  notificationMeta: {
    justifyContent: "center",
    alignItems: "center",
    gap: GAPS.small,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: PADDING.content.vertical * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: GAPS.medium,
    marginBottom: GAPS.small,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: "center",
    lineHeight: 20,
  },
});
