import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import ChatBox from "@/components/ChatBox";

export default function ChatScreen() {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const safeArea = useSafeAreaStyle();

  useEffect(() => {
    loadActiveChats();
  }, []);

  const loadActiveChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events/active-chats');
      const data = await response.json();
      setActiveChats(data.chats || []);
    } catch (error) {
      console.error('Failed to load active chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    loadActiveChats(); // Refresh to get latest messages
  };

  const handleSendMessage = async (message) => {
    try {
      const response = await fetch(`/api/events/${selectedChat.eventId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          userId: 'user_123',
          userName: 'You',
        }),
      });

      if (response.ok) {
        // Message sent successfully, chat will refresh automatically
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  if (selectedChat) {
    return (
      <View style={[styles.container, safeArea.content]}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.chatInfo}>
            <Text style={styles.chatTitle}>{selectedChat.eventTitle}</Text>
            <Text style={styles.chatSubtitle}>{selectedChat.participants} participants</Text>
          </View>
        </View>
        
        <ChatBox
          eventId={selectedChat.eventId}
          onSendMessage={handleSendMessage}
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, safeArea.content]}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Chats</Text>
        <Text style={styles.subtitle}>Join conversations from your activities</Text>
      </View>

      {activeChats.length > 0 ? (
        activeChats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            onPress={() => handleChatSelect(chat)}
          >
            <View style={styles.chatContent}>
              <Text style={styles.chatEventTitle}>{chat.eventTitle}</Text>
              <Text style={styles.chatLastMessage}>{chat.lastMessage}</Text>
              <Text style={styles.chatTime}>{chat.lastMessageTime}</Text>
            </View>
            <View style={styles.chatMeta}>
              <View style={styles.participantCount}>
                <Text style={styles.participantCountText}>{chat.participants}</Text>
              </View>
              {chat.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No active chats</Text>
          <Text style={styles.emptySubtitle}>
            Join an activity to start chatting with other participants
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  chatSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  chatContent: {
    flex: 1,
  },
  chatEventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  chatLastMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  chatTime: {
    fontSize: 12,
    color: "#999",
  },
  chatMeta: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  participantCount: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  participantCountText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#000",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
