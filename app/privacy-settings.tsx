import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Switch } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
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
  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { alert, showAlert, hideAlert } = useCustomAlert();

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
        { text: "Cancel", style: "cancel", onPress: () => {} }
      ]
    );
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
        <View key={groupIndex} style={[styles.group, {  borderColor: colors.border }]}>
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

      {/* Security Section */}
      <View style={[styles.group, {  borderColor: colors.border }]}>
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
      <View style={[styles.group, {  borderColor: colors.border }]}>
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
});
