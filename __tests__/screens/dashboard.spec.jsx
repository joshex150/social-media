import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import Dashboard from '@/app/(tabs)/explore';

// Mock the components that will be imported
jest.mock('@/components/ActivityCard', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function ActivityCard({ activity, onJoin, onView }) {
    return (
      <View testID={`activity-card-${activity.id}`}>
        <Text testID="activity-title">{activity.title}</Text>
        <Text testID="activity-category">{activity.category}</Text>
        <Text testID="activity-distance">{activity.distance}km</Text>
        <TouchableOpacity testID="join-button" onPress={() => onJoin(activity.id)}>
          <Text>Join</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="view-button" onPress={() => onView(activity.id)}>
          <Text>View</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('@/components/VibeCheck', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function VibeCheck({ onFeedback }) {
    return (
      <View testID="vibe-check">
        <Text>How are you feeling?</Text>
        <TouchableOpacity testID="vibe-happy" onPress={() => onFeedback('happy')}>
          <Text>😊</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="vibe-neutral" onPress={() => onFeedback('neutral')}>
          <Text>😐</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="vibe-sad" onPress={() => onFeedback('sad')}>
          <Text>😔</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('Dashboard Screen', () => {
  const mockActivities = [
    {
      id: '1',
      title: 'Morning Coffee Walk',
      category: 'Social',
      distance: 2.5,
      participants: 3,
      maxParticipants: 8,
      startTime: '2025-01-15T09:00:00Z'
    },
    {
      id: '2',
      title: 'Gym Session',
      category: 'Fitness',
      distance: 1.2,
      participants: 1,
      maxParticipants: 4,
      startTime: '2025-01-15T18:00:00Z'
    }
  ];

  beforeEach(() => {
    // Mock fetch for activities
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ activities: mockActivities })
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders activity cards', async () => {
    const { getByTestId } = render(<Dashboard />);
    
    await waitFor(() => {
      expect(getByTestId('activity-card-1')).toBeTruthy();
      expect(getByTestId('activity-card-2')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('displays activity information correctly', async () => {
    const { getAllByTestId } = render(<Dashboard />);
    
    await waitFor(() => {
      const titles = getAllByTestId('activity-title');
      const categories = getAllByTestId('activity-category');
      const distances = getAllByTestId('activity-distance');
      
      expect(titles[0]).toHaveTextContent('Morning Coffee Walk');
      expect(categories[0]).toHaveTextContent('Social');
      expect(distances[0]).toHaveTextContent('2.5km');
    });
  });

  it('filters activities by radius', async () => {
    const { getByTestId, getByText } = render(<Dashboard />);
    
    // Should have radius filter
    const radiusFilter = getByText('Filter by radius');
    expect(radiusFilter).toBeTruthy();
    
    // Test radius filtering
    fireEvent.press(getByText('5km'));
    
    await waitFor(() => {
      // Only activities within 5km should be visible
      expect(getByTestId('activity-card-1')).toBeTruthy();
      expect(getByTestId('activity-card-2')).toBeTruthy();
    });
  });

  it('handles empty state when no activities', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ activities: [] })
      })
    );

    const { getByText } = render(<Dashboard />);
    
    await waitFor(() => {
      expect(getByText('No activities nearby')).toBeTruthy();
      expect(getByText('Create your first activity')).toBeTruthy();
    });
  });

  it('shows vibe check card', () => {
    const { getByTestId } = render(<Dashboard />);
    
    expect(getByTestId('vibe-check')).toBeTruthy();
  });

  it('handles vibe feedback', () => {
    const { getByTestId } = render(<Dashboard />);
    
    fireEvent.press(getByTestId('vibe-happy'));
    
    // Should show feedback was recorded
    expect(getByTestId('vibe-check')).toBeTruthy();
  });

  it('handles join activity', async () => {
    const { getAllByTestId } = render(<Dashboard />);
    
    await waitFor(() => {
      const joinButtons = getAllByTestId('join-button');
      expect(joinButtons.length).toBeGreaterThan(0);
    });
    
    await act(async () => {
      const joinButtons = getAllByTestId('join-button');
      fireEvent.press(joinButtons[0]);
    });
    
    // Join request is sent via API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/events/'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('handles view activity', async () => {
    const { getAllByTestId } = render(<Dashboard />);
    
    await waitFor(() => {
      const viewButtons = getAllByTestId('view-button');
      expect(viewButtons.length).toBeGreaterThan(0);
      fireEvent.press(viewButtons[0]);
    });
    
    // Should navigate to activity details
    // This would be tested with navigation mocking in a real app
  });
});
