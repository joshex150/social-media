import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import ChatBox from "@/components/ChatBox";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

interface Chat {
  id: string;
  eventId: string;
  eventTitle: string;
  participants: number;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export default function ChatScreen() {
  const [activeChats, setActiveChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
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

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    loadActiveChats(); // Refresh to get latest messages
  };

  const handleSendMessage = async (message: any) => {
    if (!selectedChat || !(selectedChat as any).eventId) {
      Alert.alert('Error', 'No chat selected');
      return;
    }
    try {
      const eventId = (selectedChat as any).eventId;
      const response = await fetch(`/api/events/${eventId}/messages`, {
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
        <View style={[styles.chatHeader, safeArea.header]}>
          <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#000" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.chatInfo}>
            <Text style={styles.chatTitle}>{selectedChat.eventTitle}</Text>
            <Text style={styles.chatSubtitle}>{selectedChat.participants} participants</Text>
          </View>
        </View>
        
        <ChatBox
          messages={[]} // TODO: Load messages for this chat
          onSendMessage={handleSendMessage}
          onTyping={() => {}} // TODO: Implement typing indicator
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, safeArea.content]}>
      <View style={[styles.header, safeArea.header]}>
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
    paddingHorizontal: PADDING.header.horizontal,
    paddingVertical: PADDING.header.vertical,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
    marginBottom: MARGIN.text.bottom,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: "#666",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING.header.horizontal,
    paddingVertical: PADDING.header.vertical,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: PADDING.content.vertical,
    paddingVertical: MARGIN.text.bottom,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: "#000",
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: GAPS.small,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
  },
  chatSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
  },
  chatItem: {
    flexDirection: "row",
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  chatContent: {
    flex: 1,
  },
  chatEventTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: MARGIN.text.bottom,
  },
  chatLastMessage: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    marginBottom: MARGIN.text.bottom,
  },
  chatTime: {
    fontSize: FONT_SIZES.xs,
    color: "#999",
  },
  chatMeta: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  participantCount: {
    backgroundColor: "#f5f5f5",
    borderRadius: BORDER_RADIUS.large,
    paddingHorizontal: GAPS.small,
    paddingVertical: MARGIN.text.bottom,
    marginBottom: MARGIN.text.bottom,
  },
  participantCountText: {
    fontSize: FONT_SIZES.xs,
    color: "#666",
    fontWeight: FONT_WEIGHTS.medium,
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
    fontSize: FONT_SIZES.xs,
    color: "#fff",
    fontWeight: FONT_WEIGHTS.semibold,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: PADDING.content.horizontal * 3,
    paddingHorizontal: PADDING.content.horizontal * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.small,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
