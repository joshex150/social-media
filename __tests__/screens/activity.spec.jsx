import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ActivityScreen from '@/app/(tabs)/index';

// Mock the components
jest.mock('@/components/RequestBanner', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function RequestBanner({ request, onAccept, onReject }) {
    return (
      <View testID="request-banner">
        <Text testID="request-user">{request.userName}</Text>
        <Text testID="request-message">{request.message}</Text>
        <TouchableOpacity testID="accept-button" onPress={() => onAccept(request.id)}>
          <Text>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="reject-button" onPress={() => onReject(request.id)}>
          <Text>Reject</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('@/components/MapView', () => {
  const { View, Text } = require('react-native');
  return function MapView({ event, participants }) {
    return (
      <View testID="map-view">
        <Text testID="event-location">{event.location}</Text>
        <Text testID="participants-count">{participants.length} participants</Text>
      </View>
    );
  };
});

jest.mock('@/components/ChatBox', () => {
  const { View, TextInput, TouchableOpacity, FlatList } = require('react-native');
  return function ChatBox({ messages, onSendMessage }) {
    const [message, setMessage] = React.useState('');
    
    return (
      <View testID="chat-box">
        <FlatList
          testID="messages-list"
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View testID={`message-${item.id}`}>
              <Text testID="message-text">{item.text}</Text>
              <Text testID="message-sender">{item.sender}</Text>
            </View>
          )}
        />
        <TextInput
          testID="message-input"
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity
          testID="send-button"
          onPress={() => {
            onSendMessage(message);
            setMessage('');
          }}
        >
          <Text>Send</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('Activity Screen', () => {
  const mockEvent = {
    id: '1',
    title: 'Morning Coffee Walk',
    category: 'Social',
    description: 'A casual walk to the local coffee shop',
    location: 'Central Park',
    latitude: 40.7829,
    longitude: -73.9654,
    startTime: '2024-01-15T09:00:00Z',
    maxParticipants: 8,
    participants: [
      { id: 'user1', name: 'Alice', status: 'accepted' },
      { id: 'user2', name: 'Bob', status: 'accepted' }
    ]
  };

  const mockJoinRequest = {
    id: 'req1',
    userId: 'user3',
    userName: 'Charlie',
    message: 'Would love to join!',
    timestamp: '2024-01-15T08:30:00Z'
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders activity details', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ event: mockEvent })
    });

    const { getByText } = render(<ActivityScreen />);
    
    await waitFor(() => {
      expect(getByText('Morning Coffee Walk')).toBeTruthy();
      expect(getByText('Social')).toBeTruthy();
      expect(getByText('A casual walk to the local coffee shop')).toBeTruthy();
      expect(getByText('Central Park')).toBeTruthy();
    });
  });

  it('shows join request banner when requests exist', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        event: mockEvent, 
        joinRequests: [mockJoinRequest] 
      })
    });

    const { getByTestId } = render(<ActivityScreen />);
    
    await waitFor(() => {
      expect(getByTestId('request-banner')).toBeTruthy();
      expect(getByTestId('request-user')).toHaveTextContent('Charlie');
      expect(getByTestId('request-message')).toHaveTextContent('Would love to join!');
    });
  });

  it('handles accept join request', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        event: mockEvent, 
        joinRequests: [mockJoinRequest] 
      })
    });

    const { getByTestId } = render(<ActivityScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByTestId('accept-button'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/events/1/join'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"action":"accept"')
      })
    );
  });

  it('handles reject join request', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        event: mockEvent, 
        joinRequests: [mockJoinRequest] 
      })
    });

    const { getByTestId } = render(<ActivityScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByTestId('reject-button'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/events/1/join'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"action":"reject"')
      })
    );
  });

  it('shows map view with participants after accepting requests', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        event: mockEvent, 
        joinRequests: [] 
      })
    });

    const { getByTestId } = render(<ActivityScreen />);
    
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
      expect(getByTestId('event-location')).toHaveTextContent('Central Park');
      expect(getByTestId('participants-count')).toHaveTextContent('2 participants');
    });
  });

  it('displays chat messages', async () => {
    const mockMessages = [
      { id: '1', text: 'Hello everyone!', sender: 'Alice', timestamp: '2024-01-15T09:00:00Z' },
      { id: '2', text: 'Looking forward to this!', sender: 'Bob', timestamp: '2024-01-15T09:01:00Z' }
    ];

    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        event: mockEvent, 
        messages: mockMessages 
      })
    });

    const { getByTestId } = render(<ActivityScreen />);
    
    await waitFor(() => {
      expect(getByTestId('chat-box')).toBeTruthy();
      expect(getByTestId('message-1')).toBeTruthy();
      expect(getByTestId('message-text')).toHaveTextContent('Hello everyone!');
      expect(getByTestId('message-sender')).toHaveTextContent('Alice');
    });
  });

  it('sends chat message', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ 
        event: mockEvent, 
        messages: [] 
      })
    });

    const { getByTestId } = render(<ActivityScreen />);
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId('message-input'), 'Hello everyone!');
      fireEvent.press(getByTestId('send-button'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/events/1/messages'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"text":"Hello everyone!"')
      })
    );
  });

  it('validates create event form', async () => {
    const { getByText, getByTestId } = render(<ActivityScreen />);
    
    // Navigate to create event (this would be tested with navigation mocking)
    fireEvent.press(getByText('Create Activity'));
    
    // Test form validation
    fireEvent.press(getByTestId('create-button'));
    
    // Should show validation errors
    expect(getByText('Title is required')).toBeTruthy();
    expect(getByText('Category is required')).toBeTruthy();
    expect(getByText('Location is required')).toBeTruthy();
  });

  it('creates new event successfully', async () => {
    const { getByText, getByTestId } = render(<ActivityScreen />);
    
    // Fill out create event form
    fireEvent.changeText(getByTestId('title-input'), 'Evening Jog');
    fireEvent.changeText(getByTestId('category-input'), 'Fitness');
    fireEvent.changeText(getByTestId('description-input'), 'A quick jog around the park');
    fireEvent.changeText(getByTestId('location-input'), 'Riverside Park');
    
    fireEvent.press(getByTestId('create-button'));
    
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"title":"Evening Jog"')
      })
    );
  });
});
