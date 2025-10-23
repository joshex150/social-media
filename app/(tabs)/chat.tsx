import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, Modal, Dimensions } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import ChatBox from "@/components/ChatBox";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import type { Chat } from "@/services/api";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ChatScreen() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  const safeArea = useSafeAreaStyle();
  const { chats, loadChats, sendMessage } = useApi();

  useEffect(() => {
    loadChats();
    setLoading(false);
  }, [loadChats]);

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedChat) return;
    
    const result = await sendMessage(selectedChat.id, message);
    if (result.success) {
      // Message sent successfully, the chat list will be updated automatically
      console.log('Message sent successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to send message');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, safeArea.content]}>
        <FontAwesome name="spinner" size={32} color="#000" />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={[styles.header, safeArea.header]}>
          <Text style={styles.title}>Messages</Text>
          <TouchableOpacity style={styles.searchButton}>
            <FontAwesome name="search" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Chats List */}
        {chats?.length > 0 ? (
          chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatItem}
              onPress={() => handleChatSelect(chat)}
            >
              <View style={styles.chatAvatar}>
                <FontAwesome name="users" size={20} color="#000" />
              </View>
              <View style={styles.chatContent}>
                <Text style={styles.chatEventTitle}>{chat.activityTitle}</Text>
                <Text style={styles.chatLastMessage}>{chat.lastMessage.text}</Text>
                <Text style={styles.chatTime}>{formatTime(chat.lastMessage.timestamp)}</Text>
              </View>
              <View style={styles.chatMeta}>
                <Text style={styles.participantCount}>{chat.participants}</Text>
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
            <FontAwesome name="comment-o" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No active chats</Text>
            <Text style={styles.emptySubtitle}>
              Join an activity to start chatting with other participants
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Chat Modal */}
      <Modal
        visible={!!selectedChat}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleBackToList}
      >
        <View style={[styles.modalContainer, safeArea.content]}>
          <View style={[styles.chatHeader, safeArea.header]}>
            <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
              <FontAwesome name="arrow-left" size={20} color="#000" />
            </TouchableOpacity>
            <View style={styles.chatInfo}>
              <Text style={styles.chatTitle}>{selectedChat?.activityTitle}</Text>
              <Text style={styles.chatSubtitle}>{selectedChat?.participants} participants</Text>
            </View>
          </View>
          
          <View style={styles.chatContainer}>
            <ChatBox
              messages={selectedChat?.messages || []}
              onSendMessage={handleSendMessage}
              onTyping={() => {}}
            />
          </View>
        </View>
      </Modal>
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: "#666",
    marginTop: GAPS.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: PADDING.content.vertical,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
  },
  searchButton: {
    padding: GAPS.small,
  },
  chatItem: {
    flexDirection: "row",
    // paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
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
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 0,
    top: 14,
    width:20
  },
  participantCount: {
    fontSize: FONT_SIZES.xs,
    color: "#999",
    marginBottom: GAPS.small,
  },
  unreadBadge: {
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING.content.horizontal,
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
    marginBottom: GAPS.small,
  },
  chatSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: PADDING.content.vertical * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#666",
    marginTop: GAPS.medium,
    marginBottom: GAPS.small,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: "#999",
    textAlign: "center",
  },
  chatContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});