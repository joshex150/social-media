import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Modal, Dimensions } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useTheme } from "@/contexts/ThemeContext";
import CustomAlert from "@/components/CustomAlert";
import ChatBox from "@/components/ChatBox";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import type { Chat } from "@/services/api";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ChatScreen() {
  const { colors } = useTheme();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { alert, showAlert, hideAlert } = useCustomAlert();
  const errorHandler = useErrorHandler();

  const safeArea = useSafeAreaStyle();
  const { 
    chats, 
    loadChats, 
    sendMessage, 
    getChatMessages, 
    markChatAsRead,
    startTyping,
    stopTyping,
    getTypingUsers,
    isSocketConnected,
    user 
  } = useApi();

  useEffect(() => {
    // Data is loaded centrally in ApiContext, no need to call loadChats directly
    setLoading(false);
  }, [chats]);

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    setCurrentPage(1);
    setHasMore(true);
    setMessages([]);
    
    // Load initial messages
    await loadChatMessages(chat.id, 1);
    
    // Mark chat as read
    markChatAsRead(chat.id);
  };

  const loadChatMessages = async (chatId: string, page: number) => {
    try {
      const response = await getChatMessages(chatId, page);
      if (response.success && response.messages) {
        if (page === 1) {
          setMessages(response.messages || []);
        } else {
          setMessages(prev => [...(response.messages || []), ...prev]);
        }
        setHasMore(response.pagination?.hasMore || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleLoadMore = async () => {
    if (!selectedChat || !hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    await loadChatMessages(selectedChat.id, currentPage + 1);
    setIsLoadingMore(false);
  };

  const handleTyping = (isTyping: boolean) => {
    if (!selectedChat) return;
    
    if (isTyping) {
      startTyping(selectedChat.id);
    } else {
      stopTyping(selectedChat.id);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedChat) return;
    
    try {
      const result = await sendMessage(selectedChat.id, message);
      if (result.success) {
        // Message sent successfully, the chat list will be updated automatically
        // console.log('Message sent successfully');
      } else {
        showAlert('Error', result.error || 'Failed to send message', 'error');
      }
    } catch (error) {
      errorHandler.handleError(error, 'Sending message');
      showAlert('Error', 'Failed to send message', 'error');
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
      <View style={[styles.container, styles.centerContent, safeArea.content, { backgroundColor: colors.background }]}>
        <FontAwesome name="spinner" size={32} color={colors.foreground} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, safeArea.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Messages</Text>
          <TouchableOpacity style={styles.searchButton}>
            <FontAwesome name="search" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>

        {/* Chats List */}
        {chats?.length > 0 ? (
          chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={[styles.chatItem, { borderBottomColor: colors.border }]}
              onPress={() => handleChatSelect(chat)}
            >
              <View style={[styles.chatAvatar, { backgroundColor: colors.surface }]}>
                <FontAwesome name="users" size={20} color={colors.foreground} />
              </View>
              <View style={styles.chatContent}>
                <Text style={[styles.chatEventTitle, { color: colors.foreground }]}>{chat.activityTitle}</Text>
                <Text style={[styles.chatLastMessage, { color: colors.muted }]}>{chat.lastMessage.text}</Text>
                <Text style={[styles.chatTime, { color: colors.muted }]}>{formatTime(chat.lastMessage.timestamp)}</Text>
              </View>
              <View style={styles.chatMeta}>
                <Text style={[styles.participantCount, { color: colors.muted }]}>{chat.participants}</Text>
                {chat.unreadCount > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
                    <Text style={[styles.unreadText, { color: colors.background }]}>{chat.unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="comment-o" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.muted }]}>No active chats</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              Join an activity to start chatting with other participants
            </Text>
          </View>
        )}
        </ScrollView>
      </View>

      {/* Chat Modal */}
      <Modal
        visible={!!selectedChat}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleBackToList}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.chatHeader, safeArea.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
              <FontAwesome name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.chatInfo}>
              <Text style={[styles.chatTitle, { color: colors.foreground }]}>{selectedChat?.activityTitle}</Text>
              <Text style={[styles.chatSubtitle, { color: colors.muted }]}>{selectedChat?.participants} participants</Text>
            </View>
          </View>
          
          <View style={styles.chatContainer}>
            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              typingUsers={getTypingUsers(selectedChat?.id || '')}
              currentUserId={user?.id}
            />
          </View>
        </View>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: PADDING.content.horizontal,
    paddingTop: 124, // Account for fixed header + safe area + extra spacing
    paddingBottom: PADDING.content.vertical,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    marginTop: GAPS.medium,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
    borderBottomWidth: 1,
    marginTop: PADDING.content.vertical,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  searchButton: {
    padding: GAPS.small,
  },
  chatItem: {
    flexDirection: "row",
    paddingVertical: PADDING.content.vertical,
    borderBottomWidth: 1,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    marginBottom: MARGIN.text.bottom,
  },
  chatLastMessage: {
    fontSize: FONT_SIZES.sm,
    marginBottom: MARGIN.text.bottom,
  },
  chatTime: {
    fontSize: FONT_SIZES.xs,
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
    marginBottom: GAPS.small,
  },
  unreadBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.header.vertical,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: PADDING.content.vertical,
    paddingVertical: MARGIN.text.bottom,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: GAPS.small,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: GAPS.small,
  },
  chatSubtitle: {
    fontSize: FONT_SIZES.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: PADDING.content.vertical * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: GAPS.medium,
    marginBottom: GAPS.small,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: "center",
  },
  chatContainer: {
    flex: 1,
    marginTop: 0,
  },
  modalContainer: {
    flex: 1,
  },
});