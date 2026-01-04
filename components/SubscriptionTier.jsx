import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../contexts/ThemeContext';

const shouldShowUpgradeButton = (tier, currentUserSubscription) => {
  const tierOrder = ['free', 'silver', 'gold', 'platinum'];
  const currentIndex = tierOrder.indexOf(currentUserSubscription);
  const tierIndex = tierOrder.indexOf(tier);
  return tierIndex > currentIndex;
};

export default function SubscriptionTier({ tier, isActive, onUpgrade, limits, currentUserSubscription }) {
  const { colors } = useTheme();
  const { name, price, maxActivities, maxRadius, features } = limits;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }, isActive && [styles.activeContainer, { borderColor: colors.accent }]]} testID={`tier-${tier}`}>
      <View style={styles.header}>
        <Text style={[styles.tierName, { color: colors.foreground }]} testID="tier-name">{name}</Text>
        {isActive && <Text style={[styles.activeBadge, { color: colors.background, backgroundColor: colors.accent }]}>Current</Text>}
      </View>
      
      <Text style={[styles.price, { color: colors.foreground }]} testID="tier-price">{price}</Text>
      
      <View style={styles.limits}>
        <Text style={[styles.limitText, { color: colors.muted }]} testID="tier-activities">
          {maxActivities === -1 ? 'Unlimited' : maxActivities} activities
        </Text>
        <Text style={[styles.limitText, { color: colors.muted }]} testID="tier-radius">
          {maxRadius === -1 ? 'Unlimited' : `${maxRadius}km`} radius
        </Text>
      </View>

      {features && features.length > 0 && (
        <View style={styles.features}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <FontAwesome name="check" size={14} color={colors.accent} />
              <Text style={[styles.featureText, { color: colors.foreground }]}>{feature}</Text>
            </View>
          ))}
        </View>
      )}

      {!isActive && shouldShowUpgradeButton(tier, currentUserSubscription) && (
        <TouchableOpacity
          style={[styles.upgradeButton, { backgroundColor: colors.foreground }]}
          onPress={() => onUpgrade(tier)}
          testID="upgrade-button"
        >
          <Text style={[styles.upgradeButtonText, { color: colors.background }]}>Upgrade</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeContainer: {
    borderColor: '#000',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  activeBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  limits: {
    marginBottom: 12,
  },
  limitText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  features: {
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
