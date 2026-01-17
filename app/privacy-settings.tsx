import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Switch, Modal } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useTheme } from "@/contexts/ThemeContext";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";

export default function PrivacySettingsScreen() {
  const { colors } = useTheme();
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showLocation: true,
    showActivities: true,
    allowMessages: true,
    dataSharing: false,
    analytics: true,
    crashReports: true,
  });
  const [activityMode, setActivityMode] = useState<'normal' | 'side-quest' | null>(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { alert, showAlert, hideAlert } = useCustomAlert();

  // Load saved activity mode on mount
  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('activityMode');
        if (savedMode && (savedMode === 'normal' || savedMode === 'side-quest')) {
          setActivityMode(savedMode);
        }
      } catch (error) {
        // Ignore errors
      }
    };
    loadMode();
  }, []);

  const modes = [
    {
      id: 'normal' as const,
      icon: 'compass',
      label: 'Normal Mode',
      description: 'Activities based on your interests, paired with explorers'
    },
    {
      id: 'side-quest' as const,
      icon: 'rocket',
      label: 'Side Quest Mode',
      description: 'New adventures, paired with adventurers'
    }
  ];

  const handleToggle = (key: string) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleProfileVisibility = () => {
    showAlert(
      "Profile Visibility",
      "Choose who can see your profile",
      "info",
      [
        { text: "Public", onPress: () => setPrivacy(prev => ({ ...prev, profileVisibility: "public" })) },
        { text: "Friends Only", onPress: () => setPrivacy(prev => ({ ...prev, profileVisibility: "friends" })) },
        { text: "Private", onPress: () => setPrivacy(prev => ({ ...prev, profileVisibility: "private" })) },
        { text: "Cancel", style: "cancel", onPress: () => { } }
      ]
    );
  };

  const handleActivityModeChange = async (mode: 'normal' | 'side-quest' | null) => {
    setActivityMode(mode);
    setShowModeModal(false);
    try {
      if (mode) {
        await AsyncStorage.setItem('activityMode', mode);
        await AsyncStorage.setItem('activityModeSelectedTime', Date.now().toString());
        showAlert(
          'Mode Updated',
          `You're now in ${mode === 'normal' ? 'Normal Mode' : 'Side Quest Mode'}`,
          'success'
        );
      } else {
        // Clear both mode and timestamp so VibeCheck shows again
        // This will trigger VibeCheck to show again when the home screen is focused
        await AsyncStorage.removeItem('activityMode');
        await AsyncStorage.removeItem('activityModeSelectedTime');
        showAlert(
          'Mode Cleared',
          'Activity mode has been cleared. The mode selector will appear on the home screen.',
          'success'
        );
      }
    } catch (error) {
      showAlert('Error', 'Failed to save mode', 'error');
    }
  };

  const handleActivityModeSelect = () => {
    setShowModeModal(true);
  };

  const privacyGroups = [
    {
      title: "Profile & Activity",
      items: [
        {
          key: "profileVisibility",
          title: "Profile Visibility",
          subtitle: "Who can see your profile",
          icon: "eye",
          type: "select",
          value: privacy.profileVisibility
        },
        {
          key: "showLocation",
          title: "Show Location",
          subtitle: "Display your general location",
          icon: "map-marker",
          type: "toggle"
        },
        {
          key: "showActivities",
          title: "Show Activities",
          subtitle: "Display your activity history",
          icon: "calendar",
          type: "toggle"
        },
        {
          key: "allowMessages",
          title: "Allow Messages",
          subtitle: "Let others send you messages",
          icon: "comment",
          type: "toggle"
        }
      ]
    },
    {
      title: "Data & Privacy",
      items: [
        {
          key: "dataSharing",
          title: "Data Sharing",
          subtitle: "Share anonymized data for app improvement",
          icon: "share",
          type: "toggle"
        },
        {
          key: "analytics",
          title: "Analytics",
          subtitle: "Help us improve the app experience",
          icon: "bar-chart",
          type: "toggle"
        },
        {
          key: "crashReports",
          title: "Crash Reports",
          subtitle: "Send crash reports to help fix bugs",
          icon: "bug",
          type: "toggle"
        }
      ]
    }
  ];

  const getVisibilityText = (value: string) => {
    switch (value) {
      case "public": return "Public";
      case "friends": return "Friends Only";
      case "private": return "Private";
      default: return "Public";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, safeArea.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>

        {/* Description */}
        <Text style={[styles.description, { color: colors.muted }]}>
          Control your privacy settings and manage how your information is shared.
        </Text>

        {/* Privacy Groups */}
        {privacyGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={[styles.group, { borderColor: colors.border }]}>
            <Text style={[styles.groupTitle, { color: colors.foreground }]}>{group.title}</Text>

            {group.items.map((item, itemIndex) => (
              <View key={item.key} style={[
                styles.privacyItem,
                { backgroundColor: colors.background, borderColor: colors.border },
                itemIndex === group.items.length - 1 && styles.lastItem
              ]}>
                <View style={styles.privacyLeft}>
                  <View style={[styles.privacyIcon, { backgroundColor: colors.foreground }]}>
                    <FontAwesome name={item.icon as any} size={20} color={colors.background} />
                  </View>
                  <View style={styles.privacyText}>
                    <Text style={[styles.privacyTitle, { color: colors.foreground }]}>{item.title}</Text>
                    <Text style={[styles.privacySubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.privacyRight}>
                  {item.type === "toggle" ? (
                    <Switch
                      value={privacy[item.key as keyof typeof privacy] as boolean}
                      onValueChange={() => handleToggle(item.key)}
                      trackColor={{ false: colors.border, true: colors.foreground }}
                      thumbColor={privacy[item.key as keyof typeof privacy] ? colors.background : colors.muted}
                    />
                  ) : (
                    <TouchableOpacity onPress={handleProfileVisibility} style={[styles.selectButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Text style={[styles.selectText, { color: colors.foreground }]}>{getVisibilityText(item.value as string)}</Text>
                      <FontAwesome name="chevron-right" size={14} color={colors.muted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Activity Mode Section */}
        <View style={[styles.group, { borderColor: colors.border }]}>
          <Text style={[styles.groupTitle, { color: colors.foreground }]}>Activity Discovery</Text>

          <TouchableOpacity
            style={[styles.privacyItem, styles.lastItem, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={handleActivityModeSelect}
          >
            <View style={styles.privacyLeft}>
              <View style={[styles.privacyIcon, { backgroundColor: colors.foreground }]}>
                <FontAwesome
                  name={activityMode === null ? 'sliders' : activityMode === 'normal' ? 'compass' : 'rocket'}
                  size={20}
                  color={colors.background}
                />
              </View>
              <View style={styles.privacyText}>
                <Text style={[styles.privacyTitle, { color: colors.foreground }]}>Activity Mode</Text>
                <Text style={[styles.privacySubtitle, { color: colors.muted }]}>
                  {activityMode === null
                    ? 'No mode selected - showing all activities'
                    : activityMode === 'normal'
                      ? 'Normal Mode: Activities based on your interests, paired with explorers'
                      : 'Side Quest Mode: New adventures, paired with adventurers'}
                </Text>
              </View>
            </View>
            <View style={styles.privacyRight}>
              <TouchableOpacity
                onPress={handleActivityModeSelect}
                style={[styles.selectButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <Text style={[styles.selectText, { color: colors.foreground }]}>
                  {activityMode === null ? 'Not Set' : activityMode === 'normal' ? 'Normal' : 'Side Quest'}
                </Text>
                <FontAwesome name="chevron-right" size={14} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <View style={[styles.group, { borderColor: colors.border }]}>
          <Text style={[styles.groupTitle, { color: colors.foreground }]}>Security</Text>

          <TouchableOpacity style={[styles.securityItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.securityLeft}>
              <View style={[styles.privacyIcon, { backgroundColor: colors.foreground }]}>
                <FontAwesome name="lock" size={20} color={colors.background} />
              </View>
              <View style={styles.privacyText}>
                <Text style={[styles.privacyTitle, { color: colors.foreground }]}>Change Password</Text>
                <Text style={[styles.privacySubtitle, { color: colors.muted }]}>Update your account password</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={16} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.securityItem, styles.lastItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.securityLeft}>
              <View style={[styles.privacyIcon, { backgroundColor: colors.foreground }]}>
                <FontAwesome name="mobile" size={20} color={colors.background} />
              </View>
              <View style={styles.privacyText}>
                <Text style={[styles.privacyTitle, { color: colors.foreground }]}>Two-Factor Authentication</Text>
                <Text style={[styles.privacySubtitle, { color: colors.muted }]}>Add an extra layer of security</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={[styles.group, { borderColor: colors.border }]}>
          <Text style={[styles.groupTitle, { color: colors.foreground }]}>Data Management</Text>

          <TouchableOpacity style={[styles.dataItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.dataLeft}>
              <View style={[styles.privacyIcon, { backgroundColor: colors.foreground }]}>
                <FontAwesome name="download" size={20} color={colors.background} />
              </View>
              <View style={styles.privacyText}>
                <Text style={[styles.privacyTitle, { color: colors.foreground }]}>Download My Data</Text>
                <Text style={[styles.privacySubtitle, { color: colors.muted }]}>Get a copy of your data</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={16} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dataItem, styles.lastItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.dataLeft}>
              <View style={[styles.privacyIcon, { backgroundColor: colors.error }]}>
                <FontAwesome name="trash" size={20} color={colors.background} />
              </View>
              <View style={styles.privacyText}>
                <Text style={[styles.privacyTitle, { color: colors.error }]}>Delete Account</Text>
                <Text style={[styles.privacySubtitle, { color: colors.muted }]}>Permanently delete your account</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.foreground }]}>
          <Text style={[styles.saveButtonText, { color: colors.background }]}>Save Changes</Text>
        </TouchableOpacity>

        {/* Activity Mode Selection Modal */}
        <Modal
          visible={showModeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowModeModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModeModal(false)}
          >
            <View
              style={[styles.modeModalContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onStartShouldSetResponder={() => true}
            >
              {/* Header */}
              <View style={[styles.modeModalHeader, { borderColor: colors.border }]}>
                <Text style={[styles.modeModalTitle, { color: colors.foreground }]}>Select Activity Mode</Text>
                <TouchableOpacity
                  onPress={() => setShowModeModal(false)}
                  style={styles.modeModalClose}
                >
                  <FontAwesome name="times" size={20} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              {/* Mode Options */}
              <View style={styles.modeOptionsContainer}>
                {modes.map((mode) => (
                  <TouchableOpacity
                    key={mode.id}
                    style={[
                      styles.modeOption,
                      {
                        backgroundColor: colors.background,
                        borderColor: activityMode === mode.id ? colors.accent : colors.border
                      },
                      activityMode === mode.id && styles.modeOptionSelected
                    ]}
                    onPress={() => handleActivityModeChange(mode.id)}
                  >
                    <View style={[
                      styles.modeOptionIcon,
                      { backgroundColor: activityMode === mode.id ? colors.accent : colors.surface }
                    ]}>
                      <FontAwesome
                        name={mode.icon as any}
                        size={24}
                        color={activityMode === mode.id ? colors.background : colors.foreground}
                      />
                    </View>
                    <View style={styles.modeOptionContent}>
                      <Text style={[styles.modeOptionLabel, { color: colors.foreground }]}>
                        {mode.label}
                      </Text>
                      <Text style={[styles.modeOptionDescription, { color: colors.muted }]}>
                        {mode.description}
                      </Text>
                    </View>
                    {activityMode === mode.id && (
                      <FontAwesome name="check-circle" size={20} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Clear Selection Button */}
              {activityMode !== null && (
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => handleActivityModeChange(null)}
                >
                  <FontAwesome name="times-circle" size={18} color={colors.muted} />
                  <Text style={[styles.clearButtonText, { color: colors.muted }]}>Clear Selection</Text>
                </TouchableOpacity>
              )}

              {/* Cancel Button */}
              {/* <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setShowModeModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.foreground }]}>Cancel</Text>
            </TouchableOpacity> */}
            </View>
          </TouchableOpacity>
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
  contentContainer: {
    paddingHorizontal: PADDING.content.horizontal,
    paddingTop: 124, // Account for fixed header + safe area + extra spacing
    paddingBottom: PADDING.content.vertical,
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
    marginTop: PADDING.content.vertical,
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
  privacyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: PADDING.card.horizontal,
    borderBottomWidth: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: BORDER_RADIUS.medium,
    borderBottomRightRadius: BORDER_RADIUS.medium,
  },
  privacyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.small,
  },
  privacySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
  },
  privacyRight: {
    marginLeft: GAPS.medium,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectText: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    marginRight: GAPS.small,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: PADDING.card.horizontal,
    borderBottomWidth: 1,
  },
  securityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: PADDING.card.horizontal,
    borderBottomWidth: 1,
  },
  dataLeft: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING.content.horizontal,
  },
  modeModalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.large,
    padding: 0,
    borderWidth: 1,
  },
  modeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: PADDING.content.horizontal,
    borderBottomWidth: 1,
  },
  modeModalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  modeModalClose: {
    padding: GAPS.small,
  },
  modeOptionsContainer: {
    padding: PADDING.content.horizontal,
    gap: GAPS.medium,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PADDING.card.horizontal,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 2,
    gap: GAPS.medium,
  },
  modeOptionSelected: {
    borderWidth: 2,
  },
  modeOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeOptionContent: {
    flex: 1,
  },
  modeOptionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: 4,
  },
  modeOptionDescription: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: PADDING.card.horizontal,
    marginHorizontal: PADDING.content.horizontal,
    marginTop: GAPS.medium,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    gap: GAPS.small,
  },
  clearButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  cancelButton: {
    margin: PADDING.content.horizontal,
    marginTop: GAPS.medium,
    padding: PADDING.card.horizontal,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    display:'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GAPS.small,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
