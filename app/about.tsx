import React from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Linking } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useTheme } from "@/contexts/ThemeContext";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";

export default function AboutScreen() {
  const { colors } = useTheme();
  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { alert, showAlert, hideAlert } = useCustomAlert();

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      showAlert("Error", "Could not open link", "error");
    }
  };

  const appInfo = {
    name: "Link Up",
    version: "1.0.0",
    build: "2025.01.15",
    description: "Connect with people around you through shared activities and experiences.",
    features: [
      "Create and join local activities",
      "Connect with like-minded people",
      "Real-time messaging and chat",
      "Location-based discovery",
      "Activity recommendations",
      "Secure and private"
    ]
  };

  const teamMembers = [
    {
      name: "John Doe",
      role: "Founder & CEO",
      email: "john@linkup.app"
    },
    {
      name: "Jane Smith",
      role: "Lead Developer",
      email: "jane@linkup.app"
    },
    {
      name: "Mike Johnson",
      role: "Design Director",
      email: "mike@linkup.app"
    }
  ];

  const legalLinks = [
    {
      title: "Terms of Service",
      url: "https://linkup.app/terms",
      icon: "file-text-o"
    },
    {
      title: "Privacy Policy",
      url: "https://linkup.app/privacy",
      icon: "shield"
    },
    {
      title: "Cookie Policy",
      url: "https://linkup.app/cookies",
      icon: "cookie-bite"
    },
    {
      title: "Open Source Licenses",
      url: "https://linkup.app/licenses",
      icon: "code"
    }
  ];

  const socialLinks = [
    {
      title: "Website",
      url: "https://linkup.app",
      icon: "globe"
    },
    {
      title: "Twitter",
      url: "https://twitter.com/linkup",
      icon: "twitter"
    },
    {
      title: "Instagram",
      url: "https://instagram.com/linkup",
      icon: "instagram"
    },
    {
      title: "LinkedIn",
      url: "https://linkedin.com/company/linkup",
      icon: "linkedin"
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, safeArea.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>About</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>

      {/* App Info Card */}
      <View style={[styles.appCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.appIcon, { backgroundColor: colors.foreground }]}>
          <FontAwesome name="link" size={40} color={colors.background} />
        </View>
        <Text style={[styles.appName, { color: colors.foreground }]}>{appInfo.name}</Text>
        <Text style={[styles.appVersion, { color: colors.muted }]}>Version {appInfo.version}</Text>
        <Text style={[styles.appDescription, { color: colors.muted }]}>{appInfo.description}</Text>
      </View>

      {/* Features */}
      <View style={[styles.section, {  borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Features</Text>
        {appInfo.features.map((feature, index) => (
          <View key={index} style={[styles.featureItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <FontAwesome name="check-circle" size={16} color={colors.accent} />
            <Text style={[styles.featureText, { color: colors.foreground }]}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Team */}
      <View style={[styles.section, {  borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Our Team</Text>
        {teamMembers.map((member, index) => (
          <View key={index} style={[styles.teamMember, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.memberAvatar, { backgroundColor: colors.foreground }]}>
              <FontAwesome name="user" size={20} color={colors.background} />
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: colors.foreground }]}>{member.name}</Text>
              <Text style={[styles.memberRole, { color: colors.muted }]}>{member.role}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.contactButton, { backgroundColor: colors.foreground }]}
              onPress={() => handleOpenLink(`mailto:${member.email}`)}
            >
              <FontAwesome name="envelope" size={16} color={colors.background} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Legal Links */}
      <View style={[styles.section, {  borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Legal</Text>
        {legalLinks.map((link, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.linkItem, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => handleOpenLink(link.url)}
          >
            <View style={styles.linkLeft}>
              <FontAwesome name={link.icon as any} size={20} color={colors.foreground} />
              <Text style={[styles.linkText, { color: colors.foreground }]}>{link.title}</Text>
            </View>
            <FontAwesome name="external-link" size={14} color={colors.muted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Social Links */}
      <View style={[styles.section, {  borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Connect With Us</Text>
        <View style={styles.socialGrid}>
          {socialLinks.map((link, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.socialItem, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => handleOpenLink(link.url)}
            >
              <FontAwesome name={link.icon as any} size={24} color={colors.foreground} />
              <Text style={[styles.socialText, { color: colors.foreground }]}>{link.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* App Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.statsTitle, { color: colors.foreground }]}>App Statistics</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statItem, {  borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.foreground }]}>10K+</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Users</Text>
          </View>
          <View style={[styles.statItem, {  borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.foreground }]}>50K+</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Activities</Text>
          </View>
          <View style={[styles.statItem, {  borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.foreground }]}>100K+</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Connections</Text>
          </View>
        </View>
      </View>

      {/* Copyright */}
      <View style={[styles.copyright, {  borderColor: colors.border }]}>
        <Text style={[styles.copyrightText, { color: colors.muted }]}>
          © 2025 Link Up Inc. All rights reserved.
        </Text>
        <Text style={[styles.copyrightSubtext, { color: colors.muted }]}>
          Made with ❤️ for connecting people
        </Text>
      </View>

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
  appCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    alignItems: "center",
    marginBottom: PADDING.content.vertical,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: GAPS.medium,
  },
  appName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
    marginBottom: GAPS.small,
  },
  appVersion: {
    fontSize: FONT_SIZES.md,
    color: "#666",
    marginBottom: GAPS.medium,
  },
  appDescription: {
    fontSize: FONT_SIZES.md,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: PADDING.content.vertical,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.medium,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
    borderBottomWidth: 1,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: "#000",
    marginLeft: GAPS.medium,
    flex: 1,
  },
  teamMember: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
    borderBottomWidth: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.small,
  },
  memberRole: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
    borderBottomWidth: 1,
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  linkText: {
    fontSize: FONT_SIZES.md,
    color: "#000",
    marginLeft: GAPS.medium,
  },
  socialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  socialItem: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    alignItems: "center",
    marginBottom: GAPS.small,
  },
  socialText: {
    fontSize: FONT_SIZES.sm,
    color: "#000",
    marginTop: GAPS.small,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statsCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    marginBottom: PADDING.content.vertical,
  },
  statsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.medium,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
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
  },
  copyright: {
    alignItems: "center",
    paddingVertical: PADDING.content.vertical,
  },
  copyrightText: {
    fontSize: FONT_SIZES.sm,
    color: "#999",
    textAlign: "center",
  },
  copyrightSubtext: {
    fontSize: FONT_SIZES.xs,
    color: "#ccc",
    marginTop: GAPS.small,
    textAlign: "center",
  },
});
