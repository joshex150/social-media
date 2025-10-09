import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Switch, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

export default function PrivacySettingsScreen() {
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

  const handleToggle = (key: string) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleProfileVisibility = () => {
    Alert.alert(
      "Profile Visibility",
      "Choose who can see your profile",
      [
        { text: "Public", onPress: () => setPrivacy(prev => ({ ...prev, profileVisibility: "public" })) },
        { text: "Friends Only", onPress: () => setPrivacy(prev => ({ ...prev, profileVisibility: "friends" })) },
        { text: "Private", onPress: () => setPrivacy(prev => ({ ...prev, profileVisibility: "private" })) },
        { text: "Cancel", style: "cancel" }
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
    <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Control your privacy settings and manage how your information is shared.
      </Text>

      {/* Privacy Groups */}
      {privacyGroups.map((group, groupIndex) => (
        <View key={groupIndex} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          
          {group.items.map((item, itemIndex) => (
            <View key={item.key} style={[
              styles.privacyItem,
              itemIndex === group.items.length - 1 && styles.lastItem
            ]}>
              <View style={styles.privacyLeft}>
                <View style={styles.privacyIcon}>
                  <FontAwesome name={item.icon as any} size={20} color="#000" />
                </View>
                <View style={styles.privacyText}>
                  <Text style={styles.privacyTitle}>{item.title}</Text>
                  <Text style={styles.privacySubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <View style={styles.privacyRight}>
                {item.type === "toggle" ? (
                  <Switch
                    value={privacy[item.key as keyof typeof privacy] as boolean}
                    onValueChange={() => handleToggle(item.key)}
                    trackColor={{ false: "#e9ecef", true: "#000" }}
                    thumbColor={privacy[item.key as keyof typeof privacy] ? "#fff" : "#fff"}
                  />
                ) : (
                  <TouchableOpacity onPress={handleProfileVisibility} style={styles.selectButton}>
                    <Text style={styles.selectText}>{getVisibilityText(item.value as string)}</Text>
                    <FontAwesome name="chevron-right" size={14} color="#ccc" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      ))}

      {/* Security Section */}
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Security</Text>
        
        <TouchableOpacity style={styles.securityItem}>
          <View style={styles.securityLeft}>
            <View style={styles.privacyIcon}>
              <FontAwesome name="lock" size={20} color="#000" />
            </View>
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>Change Password</Text>
              <Text style={styles.privacySubtitle}>Update your account password</Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.securityItem, styles.lastItem]}>
          <View style={styles.securityLeft}>
            <View style={styles.privacyIcon}>
              <FontAwesome name="mobile" size={20} color="#000" />
            </View>
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>Two-Factor Authentication</Text>
              <Text style={styles.privacySubtitle}>Add an extra layer of security</Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Data Management */}
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.dataItem}>
          <View style={styles.dataLeft}>
            <View style={styles.privacyIcon}>
              <FontAwesome name="download" size={20} color="#000" />
            </View>
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>Download My Data</Text>
              <Text style={styles.privacySubtitle}>Get a copy of your data</Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.dataItem, styles.lastItem]}>
          <View style={styles.dataLeft}>
            <View style={styles.privacyIcon}>
              <FontAwesome name="trash" size={20} color="#ff4444" />
            </View>
            <View style={styles.privacyText}>
              <Text style={[styles.privacyTitle, { color: "#ff4444" }]}>Delete Account</Text>
              <Text style={styles.privacySubtitle}>Permanently delete your account</Text>
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
  privacyItem: {
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
    borderBottomColor: "#e9ecef",
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
    borderBottomColor: "#e9ecef",
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
