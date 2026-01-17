import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Switch,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  PADDING,
  MARGIN,
  GAPS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
} from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import { useTheme } from "@/contexts/ThemeContext";
import CustomAlert from "@/components/CustomAlert";
import { useCustomAlert } from "@/hooks/useCustomAlert";

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { user, updateProfile, updatePassword, isAuthenticated } = useApi();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    radius: 10,
    notifications: {
      email: true,
      push: true,
      joinRequests: true,
      activityReminders: true,
    },
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const { alert, showAlert, hideAlert } = useCustomAlert();

  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        location: user.location?.address || "",
        radius: user.preferences?.radius || 10,
        notifications: {
          email: user.preferences?.notifications?.email ?? true,
          push: user.preferences?.notifications?.push ?? true,
          joinRequests: user.preferences?.notifications?.joinRequests ?? true,
          activityReminders: user.preferences?.notifications?.activityReminders ?? true,
        },
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.startsWith("notifications.")) {
      const notificationField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Prevent multiple submissions
    if (loading || isSubmittingRef.current) {
      return;
    }

    if (!formData.name.trim()) {
      showAlert("Error", "Please enter your name", "error");
      return;
    }

    // Validate password fields if they are filled
    const hasPasswordFields =
      passwordData.currentPassword.trim() ||
      passwordData.newPassword.trim() ||
      passwordData.confirmPassword.trim();

    if (hasPasswordFields) {
      if (
        !passwordData.currentPassword.trim() ||
        !passwordData.newPassword.trim() ||
        !passwordData.confirmPassword.trim()
      ) {
        showAlert(
          "Error",
          "Please fill in all password fields or leave them empty",
          "error"
        );
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showAlert("Error", "New passwords do not match", "error");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        showAlert("Error", "New password must be at least 6 characters", "error");
        return;
      }
    }

    setLoading(true);
    isSubmittingRef.current = true;

    try {
      // Update profile data
      const profileData = {
        name: formData.name.trim(),
        location: formData.location.trim()
          ? { address: formData.location.trim() }
          : undefined,
        preferences: {
          radius: formData.radius,
          notifications: formData.notifications,
        },
      };

      const profileResult = await updateProfile(profileData);
      if (!profileResult.success) {
        showAlert("Error", profileResult.error || "Failed to update profile", "error");
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      // Update password if password fields are filled
      if (hasPasswordFields) {
        const passwordResult = await updatePassword({
          currentPassword: passwordData.currentPassword.trim(),
          newPassword: passwordData.newPassword.trim(),
        });

        if (!passwordResult.success) {
          showAlert("Error", passwordResult.error || "Failed to update password", "error");
          setLoading(false);
          isSubmittingRef.current = false;
          return;
        }
      }

      showAlert("Success", "Profile updated successfully", "success", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      showAlert("Error", "Failed to update profile", "error");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          safeArea.header,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={styles.backButton}
        >
          <FontAwesome name="times" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Update Profile
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}
        >
          <Text
            style={[
              styles.saveButtonText,
              { color: loading ? colors.muted : colors.foreground },
            ]}
          >
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Basic Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Name *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              placeholder="Enter your name"
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                styles.inputDisabled,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.muted,
                },
              ]}
              value={formData.email}
              editable={false}
              placeholder="Email cannot be changed"
              placeholderTextColor={colors.muted}
            />
            <Text style={[styles.inputNote, { color: colors.muted }]}>
              Email cannot be changed
            </Text>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Location
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Address</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={formData.location}
              onChangeText={(text) => handleInputChange("location", text)}
              placeholder="Enter your location"
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Search Radius (km)
            </Text>
            <View
              style={[
                styles.radiusContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.radiusButton,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
                onPress={() =>
                  handleInputChange("radius", Math.max(1, formData.radius - 1))
                }
              >
                <FontAwesome name="minus" size={16} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.radiusValue, { color: colors.foreground }]}>
                {formData.radius} km
              </Text>
              <TouchableOpacity
                style={[
                  styles.radiusButton,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
                onPress={() =>
                  handleInputChange("radius", Math.min(50, formData.radius + 1))
                }
              >
                <FontAwesome name="plus" size={16} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notification Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Notification Preferences
          </Text>

          <View
            style={[
              styles.switchContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.foreground }]}>
                Email Notifications
              </Text>
              <Switch
                value={formData.notifications.email}
                onValueChange={(value) =>
                  handleInputChange("notifications.email", value)
                }
                trackColor={{ false: colors.border, true: colors.foreground }}
                thumbColor={
                  formData.notifications.email ? colors.background : colors.muted
                }
              />
            </View>

            <View style={[styles.switchDivider, { borderColor: colors.border }]} />

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.foreground }]}>
                Push Notifications
              </Text>
              <Switch
                value={formData.notifications.push}
                onValueChange={(value) =>
                  handleInputChange("notifications.push", value)
                }
                trackColor={{ false: colors.border, true: colors.foreground }}
                thumbColor={
                  formData.notifications.push ? colors.background : colors.muted
                }
              />
            </View>

            <View style={[styles.switchDivider, { borderColor: colors.border }]} />

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.foreground }]}>
                Join Requests
              </Text>
              <Switch
                value={formData.notifications.joinRequests}
                onValueChange={(value) =>
                  handleInputChange("notifications.joinRequests", value)
                }
                trackColor={{ false: colors.border, true: colors.foreground }}
                thumbColor={
                  formData.notifications.joinRequests
                    ? colors.background
                    : colors.muted
                }
              />
            </View>

            <View style={[styles.switchDivider, { borderColor: colors.border }]} />

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.foreground }]}>
                Activity Reminders
              </Text>
              <Switch
                value={formData.notifications.activityReminders}
                onValueChange={(value) =>
                  handleInputChange("notifications.activityReminders", value)
                }
                trackColor={{ false: colors.border, true: colors.foreground }}
                thumbColor={
                  formData.notifications.activityReminders
                    ? colors.background
                    : colors.muted
                }
              />
            </View>
          </View>
        </View>

        {/* Change Password Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Change Password (Optional)
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Current Password
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={passwordData.currentPassword}
              onChangeText={(text) => handlePasswordChange("currentPassword", text)}
              placeholder="Enter your current password"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              New Password
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={passwordData.newPassword}
              onChangeText={(text) => handlePasswordChange("newPassword", text)}
              placeholder="Enter your new password"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Confirm New Password
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={passwordData.confirmPassword}
              onChangeText={(text) => handlePasswordChange("confirmPassword", text)}
              placeholder="Confirm your new password"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View
            style={[
              styles.passwordNote,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.inputNote, { color: colors.muted }]}>
              Leave password fields empty to keep your current password
            </Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 32,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 32,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 44,
    minWidth: 60,
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: PADDING.content.horizontal,
    paddingTop: 130, // Account for fixed header + safe area + extra spacing
    paddingBottom: PADDING.content.vertical,
  },
  section: {
    marginBottom: GAPS.large,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: GAPS.medium,
  },
  inputGroup: {
    marginBottom: GAPS.medium,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: GAPS.small,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.input.horizontal,
    paddingVertical: PADDING.input.vertical,
    fontSize: FONT_SIZES.md,
    minHeight: 56,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputNote: {
    fontSize: FONT_SIZES.sm,
    marginTop: GAPS.small,
  },
  radiusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: GAPS.medium,
  },
  radiusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginHorizontal: GAPS.medium,
  },
  radiusValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    minWidth: 60,
    textAlign: "center",
  },
  switchContainer: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: GAPS.medium,
  },
  switchDivider: {
    borderBottomWidth: 1,
    marginVertical: GAPS.small,
  },
  switchLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    flex: 1,
  },
  passwordNote: {
    marginTop: GAPS.medium,
    // padding: PADDING.card.horizontal,
    paddingVertical: PADDING.card.vertical,
    paddingBottom: PADDING.card.vertical*1.5,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
