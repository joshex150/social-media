import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useRouter } from "expo-router";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import type { Notification } from "@/services/api";

export default function SystemNotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

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
      <View style={[styles.container, styles.centerContent, safeArea.content]}>
        <FontAwesome name="spinner" size={32} color="#000" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity style={styles.menuButton}>
          <FontAwesome name="ellipsis-v" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({notifications?.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Unread ({notifications.filter(n => !n.isRead).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleMarkAllRead}>
          <FontAwesome name="check" size={16} color="#000" />
          <Text style={styles.actionText}>Mark All Read</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleClearAll}>
          <FontAwesome name="trash" size={16} color="#000" />
          <Text style={styles.actionText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        filteredNotifications.map((notification) => (
          <TouchableOpacity
            key={notification._id}
            style={[
              styles.notificationItem,
              !notification.isRead && styles.notificationItemUnread
            ]}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={styles.notificationAvatar}>
              <FontAwesome 
                name={getNotificationIcon(notification.type) as any} 
                size={20} 
                color="#000" 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
            </View>
            <View style={styles.notificationMeta}>
              {/* {!notification.isRead && <View style={styles.unreadDot} />} */}
              <FontAwesome name="chevron-right" size={14} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="bell-slash" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </Text>
          <Text style={styles.emptySubtitle}>
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
    backgroundColor: "#fff",
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
    color: "#666",
    marginTop: GAPS.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: PADDING.content.vertical,
  },
  backButton: {
    padding: GAPS.small,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
  },
  menuButton: {
    padding: GAPS.small,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
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
  filterButtonActive: {
    backgroundColor: "#000",
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
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
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: GAPS.medium,
    paddingHorizontal: GAPS.small,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginLeft: GAPS.small,
  },
  notificationItem: {
    flexDirection: "row",
    paddingVertical: PADDING.content.vertical,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  notificationItemUnread: {
    backgroundColor: "#f8f9fa",
  },
  notificationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
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
    color: "#000",
    marginBottom: MARGIN.text.bottom,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    marginBottom: MARGIN.text.bottom,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
    color: "#999",
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
    backgroundColor: "#000",
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
    lineHeight: 20,
  },
});
