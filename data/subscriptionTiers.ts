export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    maxActivities: 2,
    maxRadius: 5,
    features: ['Basic activity creation', 'Limited radius search']
  },
  silver: {
    name: 'Silver',
    maxActivities: 10,
    maxRadius: 15,
    features: ['Extended activity creation', 'Extended radius search', 'Priority support']
  },
  gold: {
    name: 'Gold',
    maxActivities: 25,
    maxRadius: 30,
    features: ['Unlimited activity creation', 'Extended radius search', 'Priority support', 'Advanced analytics']
  },
  platinum: {
    name: 'Platinum',
    maxActivities: -1, // unlimited
    maxRadius: 50,
    features: ['Unlimited everything', 'Premium support', 'Advanced analytics', 'Custom features']
  }
};

export const canCreateActivity = (tier: string, currentActivities: number): boolean => {
  const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
  if (!tierConfig) return false;
  
  if (tierConfig.maxActivities === -1) return true; // unlimited
  return currentActivities < tierConfig.maxActivities;
};

export const isRadiusAllowed = (tier: string, radius: number): boolean => {
  const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
  if (!tierConfig) return false;
  
  return radius <= tierConfig.maxRadius;
};

