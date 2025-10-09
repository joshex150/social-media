import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    joinDate: "January 2024",
    totalActivities: 12,
    totalConnections: 8,
    currentTier: "free"
  });
  const [stats, setStats] = useState({
    activitiesCreated: 12,
    activitiesJoined: 8,
    connectionsMade: 8,
    streakDays: 5
  });
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  const settingsItems = [
    {
      id: 'subscription',
      title: 'Subscription & Billing',
      subtitle: 'Manage your plan and payments',
      icon: 'credit-card',
      onPress: () => router.push('/subscription-settings' as any)
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Control your notification preferences',
      icon: 'bell',
      onPress: () => router.push('/notification-settings' as any)
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: 'shield',
      onPress: () => router.push('/privacy-settings' as any)
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'question-circle',
      onPress: () => router.push('/help-support' as any)
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: 'info-circle',
      onPress: () => router.push('/about' as any)
    }
  ];

  return (
    <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <FontAwesome name="user" size={40} color="#fff" />
          </View>
          <TouchableOpacity style={styles.editButton}>
            <FontAwesome name="camera" size={16} color="#000" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.joinDate}>Member since {user.joinDate}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.activitiesCreated}</Text>
          <Text style={styles.statLabel}>Created</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.activitiesJoined}</Text>
          <Text style={styles.statLabel}>Joined</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.connectionsMade}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.streakDays}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Settings Section */}
      <Text style={styles.sectionTitle}>Settings</Text>
      
      {settingsItems.map((item) => (
        <TouchableOpacity key={item.id} style={styles.settingItem} onPress={item.onPress}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <FontAwesome name={item.icon as any} size={20} color="#000" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>
      ))}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?')}>
        <FontAwesome name="sign-out" size={20} color="#ff4444" />
        <Text style={styles.logoutText}>Logout</Text>
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
    marginBottom: PADDING.content.vertical,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
  },
  profileCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    alignItems: "center",
    marginBottom: PADDING.content.vertical,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: GAPS.medium,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#f8f9fa",
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
    marginBottom: GAPS.small,
  },
  userEmail: {
    fontSize: FONT_SIZES.md,
    color: "#666",
    marginBottom: GAPS.small,
  },
  joinDate: {
    fontSize: FONT_SIZES.sm,
    color: "#999",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    marginBottom: PADDING.content.vertical,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
    marginBottom: GAPS.small,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: PADDING.content.horizontal,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.small,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginTop: PADDING.content.vertical,
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#ff4444",
    marginLeft: GAPS.small,
  },
});
