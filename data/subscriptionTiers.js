// Subscription tier configuration
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: '$0',
    maxActivities: 3,
    maxRadius: 10,
    features: ['Basic activities', '10km radius', 'Join up to 3 activities'],
  },
  silver: {
    name: 'Silver',
    price: '$13.6',
    priceMonthly: 13.6,
    price3Months: 10,
    maxActivities: -1, // unlimited
    maxRadius: 20,
    features: [
      'Unlimited activities',
      '20km radius',
      'Priority support',
      'Daily suggestions',
    ],
  },
  gold: {
    name: 'Gold',
    price: '$21',
    priceMonthly: 21,
    maxActivities: -1,
    maxRadius: 50,
    features: [
      'Unlimited activities',
      '50km radius',
      'Rating system',
      'Badge matching',
      'Premium support',
    ],
  },
  platinum: {
    name: 'Platinum',
    price: '$45',
    priceMonthly: 45,
    maxActivities: -1,
    maxRadius: -1, // unlimited
    features: [
      'Unlimited everything',
      'Unlimited radius',
      'Trending alerts',
      'Premium support',
      'Early access to features',
    ],
  },
};

export const UPGRADE_PROMPT_DAYS = 8;
export const DAILY_SUGGESTIONS_DAYS = 3;

// Check if user can create activity based on tier
export const canCreateActivity = (tier, currentActivityCount) => {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  if (!tierConfig) return false;
  
  if (tierConfig.maxActivities === -1) return true;
  return currentActivityCount < tierConfig.maxActivities;
};

// Check if radius is allowed for tier
export const isRadiusAllowed = (tier, radius) => {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  if (!tierConfig) return false;
  
  if (tierConfig.maxRadius === -1) return true;
  return radius <= tierConfig.maxRadius;
};

// Check if user should see upgrade prompt
export const shouldShowUpgradePrompt = (daysUsed, tier) => {
  return tier === 'free' && daysUsed >= UPGRADE_PROMPT_DAYS;
};

// Check if user should see daily suggestions
export const shouldShowDailySuggestions = (daysUsed) => {
  return daysUsed >= DAILY_SUGGESTIONS_DAYS;
};
