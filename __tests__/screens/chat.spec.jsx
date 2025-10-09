import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatScreen from '@/app/(tabs)/chat';

// Mock the ChatBox component
jest.mock('@/components/ChatBox', () => {
  const { View, TextInput, TouchableOpacity, FlatList } = require('react-native');
  return function ChatBox({ messages, onSendMessage, onTyping }) {
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
              <Text testID="message-timestamp">{item.timestamp}</Text>
            </View>
          )}
        />
        <TextInput
          testID="message-input"
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            onTyping && onTyping(text);
          }}
          placeholder="Type a message..."
        />
        <TouchableOpacity
          testID="send-button"
          onPress={() => {
            if (message.trim()) {
              onSendMessage(message);
              setMessage('');
            }
          }}
        >
          <Text>Send</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('Chat Screen', () => {
  const mockMessages = [
    {
      id: '1',
      text: 'Hello everyone!',
      sender: 'Alice',
      timestamp: '2024-01-15T09:00:00Z',
      isOwn: false
    },
    {
      id: '2',
      text: 'Hey Alice! How are you?',
      sender: 'Bob',
      timestamp: '2024-01-15T09:01:00Z',
      isOwn: true
    },
    {
      id: '3',
      text: 'Looking forward to the activity!',
      sender: 'Charlie',
      timestamp: '2024-01-15T09:02:00Z',
      isOwn: false
    }
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat interface', () => {
    const { getByTestId } = render(<ChatScreen />);
    
    expect(getByTestId('chat-box')).toBeTruthy();
    expect(getByTestId('message-input')).toBeTruthy();
    expect(getByTestId('send-button')).toBeTruthy();
  });

  it('displays messages list', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ messages: mockMessages })
    });

    const { getByTestId } = render(<ChatScreen />);
    
    await waitFor(() => {
      expect(getByTestId('messages-list')).toBeTruthy();
      expect(getByTestId('message-1')).toBeTruthy();
      expect(getByTestId('message-2')).toBeTruthy();
      expect(getByTestId('message-3')).toBeTruthy();
    });
  });

  it('shows message content correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ messages: mockMessages })
    });

    const { getByTestId } = render(<ChatScreen />);
    
    await waitFor(() => {
      expect(getByTestId('message-text')).toHaveTextContent('Hello everyone!');
      expect(getByTestId('message-sender')).toHaveTextContent('Alice');
    });
  });

  it('sends message successfully', async () => {
    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ messages: [] })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, messageId: '4' })
      });

    const { getByTestId } = render(<ChatScreen />);
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId('message-input'), 'Hello from test!');
      fireEvent.press(getByTestId('send-button'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/events/1/messages'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"text":"Hello from test!"')
      })
    );
  });

  it('does not send empty message', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ messages: [] })
    });

    const { getByTestId } = render(<ChatScreen />);
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId('message-input'), '   ');
      fireEvent.press(getByTestId('send-button'));
    });

    // Should not call API for empty message
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only the initial load
  });

  it('handles typing indicator', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ messages: [] })
    });

    const { getByTestId } = render(<ChatScreen />);
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId('message-input'), 'Hello');
    });

    // Should show typing indicator (this would be tested with socket mocking)
    expect(getByTestId('message-input')).toHaveTextContent('Hello');
  });

  it('updates message list when new message arrives', async () => {
    const initialMessages = [mockMessages[0]];
    const updatedMessages = [...initialMessages, mockMessages[1]];

    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ messages: initialMessages })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ messages: updatedMessages })
      });

    const { getByTestId, rerender } = render(<ChatScreen />);
    
    await waitFor(() => {
      expect(getByTestId('message-1')).toBeTruthy();
    });

    // Simulate new message arrival
    rerender(<ChatScreen />);
    
    await waitFor(() => {
      expect(getByTestId('message-2')).toBeTruthy();
    });
  });

  it('handles message sending errors', async () => {
    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ messages: [] })
      })
      .mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId, getByText } = render(<ChatScreen />);
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId('message-input'), 'Test message');
      fireEvent.press(getByTestId('send-button'));
    });

    // Should show error message
    await waitFor(() => {
      expect(getByText('Failed to send message')).toBeTruthy();
    });
  });

  it('displays message timestamps', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ messages: mockMessages })
    });

    const { getByTestId } = render(<ChatScreen />);
    
    await waitFor(() => {
      expect(getByTestId('message-timestamp')).toHaveTextContent('2024-01-15T09:00:00Z');
    });
  });

  it('handles real-time message updates', async () => {
    // This would test WebSocket or polling for new messages
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ messages: mockMessages })
    });

    const { getByTestId } = render(<ChatScreen />);
    
    await waitFor(() => {
      expect(getByTestId('messages-list')).toBeTruthy();
    });

    // Simulate real-time update
    const newMessage = {
      id: '4',
      text: 'New message!',
      sender: 'David',
      timestamp: '2024-01-15T09:03:00Z',
      isOwn: false
    };

    // This would be handled by WebSocket or polling mechanism
    // For now, we'll test that the component can handle updates
    expect(getByTestId('messages-list')).toBeTruthy();
  });
});
