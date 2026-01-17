import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function ChatBox({ 
  messages, 
  onSendMessage, 
  onTyping, 
  onLoadMore, 
  hasMore, 
  isLoadingMore,
  typingUsers,
  currentUserId 
}) {
  // Ensure typingUsers is always an array
  const safeTypingUsers = Array.isArray(typingUsers) ? typingUsers : [];
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const loadMoreTimeoutRef = useRef(null);
  const isLoadingMoreRef = useRef(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleChangeText = (text) => {
    setMessage(text);
    
    // Handle typing indicators
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      if (onTyping) {
        onTyping(true);
      }
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      if (onTyping) {
        onTyping(false);
      }
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        if (onTyping) {
          onTyping(false);
        }
      }
    }, 2000);
  };

  const handleLoadMore = () => {
    // Prevent multiple simultaneous calls
    // Also check hasMore to prevent calling when there's nothing to load
    if (!hasMore || isLoadingMore || isLoadingMoreRef.current) {
      return;
    }
    
    // Clear any pending load more calls
    if (loadMoreTimeoutRef.current) {
      clearTimeout(loadMoreTimeoutRef.current);
    }
    
    // Debounce the load more call
    loadMoreTimeoutRef.current = setTimeout(() => {
      // Double-check hasMore before calling (it might have changed)
      if (hasMore && !isLoadingMore && !isLoadingMoreRef.current && onLoadMore) {
        isLoadingMoreRef.current = true;
        onLoadMore();
        // Reset the flag after a delay to allow the loading state to update
        setTimeout(() => {
          isLoadingMoreRef.current = false;
        }, 500);
      }
    }, 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
    };
  }, []);

  const renderTypingIndicator = () => {
    if (safeTypingUsers.length === 0) return null;
    
    return (
      <View style={[styles.typingContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.typingText, { color: colors.muted }]}>
          {safeTypingUsers.length === 1 
            ? `${safeTypingUsers[0]} is typing...`
            : `${safeTypingUsers.length} people are typing...`
          }
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    // Only show loading indicator if we're actually loading AND there might be more messages
    if (!isLoadingMore || !hasMore) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading more messages...</Text>
      </View>
    );
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.sender?._id === currentUserId || item.sender === currentUserId;
    
    return (
      <View
        style={[
          styles.messageContainer, 
          { backgroundColor: isOwn ? colors.accent : colors.surface },
          isOwn ? styles.ownMessage : styles.otherMessage
        ]}
        testID={`message-${item._id || item.id}`}
      >
        {!isOwn && (
          <Text style={[styles.sender, { color: colors.muted }]} testID="message-sender">
            {item.sender?.name || item.sender}
          </Text>
        )}
        <Text style={[styles.messageText, { color: isOwn ? colors.background : colors.foreground }]} testID="message-text">
          {item.text}
        </Text>
        <Text style={[styles.timestamp, { color: colors.muted }]} testID="message-timestamp">
          {new Date(item.timestamp || item.createdAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="chat-box">
      <FlatList
        ref={flatListRef}
        testID="messages-list"
        data={messages}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        inverted
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={false}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderTypingIndicator}
      />
      
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          testID="message-input"
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
          value={message}
          onChangeText={handleChangeText}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
          multiline
        />
        <TouchableOpacity
          testID="send-button"
          style={[styles.sendButton, { backgroundColor: colors.foreground }]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Text style={[styles.sendButtonText, { color: colors.background }, !message.trim() && styles.sendButtonDisabled]}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 4

  },
  messageContainer: {
    maxWidth: '75%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  sender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    fontSize: 15,
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 20,
    paddingVertical: 15.5,
    borderRadius: 20,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  messagesContainer: {
    paddingVertical: 8,
  },
  typingContainer: {
    padding: 8,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
  },
});
