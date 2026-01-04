import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import SubscriptionTier from "@/components/SubscriptionTier";
import UpgradePrompt from "@/components/UpgradePrompt";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useTheme } from "@/contexts/ThemeContext";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import type { SubscriptionTier as SubscriptionTierType } from "@/services/api";

export default function SubscriptionSettingsScreen() {
  const { colors } = useTheme();
  const [tiers, setTiers] = useState<Record<string, SubscriptionTierType>>({});
  const [currentTier, setCurrentTier] = useState('free');
  const [usage, setUsage] = useState({ 
    activities: 0, 
    daysUsed: 15, 
    maxActivities: 3 // Default to free tier
  });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showDailySuggestions, setShowDailySuggestions] = useState(false);
  
  const { user, subscriptionTiers, loadSubscriptionTiers } = useApi();
  const [dismissedPrompt, setDismissedPrompt] = useState(false);
  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { alert, showAlert, hideAlert } = useCustomAlert();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  // Update usage when tiers are loaded
  useEffect(() => {
    if (Object.keys(tiers).length > 0) {
      const currentTierData = tiers[currentTier];
      if (currentTierData) {
        setUsage(prev => ({
          ...prev,
          maxActivities: currentTierData.maxActivities === -1 ? 999 : currentTierData.maxActivities
        }));
      }
    }
  }, [tiers, currentTier]);

  const loadSubscriptionData = async () => {
    await loadSubscriptionTiers();
    
    // Convert array to object for easier access
    const tiersObj: Record<string, SubscriptionTierType> = {};
    subscriptionTiers.forEach(tier => {
      tiersObj[tier.id] = tier;
    });
    setTiers(tiersObj);
    
    // Set usage based on current tier
    const currentTierData = tiersObj[currentTier];
    if (currentTierData) {
      setUsage(prev => ({
        ...prev,
        maxActivities: currentTierData.maxActivities === -1 ? 999 : currentTierData.maxActivities
      }));
    }
  };

  const handleUpgrade = (tierId: string) => {
    showAlert(
      'Upgrade Subscription',
      `Upgrade to ${tiers[tierId]?.name} plan for $${tiers[tierId]?.price}/month?`,
      'info',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { 
          text: 'Upgrade', 
          onPress: () => {
            setCurrentTier(tierId as "free" | "silver" | "gold" | "platinum");
            setShowUpgradePrompt(false);
            showAlert('Success', 'Subscription upgraded successfully!', 'success');
          }
        }
      ]
    );
  };

  const handleCancelSubscription = () => {
    showAlert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features.',
      'warning',
      [
        { text: 'Keep Subscription', style: 'cancel', onPress: () => {} },
        { 
          text: 'Cancel Subscription', 
          style: 'destructive',
          onPress: () => {
            setCurrentTier('free');
            showAlert('Subscription Cancelled', 'Your subscription has been cancelled.', 'info');
          }
        }
      ]
    );
  };

  const getCurrentTierData = () => {
    return tiers[currentTier] || tiers['free'] || { maxActivities: 3, maxRadius: 10, features: [] };
  };

  const getUsagePercentage = () => {
    const currentTierData = getCurrentTierData();
    if (currentTierData.maxActivities === -1) return 0;
    return (usage.activities / currentTierData.maxActivities) * 100;
  };

  const isNearLimit = () => {
    const percentage = getUsagePercentage();
    return percentage >= 80;
  };

  const getTierDisplayName = (tierId: string) => {
    const tier = tiers[tierId];
    return tier ? tier.name : 'Unknown';
  };

  const getTierPrice = (tierId: string) => {
    const tier = tiers[tierId];
    return tier ? `$${tier.price}/month` : 'Free';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, safeArea.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={colors.foreground} />
          <Text style={[styles.backButtonText, { color: colors.foreground }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>

      {/* Current Plan */}
      <View style={[styles.currentPlanCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.currentPlanTitle, { color: colors.foreground }]}>Current Plan</Text>
        <View style={styles.currentPlanInfo}>
          <Text style={[styles.currentPlanName, { color: colors.foreground }]}>{getTierDisplayName(currentTier)}</Text>
          <Text style={[styles.currentPlanPrice, { color: colors.muted }]}>{getTierPrice(currentTier)}</Text>
        </View>
        {currentTier !== 'free' && (
          <TouchableOpacity 
            style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.error }]}
            onPress={handleCancelSubscription}
          >
            <Text style={[styles.cancelButtonText, { color: colors.error }]}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Usage Stats */}
      <View style={[styles.usageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.usageTitle, { color: colors.foreground }]}>Usage This Month</Text>
        <View style={styles.usageStats}>
          <View style={styles.usageItem}>
            <Text style={[styles.usageNumber, { color: colors.foreground }]}>{usage.activities}</Text>
            <Text style={[styles.usageLabel, { color: colors.muted }]}>Activities Created</Text>
          </View>
          <View style={styles.usageItem}>
            <Text style={[styles.usageNumber, { color: colors.foreground }]}>{usage.daysUsed}</Text>
            <Text style={[styles.usageLabel, { color: colors.muted }]}>Days Active</Text>
          </View>
        </View>
        
        {getCurrentTierData().maxActivities !== -1 && (
          <View style={styles.usageBar}>
            <View style={styles.usageBarBackground}>
              <View 
                style={[
                  styles.usageBarFill, 
                  { width: `${Math.min(getUsagePercentage(), 100)}%` },
                  isNearLimit() && styles.usageBarFillWarning
                ]} 
              />
            </View>
            <Text style={styles.usageBarText}>
              {usage.activities} / {getCurrentTierData().maxActivities} activities
            </Text>
          </View>
        )}

        {isNearLimit() && (
          <View style={styles.limitWarning}>
            <FontAwesome name="exclamation-triangle" size={16} color="#ff6b6b" />
            <Text style={styles.limitWarningText}>
              You're approaching your activity limit for this month
            </Text>
          </View>
        )}
      </View>

      {/* Available Plans */}
      <View style={styles.plansSection}>
        <Text style={styles.plansTitle}>Available Plans</Text>
        {Object.values(tiers).map((tier) => (
          <SubscriptionTier
            key={tier.id}
            tier={tier.id}
            isActive={currentTier === tier.id}
            onUpgrade={handleUpgrade}
            limits={tier}
            currentUserSubscription={user?.subscription || 'free'}
          />
        ))}
      </View>

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

      {/* Upgrade Prompt */}
      {(user?.subscription || 'free') === 'free' && !dismissedPrompt && (
        <UpgradePrompt
          onUpgrade={() => setShowUpgradePrompt(true)}
          onDismiss={() => setDismissedPrompt(true)}
          daysUsed={usage.daysUsed}
        />
      )}

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
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: "#000",
    marginLeft: GAPS.small,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
  },
  placeholder: {
    width: 60,
  },
  currentPlanCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    marginBottom: PADDING.content.vertical,
  },
  currentPlanTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.medium,
  },
  currentPlanInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: GAPS.medium,
  },
  currentPlanName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
  },
  currentPlanPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#666",
  },
  cancelButton: {
    alignSelf: "flex-start",
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.sm,
    color: "#ff4444",
    fontWeight: FONT_WEIGHTS.medium,
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
    marginBottom: GAPS.large,
  },
  usageItem: {
    alignItems: "center",
  },
  usageNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
    marginBottom: GAPS.small,
  },
  usageLabel: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
  },
  usageBar: {
    marginBottom: GAPS.medium,
  },
  usageBarBackground: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    marginBottom: GAPS.small,
  },
  usageBarFill: {
    height: 8,
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  usageBarFillWarning: {
    backgroundColor: "#ff6b6b",
  },
  usageBarText: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    textAlign: "center",
  },
  limitWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3cd",
    padding: GAPS.medium,
    borderRadius: BORDER_RADIUS.medium,
  },
  limitWarningText: {
    fontSize: FONT_SIZES.sm,
    color: "#856404",
    marginLeft: GAPS.small,
    flex: 1,
  },
  plansSection: {
    marginBottom: PADDING.content.vertical,
  },
  plansTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.medium,
  },
  billingCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    marginBottom: PADDING.content.vertical,
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