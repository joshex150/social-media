import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SubscriptionScreen from '@/app/(tabs)/profile';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the subscription components
jest.mock('@/components/SubscriptionTier', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function SubscriptionTier({ tier, isActive, onUpgrade, limits }) {
    return (
      <View testID={`tier-${tier}`}>
        <Text testID="tier-name">{tier}</Text>
        <Text testID="tier-price">{limits.price}</Text>
        <Text testID="tier-activities">{limits.maxActivities} activities</Text>
        <Text testID="tier-radius">{limits.maxRadius}km radius</Text>
        {!isActive && (
          <TouchableOpacity testID="upgrade-button" onPress={() => onUpgrade(tier)}>
            <Text>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
});

jest.mock('@/components/UpgradePrompt', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function UpgradePrompt({ onUpgrade, onDismiss, daysUsed }) {
    return (
      <View testID="upgrade-prompt">
        <Text testID="prompt-message">
          You've been using Link Up for {daysUsed} days. Upgrade for more features!
        </Text>
        <TouchableOpacity testID="prompt-upgrade" onPress={onUpgrade}>
          <Text>Upgrade Now</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="prompt-dismiss" onPress={onDismiss}>
          <Text>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('Subscription Screen', () => {
  const mockSubscriptionTiers = {
    free: {
      name: 'Free',
      price: '$0',
      maxActivities: 3,
      maxRadius: 10,
      features: ['Basic activities', '10km radius']
    },
    silver: {
      name: 'Silver',
      price: '$13.6',
      maxActivities: -1, // unlimited
      maxRadius: 20,
      features: ['Unlimited activities', '20km radius', 'Priority support']
    },
    gold: {
      name: 'Gold',
      price: '$21',
      maxActivities: -1,
      maxRadius: 50,
      features: ['Unlimited activities', '50km radius', 'Rating system', 'Badge matching']
    },
    platinum: {
      name: 'Platinum',
      price: '$45',
      maxActivities: -1,
      maxRadius: -1, // unlimited
      features: ['Unlimited everything', 'Trending alerts', 'Premium support']
    }
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders subscription tiers', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        tiers: mockSubscriptionTiers,
        currentTier: 'free',
        usage: { activities: 2, daysUsed: 5 }
      })
    });

    const { getByTestId } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      expect(getByTestId('tier-free')).toBeTruthy();
      expect(getByTestId('tier-silver')).toBeTruthy();
      expect(getByTestId('tier-gold')).toBeTruthy();
      expect(getByTestId('tier-platinum')).toBeTruthy();
    });
  });

  it('displays tier information correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        tiers: mockSubscriptionTiers,
        currentTier: 'free',
        usage: { activities: 2, daysUsed: 5 }
      })
    });

    const { getByTestId } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      expect(getByTestId('tier-name')).toHaveTextContent('Free');
      expect(getByTestId('tier-price')).toHaveTextContent('$0');
      expect(getByTestId('tier-activities')).toHaveTextContent('3 activities');
      expect(getByTestId('tier-radius')).toHaveTextContent('10km radius');
    });
  });

  it('shows upgrade prompt after 8 days', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        tiers: mockSubscriptionTiers,
        currentTier: 'free',
        usage: { activities: 2, daysUsed: 8 }
      })
    });

    const { getByTestId } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      expect(getByTestId('upgrade-prompt')).toBeTruthy();
      expect(getByTestId('prompt-message')).toHaveTextContent('You\'ve been using Link Up for 8 days');
    });
  });

  it('does not show upgrade prompt before 8 days', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        tiers: mockSubscriptionTiers,
        currentTier: 'free',
        usage: { activities: 2, daysUsed: 5 }
      })
    });

    const { getByTestId, queryByTestId } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      expect(queryByTestId('upgrade-prompt')).toBeNull();
    });
  });

  it('handles upgrade to silver tier', async () => {
    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ 
          tiers: mockSubscriptionTiers,
          currentTier: 'free',
          usage: { activities: 2, daysUsed: 5 }
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, newTier: 'silver' })
      });

    const { getByTestId } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByTestId('upgrade-button'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/subscription/upgrade',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"tier":"silver"')
      })
    );
  });

  it('enforces activity limits for free tier', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        tiers: mockSubscriptionTiers,
        currentTier: 'free',
        usage: { activities: 3, daysUsed: 5 }
      })
    });

    const { getByText } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      expect(getByText('Activity limit reached')).toBeTruthy();
      expect(getByText('Upgrade to create more activities')).toBeTruthy();
    });
  });

  it('enforces radius limits for free tier', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        tiers: mockSubscriptionTiers,
        currentTier: 'free',
        usage: { activities: 2, daysUsed: 5 }
      })
    });

    const { getByText } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      // Try to create activity with 15km radius (exceeds 10km limit)
      fireEvent.press(getByText('Create Activity'));
    });

    // Should show radius limit error
    expect(getByText('Radius exceeds free tier limit')).toBeTruthy();
  });

  it('allows unlimited activities for paid tiers', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        tiers: mockSubscriptionTiers,
        currentTier: 'silver',
        usage: { activities: 10, daysUsed: 5 }
      })
    });

    const { getByText, queryByText } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      expect(queryByText('Activity limit reached')).toBeNull();
      expect(getByText('Create Activity')).toBeTruthy();
    });
  });

  it('handles upgrade prompt dismissal', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        tiers: mockSubscriptionTiers,
        currentTier: 'free',
        usage: { activities: 2, daysUsed: 8 }
      })
    });

    const { getByTestId, queryByTestId } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByTestId('prompt-dismiss'));
    });

    expect(queryByTestId('upgrade-prompt')).toBeNull();
  });

  it('shows daily suggestions after 3 days', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        tiers: mockSubscriptionTiers,
        currentTier: 'free',
        usage: { activities: 2, daysUsed: 3 }
      })
    });

    const { getByText } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      expect(getByText('Daily Suggestions')).toBeTruthy();
      expect(getByText('Based on your interests')).toBeTruthy();
    });
  });

  it('displays current usage statistics', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        tiers: mockSubscriptionTiers,
        currentTier: 'free',
        usage: { activities: 2, daysUsed: 5, maxActivities: 3 }
      })
    });

    const { getByText } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      expect(getByText('2 / 3 activities used')).toBeTruthy();
      expect(getByText('5 days active')).toBeTruthy();
    });
  });

  it('handles subscription upgrade errors', async () => {
    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ 
          tiers: mockSubscriptionTiers,
          currentTier: 'free',
          usage: { activities: 2, daysUsed: 5 }
        })
      })
      .mockRejectedValueOnce(new Error('Payment failed'));

    const { getByTestId, getByText } = render(<SubscriptionScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByTestId('upgrade-button'));
    });

    await waitFor(() => {
      expect(getByText('Upgrade failed. Please try again.')).toBeTruthy();
    });
  });
});
