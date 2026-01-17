import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import type { User } from "@/services/api";

export default function ProfileScreen() {
  const { colors } = useTheme();

  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { user, logout, isAuthenticated, isGuest } = useApi();
  const { alert, showAlert, hideAlert } = useCustomAlert();

  const handleLogout = () => {
    showAlert(
      'Logout',
      'Are you sure you want to logout?',
      'warning',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    // Don't allow guest users to edit profile
    if (isGuest) {
      showAlert('Login Required', 'Please login to edit your profile', 'info');
      router.push('/login');
      return;
    }
    
    // Navigate to edit-profile modal
    router.push('/edit-profile');
  };

  const handleLogin = () => {
    router.push('/login');
  };



  // Filter settings items based on authentication status
  const allSettingsItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'edit',
      onPress: handleEditProfile,
      requiresAuth: true // Only show for authenticated users
    },
    {
      id: 'subscription',
      title: 'Subscription & Billing',
      subtitle: 'Manage your plan and payments',
      icon: 'credit-card',
      onPress: () => router.push('/subscription-settings' as any),
      requiresAuth: true // Only show for authenticated users
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Control your notification preferences',
      icon: 'bell',
      onPress: () => router.push('/notification-settings' as any),
      requiresAuth: false // Available to all
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: 'shield',
      onPress: () => router.push('/privacy-settings' as any),
      requiresAuth: false // Available to all
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'question-circle',
      onPress: () => router.push('/help-support' as any),
      requiresAuth: false // Available to all
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: 'info-circle',
      onPress: () => router.push('/about' as any),
      requiresAuth: false // Available to all
    },
    {
      id: 'sitemap',
      title: 'Sitemap',
      subtitle: 'Navigate to all app sections',
      icon: 'sitemap',
      onPress: () => router.push('/sitemap' as any),
      requiresAuth: false // Available to all
    }
  ];

  // Filter settings items based on authentication
  const settingsItems = allSettingsItems.filter(item => {
    if (item.requiresAuth) {
      return isAuthenticated && !isGuest;
    }
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, safeArea.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
        <ThemeToggle />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>

      {/* Show login prompt for guests, profile card for authenticated users */}
      {isGuest || !isAuthenticated ? (
        <View style={[styles.guestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.foreground }]}>
              <FontAwesome name="user" size={40} color={colors.background} />
            </View>
          </View>
          <Text style={[styles.guestTitle, { color: colors.foreground }]}>Guest User</Text>
          <Text style={[styles.guestSubtitle, { color: colors.muted }]}>
            Login to access your profile, edit settings, and save your preferences
          </Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.accent }]} 
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <FontAwesome name="sign-in" size={18} color={colors.background} />
            <Text style={[styles.loginButtonText, { color: colors.background }]}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* User Profile Card */}
          <TouchableOpacity style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleEditProfile} activeOpacity={0.8}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: colors.foreground }]}>
                <FontAwesome name="user" size={40} color={colors.background} />
              </View>
              <View style={[styles.editButton, { backgroundColor: colors.accent }]}>
                <FontAwesome name="camera" size={16} color={colors.background} />
              </View>
            </View>
            <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name || 'Loading...'}</Text>
            <Text style={[styles.userEmail, { color: colors.muted }]}>{user?.email || 'Loading...'}</Text>
            <Text style={[styles.joinDate, { color: colors.muted }]}>Member since {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Loading...'}</Text>
            <View style={styles.editProfileHint}>
              <Text style={[styles.editProfileHintText, { color: colors.muted }]}>Tap to edit profile</Text>
              <FontAwesome name="chevron-right" size={12} color={colors.muted} />
            </View>
          </TouchableOpacity>

          {/* Stats Row */}
          <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.foreground }]}>{user?.stats?.activitiesCreated || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Created</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.foreground }]}>{user?.stats?.activitiesJoined || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Joined</Text>
            </View>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => router.push('/circle')}
              activeOpacity={0.7}
            >
              <Text style={[styles.statNumber, { color: colors.foreground }]}>{user?.stats?.connectionsMade || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Circle</Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.foreground }]}>{user?.stats?.streakDays || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Day Streak</Text>
            </View>
          </View>
        </>
      )}

      {/* Settings Section */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Settings</Text>
      
      <View style={[styles.settingsContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {settingsItems.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={item.onPress}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.foreground }]}>
                <FontAwesome name={item.icon as any} size={20} color={colors.background} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={16} color={colors.muted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button - Only show for authenticated users */}
      {isAuthenticated && !isGuest && (
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    paddingHorizontal: PADDING.content.horizontal,
    paddingTop: 130, // Account for fixed header + safe area + extra spacing
    paddingBottom: PADDING.content.vertical,
    width: "100%",
    minWidth: "100%",
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
    borderBottomWidth: 1,

  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  profileCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    alignItems: "center",
    marginBottom: PADDING.content.vertical,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
  settingsContainer: {
    width: "100%",
    minWidth: "100%",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
    width: "100%",
    minWidth: "100%",
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
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: GAPS.medium,
    marginTop: GAPS.large,
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
  editProfileHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: GAPS.medium,
    paddingTop: GAPS.medium,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  editProfileHintText: {
    fontSize: FONT_SIZES.sm,
    color: '#999',
    marginRight: GAPS.small,
  },
  guestCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    alignItems: "center",
    marginBottom: PADDING.content.vertical,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  guestTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: GAPS.medium,
    marginBottom: GAPS.small,
  },
  guestSubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: GAPS.large,
    paddingHorizontal: PADDING.content.horizontal,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PADDING.card.horizontal * 2,
    paddingVertical: PADDING.input.vertical,
    borderRadius: BORDER_RADIUS.medium,
    minWidth: 150,
  },
  loginButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginLeft: GAPS.small,
  },
});
