import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

interface SocketMessage {
  chatId: string;
  message: {
    _id: string;
    sender: {
      _id: string;
      name: string;
      avatar?: string;
    };
    text: string;
    type: string;
    timestamp: string;
  };
}

interface TypingUser {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface UseSocketParams {
  token: string | null;
  isAuthenticated: boolean;
}

export const useSocket = ({ token, isAuthenticated }: UseSocketParams) => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const typingTimeoutRef = useRef<Map<string, any>>(new Map());
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const lastErrorLogTime = useRef<number>(0);

  useEffect(() => {
    // Only create socket if authenticated and token exists, and we don't already have one
    if (isAuthenticated && token && !socketRef.current) {
      const newSocket = io('http://localhost:3001', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        // Join all user's chats
        newSocket.emit('join_chats');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error: any) => {
        // Only log connection errors occasionally to avoid spam
        const now = Date.now();
        if (now - lastErrorLogTime.current > 5000) {
          // Only log errors at most once every 5 seconds
          lastErrorLogTime.current = now;
          console.warn('Socket connection error:', error?.message || 'websocket error');
        }
        setIsConnected(false);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } else if ((!isAuthenticated || !token) && socketRef.current) {
      // Clean up socket if not authenticated
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }

    return () => {
      // Cleanup on unmount
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, token]);

  const sendMessage = useCallback((chatId: string, text: string, type: string = 'text') => {
    if (socket && isConnected) {
      socket.emit('send_message', { chatId, text, type });
    }
  }, [socket, isConnected]);

  const stopTyping = useCallback((chatId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { chatId });
      
      // Clear timeout
      const timeout = typingTimeoutRef.current.get(chatId);
      if (timeout) {
        clearTimeout(timeout);
        typingTimeoutRef.current.delete(chatId);
      }
    }
  }, [socket, isConnected]);

  const startTyping = useCallback((chatId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { chatId });
      
      // Clear existing timeout
      const existingTimeout = typingTimeoutRef.current.get(chatId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set new timeout to stop typing
      const timeout = setTimeout(() => {
        stopTyping(chatId);
      }, 3000);
      
      typingTimeoutRef.current.set(chatId, timeout);
    }
  }, [socket, isConnected, stopTyping]);

  const markMessagesAsRead = useCallback((chatId: string) => {
    if (socket && isConnected) {
      socket.emit('mark_messages_read', { chatId });
    }
  }, [socket, isConnected]);

  const onNewMessage = useCallback((callback: (data: SocketMessage) => void) => {
    if (socket) {
      socket.on('new_message', callback);
      return () => socket.off('new_message', callback);
    }
  }, [socket]);

  const onUserTyping = useCallback((callback: (data: TypingUser) => void) => {
    if (socket) {
      socket.on('user_typing', (data: TypingUser) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (!newMap.has(data.chatId)) {
            newMap.set(data.chatId, new Set());
          }
          
          const chatTypingUsers = newMap.get(data.chatId)!;
          if (data.isTyping) {
            chatTypingUsers.add(data.userName);
          } else {
            chatTypingUsers.delete(data.userName);
          }
          
          return newMap;
        });
        
        callback(data);
      });
      
      return () => socket.off('user_typing', callback);
    }
  }, [socket]);

  const onMessagesRead = useCallback((callback: (data: { chatId: string; userId: string; userName: string }) => void) => {
    if (socket) {
      socket.on('messages_read', callback);
      return () => socket.off('messages_read', callback);
    }
  }, [socket]);

  const onError = useCallback((callback: (error: any) => void) => {
    if (socket) {
      socket.on('error', callback);
      return () => socket.off('error', callback);
    }
  }, [socket]);

  const getTypingUsers = useCallback((chatId: string): string[] => {
    const chatTypingUsers = typingUsers.get(chatId);
    return chatTypingUsers ? Array.from(chatTypingUsers) : [];
  }, [typingUsers]);

  return {
    socket,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    onNewMessage,
    onUserTyping,
    onMessagesRead,
    onError,
    getTypingUsers
  };
};
