import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, Alert } from "react-native";
import SubscriptionTier from "@/components/SubscriptionTier";
import UpgradePrompt from "@/components/UpgradePrompt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";

export default function SubscriptionScreen() {
  const [tiers, setTiers] = useState<any>({});
  const [currentTier, setCurrentTier] = useState('free');
  const [usage, setUsage] = useState({ activities: 0, daysUsed: 0, maxActivities: 3 });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showDailySuggestions, setShowDailySuggestions] = useState(false);
  const [dismissedPrompt, setDismissedPrompt] = useState(false);
  const safeArea = useSafeAreaStyle();

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
    <ScrollView style={[styles.container, safeArea.content]} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.header]}>
        <Text style={styles.title}>Subscription</Text>
        {usage.activities >= usage.maxActivities && currentTier === 'free' && (
          <View style={styles.limitBanner}>
            <Text style={styles.limitTitle}>Activity limit reached</Text>
            <Text style={styles.limitSubtitle}>Upgrade to create more activities</Text>
          </View>
        )}
      </View>

      {showUpgradePrompt && !dismissedPrompt && (
        <UpgradePrompt
          onUpgrade={() => handleUpgrade('silver')}
          onDismiss={handleDismissPrompt}
          daysUsed={usage.daysUsed}
        />
      )}

      {showDailySuggestions && (
        <View style={styles.suggestionsCard}>
          <Text style={styles.suggestionsTitle}>Daily Suggestions</Text>
          <Text style={styles.suggestionsSubtitle}>Based on your interests</Text>
        </View>
      )}

      <View style={styles.usageCard}>
        <Text style={styles.usageTitle}>Your Usage</Text>
        <Text style={styles.usageText}>
          {usage.activities} / {usage.maxActivities === -1 ? '∞' : usage.maxActivities} activities used
        </Text>
        <Text style={styles.usageText}>{usage.daysUsed} days active</Text>
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  limitBanner: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 12,
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  limitSubtitle: {
    fontSize: 14,
    color: "#ccc",
  },
  suggestionsCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  suggestionsSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  usageCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  usageText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
});
