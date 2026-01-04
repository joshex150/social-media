import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Modal, TextInput, Platform, KeyboardAvoidingView, Switch } from "react-native";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editRadius, setEditRadius] = useState(10);
  const [editPreferences, setEditPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      joinRequests: true,
      activityReminders: true
    }
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { user, logout, updateProfile, updatePassword, isAuthenticated, isGuest } = useApi();
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
    
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      setEditLocation(user.location?.address || '');
      setEditRadius(user.preferences?.radius || 10);
      setEditPreferences({
        notifications: {
          email: user.preferences?.notifications?.email ?? true,
          push: user.preferences?.notifications?.push ?? true,
          joinRequests: user.preferences?.notifications?.joinRequests ?? true,
          activityReminders: user.preferences?.notifications?.activityReminders ?? true
        }
      });
      // Clear password fields for fresh start
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowEditModal(true);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showAlert('Error', 'Please enter your name', 'error');
      return;
    }

    // Validate password fields if they are filled
    const hasPasswordFields = currentPassword.trim() || newPassword.trim() || confirmPassword.trim();
    if (hasPasswordFields) {
      if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
        showAlert('Error', 'Please fill in all password fields or leave them empty', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        showAlert('Error', 'New passwords do not match', 'error');
        return;
      }

      if (newPassword.length < 6) {
        showAlert('Error', 'New password must be at least 6 characters', 'error');
        return;
      }
    }

    setIsLoading(true);
    try {
      // Update profile data
      const profileData = {
        name: editName.trim(),
        location: editLocation.trim() ? { address: editLocation.trim() } : undefined,
        preferences: {
          radius: editRadius,
          notifications: editPreferences.notifications
        }
      };

      const profileResult = await updateProfile(profileData);
      if (!profileResult.success) {
        showAlert('Error', profileResult.error || 'Failed to update profile', 'error');
        setIsLoading(false);
        return;
      }

      // Update password if password fields are filled
      if (hasPasswordFields) {
        const passwordResult = await updatePassword({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim()
        });

        if (!passwordResult.success) {
          showAlert('Error', passwordResult.error || 'Failed to update password', 'error');
          setIsLoading(false);
          return;
        }
      }

      showAlert('Success', 'Profile updated successfully', 'success');
      setShowEditModal(false);
    } catch (error) {
      showAlert('Error', 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
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
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.foreground }]}>{user?.stats?.connectionsMade || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Connections</Text>
            </View>
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

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView 
          style={[styles.modalContainer, { backgroundColor: colors.background }]} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={[styles.modalCancelText, { color: colors.muted }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Update Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={isLoading}>
              <Text style={[styles.modalSaveText, { color: colors.accent }, isLoading && styles.modalSaveTextDisabled]}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Basic Info Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Basic Information</Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>Name</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>Email</Text>
                <TextInput
                  style={[styles.textInput, styles.textInputDisabled, { backgroundColor: colors.background, borderColor: colors.border, color: colors.muted }]}
                  value={editEmail}
                  editable={false}
                  placeholder="Email cannot be changed"
                  placeholderTextColor={colors.muted}
                />
                <Text style={[styles.inputNote, { color: colors.muted }]}>Email cannot be changed</Text>
              </View>
            </View>

            {/* Location Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Location</Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>Address</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={editLocation}
                  onChangeText={setEditLocation}
                  placeholder="Enter your location"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>Search Radius (km)</Text>
                <View style={[styles.radiusContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TouchableOpacity 
                    style={[styles.radiusButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => setEditRadius(Math.max(1, editRadius - 1))}
                  >
                    <FontAwesome name="minus" size={16} color={colors.foreground} />
                  </TouchableOpacity>
                  <Text style={[styles.radiusValue, { color: colors.foreground }]}>{editRadius} km</Text>
                  <TouchableOpacity 
                    style={[styles.radiusButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => setEditRadius(Math.min(50, editRadius + 1))}
                  >
                    <FontAwesome name="plus" size={16} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Notifications Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Notification Preferences</Text>
              
              <View style={[styles.switchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.switchRow}>
                  <Text style={[styles.switchLabel, { color: colors.foreground }]}>Email Notifications</Text>
                  <Switch
                    value={editPreferences.notifications.email}
                    onValueChange={(value) => setEditPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: value }
                    }))}
                    trackColor={{ false: colors.border, true: colors.foreground }}
                    thumbColor={editPreferences.notifications.email ? colors.background : colors.muted}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={[styles.switchLabel, { color: colors.foreground }]}>Push Notifications</Text>
                  <Switch
                    value={editPreferences.notifications.push}
                    onValueChange={(value) => setEditPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: value }
                    }))}
                    trackColor={{ false: colors.border, true: colors.foreground }}
                    thumbColor={editPreferences.notifications.push ? colors.background : colors.muted}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={[styles.switchLabel, { color: colors.foreground }]}>Join Requests</Text>
                  <Switch
                    value={editPreferences.notifications.joinRequests}
                    onValueChange={(value) => setEditPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, joinRequests: value }
                    }))}
                    trackColor={{ false: colors.border, true: colors.foreground }}
                    thumbColor={editPreferences.notifications.joinRequests ? colors.background : colors.muted}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={[styles.switchLabel, { color: colors.foreground }]}>Activity Reminders</Text>
                  <Switch
                    value={editPreferences.notifications.activityReminders}
                    onValueChange={(value) => setEditPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, activityReminders: value }
                    }))}
                    trackColor={{ false: colors.border, true: colors.foreground }}
                    thumbColor={editPreferences.notifications.activityReminders ? colors.background : colors.muted}
                  />
                </View>
              </View>
            </View>

            {/* Password Change Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Change Password (Optional)</Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>Current Password</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter your current password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>New Password</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter your new password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>Confirm New Password</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your new password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.passwordNote}>
                <Text style={[styles.inputNote, { color: colors.muted }]}>
                  Leave password fields empty to keep your current password
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical * 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',

  },
  modalCancelText: {
    fontSize: FONT_SIZES.lg,
    color: '#666',
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#000',
  },
  modalSaveText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#000',
  },
  modalSaveTextDisabled: {
    color: '#ccc',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
  },
  inputContainer: {
    marginBottom: GAPS.large,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: '#000',
    marginBottom: GAPS.small,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.input.horizontal,
    paddingVertical: PADDING.input.vertical,
    fontSize: FONT_SIZES.md,
    backgroundColor: '#fff',
    minHeight: 56,
    height: 56,
  },
  textInputDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  inputNote: {
    fontSize: FONT_SIZES.sm,
    color: '#999',
    marginTop: GAPS.small,
  },
  sectionContainer: {
    marginBottom: GAPS.large,
    paddingBottom: GAPS.large,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#000',
    marginBottom: GAPS.medium,
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: GAPS.small,
  },
  radiusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: GAPS.medium,
  },
  radiusValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#000',
    minWidth: 60,
    textAlign: 'center',
  },
  switchContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: GAPS.medium,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  switchLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: '#000',
    flex: 1,
  },
  passwordNote: {
    marginTop: GAPS.large,
    padding: PADDING.card.horizontal,
    backgroundColor: '#f8f9fa',
    borderRadius: BORDER_RADIUS.medium,
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
