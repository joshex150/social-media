import React from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useTheme } from "@/contexts/ThemeContext";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

export default function SitemapScreen() {
  const { colors } = useTheme();
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  const sitemapSections = [
    {
      title: "Main Navigation",
      items: [
        {
          id: 'home',
          title: 'Home',
          subtitle: 'Dashboard with activities and notifications',
          icon: 'home',
          route: '/(tabs)/index'
        },
        {
          id: 'map',
          title: 'Map',
          subtitle: 'Discover activities on the map',
          icon: 'map-pin',
          route: '/(tabs)/map'
        },
        {
          id: 'explore',
          title: 'Explore',
          subtitle: 'Browse and filter activities',
          icon: 'search',
          route: '/(tabs)/explore'
        },
        {
          id: 'chat',
          title: 'Chat',
          subtitle: 'Messages and conversations',
          icon: 'comment',
          route: '/(tabs)/chat'
        },
        {
          id: 'profile',
          title: 'Profile',
          subtitle: 'Your profile and settings',
          icon: 'user',
          route: '/(tabs)/profile'
        }
      ]
    },
    {
      title: "Activity Management",
      items: [
        {
          id: 'create-activity',
          title: 'Create Activity',
          subtitle: 'Start a new activity',
          icon: 'plus-circle',
          route: '/create-activity'
        },
        {
          id: 'activity-details',
          title: 'Activity Details',
          subtitle: 'View and manage activities',
          icon: 'info-circle',
          route: '/activity/[id]'
        }
      ]
    },
    {
      title: "Settings & Preferences",
      items: [
        {
          id: 'subscription-settings',
          title: 'Subscription Settings',
          subtitle: 'Manage your subscription plan',
          icon: 'credit-card',
          route: '/subscription-settings'
        },
        {
          id: 'notification-settings',
          title: 'Notification Settings',
          subtitle: 'Control your notifications',
          icon: 'bell',
          route: '/notification-settings'
        },
        {
          id: 'privacy-settings',
          title: 'Privacy Settings',
          subtitle: 'Manage your privacy',
          icon: 'shield',
          route: '/privacy-settings'
        },
        {
          id: 'billing-history',
          title: 'Billing History',
          subtitle: 'View your payment history',
          icon: 'file-text',
          route: '/billing-history'
        },
        {
          id: 'payment-methods',
          title: 'Payment Methods',
          subtitle: 'Manage your payment options',
          icon: 'credit-card',
          route: '/payment-methods'
        }
      ]
    },
    {
      title: "Authentication & Onboarding",
      items: [
        {
          id: 'login',
          title: 'Login',
          subtitle: 'Sign in to your account',
          icon: 'sign-in',
          route: '/login'
        },
        {
          id: 'onboarding',
          title: 'Onboarding',
          subtitle: 'Welcome and setup guide',
          icon: 'rocket',
          route: '/onboarding'
        }
      ]
    },
    {
      title: "Support & Information",
      items: [
        {
          id: 'help-support',
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          icon: 'question-circle',
          route: '/help-support'
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'App information and version',
          icon: 'info-circle',
          route: '/about'
        },
        {
          id: 'system-notifications',
          title: 'System Notifications',
          subtitle: 'View system messages',
          icon: 'envelope',
          route: '/system-notifications'
        }
      ]
    }
  ];

  const handleNavigation = (route: string) => {
    if (route.includes('[id]')) {
      // For dynamic routes, we can't navigate directly
      return;
    }
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, safeArea.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Sitemap</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Sitemap Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.sitemapContent}>
        <Text style={[styles.description, { color: colors.muted }]}>
          Navigate to any section of the app. Tap any item to go directly to that page.
        </Text>

        {sitemapSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={[styles.section, {  borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
            
            <View style={styles.sectionContainer}>
              {section.items.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.sitemapItem, { backgroundColor: colors.background, borderColor: colors.border }]} 
                  onPress={() => handleNavigation(item.route)}
                >
                  <View style={styles.sitemapLeft}>
                    <View style={[styles.sitemapIcon, { backgroundColor: colors.foreground }]}>
                      <FontAwesome name={item.icon as any} size={20} color={colors.background} />
                    </View>
                    <View style={styles.sitemapText}>
                      <Text style={[styles.sitemapTitle, { color: colors.foreground }]}>{item.title}</Text>
                      <Text style={[styles.sitemapSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <FontAwesome name="chevron-right" size={16} color={colors.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        </View>
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
    paddingBottom: PADDING.content.vertical * 2,
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
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  placeholder: {
    width: 40,
  },
  sitemapContent: {
    paddingHorizontal: PADDING.content.horizontal,
    paddingTop: 124, // Account for fixed header + safe area + extra spacing
  },
  description: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginBottom: GAPS.large,
    textAlign: "center",
  },
  section: {
    marginBottom: GAPS.large,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: GAPS.medium,
  },
  sectionContainer: {
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.content.horizontal,
  },
  sitemapItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: PADDING.content.vertical,
    borderBottomWidth: 1,
  },
  sitemapLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sitemapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sitemapText: {
    flex: 1,
  },
  sitemapTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: GAPS.small,
  },
  sitemapSubtitle: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
  },
});
