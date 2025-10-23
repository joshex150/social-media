import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import App from '@/app/_layout';

// Mock all the screens and components
jest.mock('@/app/(tabs)/index', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function HomeScreen() {
    return (
      <View testID="home-screen">
        <Text>Home</Text>
        <TouchableOpacity testID="create-activity-button">
          <Text>Create Activity</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('@/app/(tabs)/explore', () => {
  const { View, Text, FlatList } = require('react-native');
  return function ExploreScreen() {
    const activities = [
      { id: '1', title: 'Coffee Walk', category: 'Social' },
      { id: '2', title: 'Gym Session', category: 'Fitness' }
    ];
    
    return (
      <View testID="explore-screen">
        <Text>Explore</Text>
        <FlatList
          testID="activities-list"
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View testID={`activity-${item.id}`}>
              <Text>{item.title}</Text>
              <Text>{item.category}</Text>
            </View>
          )}
        />
      </View>
    );
  };
});

jest.mock('@/app/(tabs)/profile', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function ProfileScreen() {
    return (
      <View testID="profile-screen">
        <Text>Profile</Text>
        <TouchableOpacity testID="onboarding-button">
          <Text>Complete Profile</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('@/app/(tabs)/chat', () => {
  const { View, Text } = require('react-native');
  return function ChatScreen() {
    return (
      <View testID="chat-screen">
        <Text>Chat</Text>
      </View>
    );
  };
});

jest.mock('@/app/(tabs)/map', () => {
  const { View, Text } = require('react-native');
  return function MapScreen() {
    return (
      <View testID="map-screen">
        <Text>Map</Text>
      </View>
    );
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('App Flow Integration', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders main app with all tabs', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    
    expect(getByTestId('home-screen')).toBeTruthy();
  });

  it('completes onboarding flow', async () => {
    // Mock AsyncStorage to return no existing profile
    require('@react-native-async-storage/async-storage').getItem.mockResolvedValue(null);
    
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    
    // Should show onboarding
    await waitFor(() => {
      expect(getByText('Welcome to Link Up')).toBeTruthy();
    });
    
    // Complete onboarding steps
    fireEvent.changeText(getByTestId('name-input'), 'John Doe');
    fireEvent.changeText(getByTestId('location-input'), 'New York');
    fireEvent.press(getByTestId('interests-continue'));
    
    // Select interests
    fireEvent.press(getByTestId('interest-social'));
    fireEvent.press(getByTestId('interest-fitness'));
    fireEvent.press(getByTestId('interests-continue'));
    
    // Select languages
    fireEvent.press(getByTestId('language-english'));
    fireEvent.press(getByTestId('languages-continue'));
    
    // Complete onboarding
    fireEvent.press(getByTestId('onboarding-complete'));
    
    await waitFor(() => {
      expect(getByTestId('home-screen')).toBeTruthy();
    });
  });

  it('navigates from dashboard to activity creation', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    
    // Navigate to explore tab
    fireEvent.press(getByTestId('explore-tab'));
    
    await waitFor(() => {
      expect(getByTestId('explore-screen')).toBeTruthy();
    });
    
    // Create new activity
    fireEvent.press(getByTestId('create-activity-button'));
    
    // Should show create activity form
    expect(getByTestId('create-activity-form')).toBeTruthy();
  });

  it('creates and joins activity successfully', async () => {
    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, activityId: 'act1' })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, joinRequestId: 'req1' })
      });

    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    
    // Navigate to explore
    fireEvent.press(getByTestId('explore-tab'));
    
    await waitFor(() => {
      expect(getByTestId('explore-screen')).toBeTruthy();
    });
    
    // Join existing activity
    fireEvent.press(getByTestId('activity-1'));
    
    await waitFor(() => {
      expect(getByTestId('activity-details')).toBeTruthy();
    });
    
    // Send join request
    fireEvent.press(getByTestId('join-activity-button'));
    
    await waitFor(() => {
      expect(getByText('Join request sent')).toBeTruthy();
    });
  });

  it('handles activity lifecycle with chat and feedback', async () => {
    const mockMessages = [
      { id: '1', text: 'Hello!', sender: 'Alice', timestamp: '2025-01-15T09:00:00Z' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ 
          event: { id: '1', title: 'Coffee Walk', participants: ['Alice', 'Bob'] },
          messages: mockMessages
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, messageId: '2' })
      });

    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    
    // Navigate to activity
    fireEvent.press(getByTestId('activity-1'));
    
    await waitFor(() => {
      expect(getByTestId('activity-details')).toBeTruthy();
    });
    
    // Send chat message
    fireEvent.changeText(getByTestId('message-input'), 'Great activity!');
    fireEvent.press(getByTestId('send-message-button'));
    
    await waitFor(() => {
      expect(getByText('Great activity!')).toBeTruthy();
    });
    
    // Simulate activity end and feedback prompt
    fireEvent.press(getByTestId('end-activity-button'));
    
    await waitFor(() => {
      expect(getByTestId('feedback-modal')).toBeTruthy();
    });
    
    // Submit feedback
    fireEvent.press(getByTestId('emotion-happy'));
    fireEvent(getByTestId('rating-slider'), 'onValueChange', 5);
    fireEvent.press(getByTestId('submit-feedback-button'));
    
    await waitFor(() => {
      expect(getByText('Thank you for your feedback!')).toBeTruthy();
    });
  });

  it('handles subscription upgrade flow', async () => {
    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ 
          currentTier: 'free',
          usage: { activities: 3, daysUsed: 8 },
          tiers: {
            free: { maxActivities: 3, maxRadius: 10 },
            silver: { maxActivities: -1, maxRadius: 20, price: '$13.6' }
          }
        })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, newTier: 'silver' })
      });

    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    
    // Navigate to profile
    fireEvent.press(getByTestId('profile-tab'));
    
    await waitFor(() => {
      expect(getByTestId('profile-screen')).toBeTruthy();
    });
    
    // Should show upgrade prompt after 8 days
    expect(getByTestId('upgrade-prompt')).toBeTruthy();
    
    // Upgrade to silver
    fireEvent.press(getByTestId('upgrade-silver-button'));
    
    await waitFor(() => {
      expect(getByText('Successfully upgraded to Silver!')).toBeTruthy();
    });
  });

  it('handles error states gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    
    // Try to load activities
    fireEvent.press(getByTestId('explore-tab'));
    
    await waitFor(() => {
      expect(getByText('Failed to load activities')).toBeTruthy();
      expect(getByText('Please try again')).toBeTruthy();
    });
  });

  it('persists user preferences across app restarts', async () => {
    const mockProfile = {
      name: 'John Doe',
      location: 'New York',
      interests: ['social', 'fitness'],
      languages: ['english']
    };

    require('@react-native-async-storage/async-storage').getItem.mockResolvedValue(
      JSON.stringify(mockProfile)
    );

    const { getByTestId } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    
    // Should load existing profile and skip onboarding
    await waitFor(() => {
      expect(getByTestId('home-screen')).toBeTruthy();
    });
    
    // Profile should be loaded
    expect(getByTestId('user-name')).toHaveTextContent('John Doe');
  });

  it('handles location permissions and updates', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    
    // Navigate to map
    fireEvent.press(getByTestId('map-tab'));
    
    await waitFor(() => {
      expect(getByTestId('map-screen')).toBeTruthy();
    });
    
    // Should request location permission
    expect(getByText('Location permission required')).toBeTruthy();
    
    // Grant permission
    fireEvent.press(getByTestId('grant-location-button'));
    
    await waitFor(() => {
      expect(getByTestId('user-location-marker')).toBeTruthy();
    });
  });
});
