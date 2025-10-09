import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Switch } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

export default function NotificationSettingsScreen() {
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    activityInvites: true,
    joinRequests: true,
    messages: true,
    reminders: false,
    marketing: false,
    weeklyDigest: true,
    locationBased: true,
  });
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  const handleToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const notificationGroups = [
    {
      title: "Activity Notifications",
      items: [
        {
          key: "pushNotifications",
          title: "Push Notifications",
          subtitle: "Receive notifications on your device",
          icon: "bell"
        },
        {
          key: "activityInvites",
          title: "Activity Invites",
          subtitle: "When someone invites you to an activity",
          icon: "calendar"
        },
        {
          key: "joinRequests",
          title: "Join Requests",
          subtitle: "When someone wants to join your activity",
          icon: "user-plus"
        },
        {
          key: "messages",
          title: "Messages",
          subtitle: "New messages in activity chats",
          icon: "comment"
        }
      ]
    },
    {
      title: "Reminders & Updates",
      items: [
        {
          key: "reminders",
          title: "Activity Reminders",
          subtitle: "Remind me before activities start",
          icon: "clock-o"
        },
        {
          key: "weeklyDigest",
          title: "Weekly Digest",
          subtitle: "Summary of your week's activities",
          icon: "envelope"
        },
        {
          key: "locationBased",
          title: "Location-Based Alerts",
          subtitle: "Activities near your location",
          icon: "map-marker"
        }
      ]
    },
    {
      title: "Marketing",
      items: [
        {
          key: "marketing",
          title: "Marketing Emails",
          subtitle: "Promotional content and updates",
          icon: "bullhorn"
        }
      ]
    }
  ];

  return (
    <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Choose what notifications you want to receive and how you want to receive them.
      </Text>

      {/* Notification Groups */}
      {notificationGroups.map((group, groupIndex) => (
        <View key={groupIndex} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          
          {group.items.map((item, itemIndex) => (
            <View key={item.key} style={[
              styles.notificationItem,
              itemIndex === group.items.length - 1 && styles.lastItem
            ]}>
              <View style={styles.notificationLeft}>
                <View style={styles.notificationIcon}>
                  <FontAwesome name={item.icon as any} size={20} color="#000" />
                </View>
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Switch
                value={notifications[item.key as keyof typeof notifications]}
                onValueChange={() => handleToggle(item.key)}
                trackColor={{ false: "#e9ecef", true: "#000" }}
                thumbColor={notifications[item.key as keyof typeof notifications] ? "#fff" : "#fff"}
              />
            </View>
          ))}
        </View>
      ))}

      {/* Notification Schedule */}
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Notification Schedule</Text>
        <TouchableOpacity style={styles.scheduleItem}>
          <View style={styles.scheduleLeft}>
            <View style={styles.notificationIcon}>
              <FontAwesome name="clock-o" size={20} color="#000" />
            </View>
            <View style={styles.notificationText}>
              <Text style={styles.notificationTitle}>Quiet Hours</Text>
              <Text style={styles.notificationSubtitle}>10:00 PM - 8:00 AM</Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
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
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: "#666",
    marginBottom: PADDING.content.vertical,
    lineHeight: 22,
  },
  group: {
    marginBottom: PADDING.content.vertical,
  },
  groupTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.medium,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: PADDING.card.horizontal,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  lastItem: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: BORDER_RADIUS.medium,
    borderBottomRightRadius: BORDER_RADIUS.medium,
  },
  notificationLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.small,
  },
  notificationSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
  },
  scheduleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#000",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.button.horizontal,
    alignItems: "center",
    marginTop: PADDING.content.vertical,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#fff",
  },
});
