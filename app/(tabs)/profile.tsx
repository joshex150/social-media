import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, Modal, TextInput, Platform, KeyboardAvoidingView, Switch } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import type { User } from "@/services/api";

export default function ProfileScreen() {
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
  const { user, logout, updateProfile, updatePassword } = useApi();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
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

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    // Validate password fields if they are filled
    const hasPasswordFields = currentPassword.trim() || newPassword.trim() || confirmPassword.trim();
    if (hasPasswordFields) {
      if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
        Alert.alert('Error', 'Please fill in all password fields or leave them empty');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert('Error', 'New password must be at least 6 characters');
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
        Alert.alert('Error', profileResult.error || 'Failed to update profile');
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
          Alert.alert('Error', passwordResult.error || 'Failed to update password');
          setIsLoading(false);
          return;
        }
      }

      Alert.alert('Success', 'Profile updated successfully');
      setShowEditModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };


  const settingsItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'edit',
      onPress: handleEditProfile
    },
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
    },
    {
      id: 'sitemap',
      title: 'Sitemap',
      subtitle: 'Navigate to all app sections',
      icon: 'sitemap',
      onPress: () => router.push('/sitemap' as any)
    }
  ];

  return (
    <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* User Profile Card */}
      <TouchableOpacity style={styles.profileCard} onPress={handleEditProfile} activeOpacity={0.8}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <FontAwesome name="user" size={40} color="#fff" />
          </View>
          <View style={styles.editButton}>
            <FontAwesome name="camera" size={16} color="#fff" />
          </View>
        </View>
        <Text style={styles.userName}>{user?.name || 'Loading...'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'Loading...'}</Text>
        <Text style={styles.joinDate}>Member since {user?.joinDate || 'Loading...'}</Text>
        <View style={styles.editProfileHint}>
          <Text style={styles.editProfileHintText}>Tap to edit profile</Text>
          <FontAwesome name="chevron-right" size={12} color="#999" />
        </View>
      </TouchableOpacity>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.activitiesCreated || 0}</Text>
          <Text style={styles.statLabel}>Created</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.activitiesJoined || 0}</Text>
          <Text style={styles.statLabel}>Joined</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.connectionsMade || 0}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.streakDays || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Settings Section */}
      <Text style={styles.sectionTitle}>Settings</Text>
      
      <View style={styles.settingsContainer}>
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
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={20} color="#ff4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalHeader]}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Update Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={isLoading}>
              <Text style={[styles.modalSaveText, isLoading && styles.modalSaveTextDisabled]}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Basic Info Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.textInput, styles.textInputDisabled]}
                  value={editEmail}
                  editable={false}
                  placeholder="Email cannot be changed"
                />
                <Text style={styles.inputNote}>Email cannot be changed</Text>
              </View>
            </View>

            {/* Location Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Location</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.textInput}
                  value={editLocation}
                  onChangeText={setEditLocation}
                  placeholder="Enter your location"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Search Radius (km)</Text>
                <View style={styles.radiusContainer}>
                  <TouchableOpacity 
                    style={styles.radiusButton}
                    onPress={() => setEditRadius(Math.max(1, editRadius - 1))}
                  >
                    <FontAwesome name="minus" size={16} color="#000" />
                  </TouchableOpacity>
                  <Text style={styles.radiusValue}>{editRadius} km</Text>
                  <TouchableOpacity 
                    style={styles.radiusButton}
                    onPress={() => setEditRadius(Math.min(50, editRadius + 1))}
                  >
                    <FontAwesome name="plus" size={16} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Notifications Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Notification Preferences</Text>
              
              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Email Notifications</Text>
                  <Switch
                    value={editPreferences.notifications.email}
                    onValueChange={(value) => setEditPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: value }
                    }))}
                    trackColor={{ false: '#e0e0e0', true: '#000' }}
                    thumbColor={editPreferences.notifications.email ? '#fff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Push Notifications</Text>
                  <Switch
                    value={editPreferences.notifications.push}
                    onValueChange={(value) => setEditPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: value }
                    }))}
                    trackColor={{ false: '#e0e0e0', true: '#000' }}
                    thumbColor={editPreferences.notifications.push ? '#fff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Join Requests</Text>
                  <Switch
                    value={editPreferences.notifications.joinRequests}
                    onValueChange={(value) => setEditPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, joinRequests: value }
                    }))}
                    trackColor={{ false: '#e0e0e0', true: '#000' }}
                    thumbColor={editPreferences.notifications.joinRequests ? '#fff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Activity Reminders</Text>
                  <Switch
                    value={editPreferences.notifications.activityReminders}
                    onValueChange={(value) => setEditPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, activityReminders: value }
                    }))}
                    trackColor={{ false: '#e0e0e0', true: '#000' }}
                    thumbColor={editPreferences.notifications.activityReminders ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>
            </View>

            {/* Password Change Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Change Password (Optional)</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter your current password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter your new password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your new password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.passwordNote}>
                <Text style={styles.inputNote}>
                  Leave password fields empty to keep your current password
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
    width: "100%",
    minWidth: "100%",
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
});
