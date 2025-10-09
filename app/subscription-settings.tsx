import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import SubscriptionTier from "@/components/SubscriptionTier";
import UpgradePrompt from "@/components/UpgradePrompt";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

export default function SubscriptionSettingsScreen() {
  const [tiers, setTiers] = useState<any>({});
  const [currentTier, setCurrentTier] = useState('free');
  const [usage, setUsage] = useState({ activities: 0, daysUsed: 0, maxActivities: 3 });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showDailySuggestions, setShowDailySuggestions] = useState(false);
  const [dismissedPrompt, setDismissedPrompt] = useState(false);
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();
      
      setTiers(data.tiers);
      setCurrentTier(data.currentTier);
      setUsage(data.usage);
      setShowUpgradePrompt(data.showUpgradePrompt);
      setShowDailySuggestions(data.showDailySuggestions);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    }
  };

  const handleUpgrade = async (tier: string) => {
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', `Successfully upgraded to ${tiers[tier].name}!`);
        setCurrentTier(tier);
        setShowUpgradePrompt(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Upgrade failed. Please try again.');
    }
  };

  const handleDismissPrompt = () => {
    setDismissedPrompt(true);
  };

  return (
    <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Subscription & Billing</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Current Plan Status */}
      {usage.activities >= usage.maxActivities && currentTier === 'free' && (
        <View style={styles.limitBanner}>
          <FontAwesome name="exclamation-triangle" size={20} color="#fff" />
          <View style={styles.limitText}>
            <Text style={styles.limitTitle}>Activity limit reached</Text>
            <Text style={styles.limitSubtitle}>Upgrade to create more activities</Text>
          </View>
        </View>
      )}

      {/* Upgrade Prompt */}
      {showUpgradePrompt && !dismissedPrompt && (
        <UpgradePrompt
          onUpgrade={() => handleUpgrade('silver')}
          onDismiss={handleDismissPrompt}
          daysUsed={usage.daysUsed}
        />
      )}

      {/* Daily Suggestions */}
      {showDailySuggestions && (
        <View style={styles.suggestionsCard}>
          <FontAwesome name="lightbulb-o" size={20} color="#f59e0b" />
          <View style={styles.suggestionsText}>
            <Text style={styles.suggestionsTitle}>Daily Suggestions</Text>
            <Text style={styles.suggestionsSubtitle}>Based on your interests</Text>
          </View>
        </View>
      )}

      {/* Usage Card */}
      <View style={styles.usageCard}>
        <Text style={styles.usageTitle}>Your Usage</Text>
        <View style={styles.usageStats}>
          <View style={styles.usageItem}>
            <Text style={styles.usageNumber}>
              {usage.activities} / {usage.maxActivities === -1 ? '∞' : usage.maxActivities}
            </Text>
            <Text style={styles.usageLabel}>Activities Used</Text>
          </View>
          <View style={styles.usageItem}>
            <Text style={styles.usageNumber}>{usage.daysUsed}</Text>
            <Text style={styles.usageLabel}>Days Active</Text>
          </View>
        </View>
      </View>

      {/* Available Plans */}
      <Text style={styles.sectionTitle}>Available Plans</Text>

      {Object.entries(tiers).map(([key, tier]: [string, any]) => (
        <SubscriptionTier
          key={key}
          tier={key}
          isActive={currentTier === key}
          onUpgrade={handleUpgrade}
          limits={tier}
        />
      ))}

      {/* Billing Information */}
      <View style={styles.billingCard}>
        <Text style={styles.billingTitle}>Billing Information</Text>
        <TouchableOpacity 
          style={styles.billingItem}
          onPress={() => router.push('/payment-methods' as any)}
        >
          <FontAwesome name="credit-card" size={20} color="#000" />
          <Text style={styles.billingText}>Payment Methods</Text>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.billingItem}
          onPress={() => router.push('/billing-history' as any)}
        >
          <FontAwesome name="file-text-o" size={20} color="#000" />
          <Text style={styles.billingText}>Billing History</Text>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>
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
  limitBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff4444",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    marginBottom: PADDING.content.vertical,
  },
  limitText: {
    marginLeft: GAPS.medium,
    flex: 1,
  },
  limitTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#fff",
    marginBottom: GAPS.xs,
  },
  limitSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#ffcccc",
  },
  suggestionsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    marginBottom: PADDING.content.vertical,
  },
  suggestionsText: {
    marginLeft: GAPS.medium,
    flex: 1,
  },
  suggestionsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.xs,
  },
  suggestionsSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
  },
  usageCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    marginBottom: PADDING.content.vertical,
  },
  usageTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.medium,
  },
  usageStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  usageItem: {
    alignItems: "center",
  },
  usageNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
    marginBottom: GAPS.xs,
  },
  usageLabel: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: PADDING.content.horizontal,
  },
  billingCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    marginTop: PADDING.content.vertical,
  },
  billingTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.medium,
  },
  billingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: GAPS.medium,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  billingText: {
    fontSize: FONT_SIZES.md,
    color: "#000",
    marginLeft: GAPS.medium,
    flex: 1,
  },
});
