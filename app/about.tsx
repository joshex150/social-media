import React from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Linking, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

export default function AboutScreen() {
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Error", "Could not open link");
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
    <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
        <View style={styles.placeholder} />
      </View>

      {/* App Info Card */}
      <View style={styles.appCard}>
        <View style={styles.appIcon}>
          <FontAwesome name="link" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>{appInfo.name}</Text>
        <Text style={styles.appVersion}>Version {appInfo.version}</Text>
        <Text style={styles.appDescription}>{appInfo.description}</Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        {appInfo.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <FontAwesome name="check-circle" size={16} color="#10b981" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Team */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Team</Text>
        {teamMembers.map((member, index) => (
          <View key={index} style={styles.teamMember}>
            <View style={styles.memberAvatar}>
              <FontAwesome name="user" size={20} color="#000" />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => handleOpenLink(`mailto:${member.email}`)}
            >
              <FontAwesome name="envelope" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Legal Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        {legalLinks.map((link, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.linkItem}
            onPress={() => handleOpenLink(link.url)}
          >
            <View style={styles.linkLeft}>
              <FontAwesome name={link.icon as any} size={20} color="#000" />
              <Text style={styles.linkText}>{link.title}</Text>
            </View>
            <FontAwesome name="external-link" size={14} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Social Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connect With Us</Text>
        <View style={styles.socialGrid}>
          {socialLinks.map((link, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.socialItem}
              onPress={() => handleOpenLink(link.url)}
            >
              <FontAwesome name={link.icon as any} size={24} color="#000" />
              <Text style={styles.socialText}>{link.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* App Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>App Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Activities</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100K+</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
        </View>
      </View>

      {/* Copyright */}
      <View style={styles.copyright}>
        <Text style={styles.copyrightText}>
          © 2025 Link Up Inc. All rights reserved.
        </Text>
        <Text style={styles.copyrightSubtext}>
          Made with ❤️ for connecting people
        </Text>
      </View>
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
