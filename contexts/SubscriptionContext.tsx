import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_TIERS, canCreateActivity, isRadiusAllowed } from '@/data/subscriptionTiers';

interface SubscriptionContextType {
  tier: string;
  usage: {
    activities: number;
    daysUsed: number;
    maxActivities: number;
  };
  canCreateActivity: () => boolean;
  canUseRadius: (radius: number) => boolean;
  upgradeTier: (newTier: string) => Promise<void>;
  incrementActivityCount: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState('free');
  const [usage, setUsage] = useState({
    activities: 0,
    daysUsed: 0,
    maxActivities: 3,
  });

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const savedTier = await AsyncStorage.getItem('userTier');
      const savedUsage = await AsyncStorage.getItem('userUsage');
      const userCreatedAt = await AsyncStorage.getItem('userCreatedAt');

      if (savedTier) setTier(savedTier);
      if (savedUsage) setUsage(JSON.parse(savedUsage));
      
      if (userCreatedAt) {
        const daysUsed = Math.floor(
          (Date.now() - parseInt(userCreatedAt)) / (1000 * 60 * 60 * 24)
        );
        setUsage(prev => ({ ...prev, daysUsed }));
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    }
  };

  const canCreateActivityFn = () => {
    return canCreateActivity(tier, usage.activities);
  };

  const canUseRadius = (radius: number) => {
    return isRadiusAllowed(tier, radius);
  };

  const upgradeTier = async (newTier: string) => {
    try {
      await AsyncStorage.setItem('userTier', newTier);
      setTier(newTier);
      
      const tierConfig = SUBSCRIPTION_TIERS[newTier];
      setUsage(prev => ({
        ...prev,
        maxActivities: tierConfig.maxActivities,
      }));
    } catch (error) {
      console.error('Failed to upgrade tier:', error);
      throw error;
    }
  };

  const incrementActivityCount = async () => {
    const newUsage = {
      ...usage,
      activities: usage.activities + 1,
    };
    setUsage(newUsage);
    await AsyncStorage.setItem('userUsage', JSON.stringify(newUsage));
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        usage,
        canCreateActivity: canCreateActivityFn,
        canUseRadius,
        upgradeTier,
        incrementActivityCount,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
