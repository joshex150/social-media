import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI, activitiesAPI, chatAPI, notificationsAPI, subscriptionAPI, getAuthToken, saveAuthToken, removeAuthToken, type User, type Activity, type Chat, type Notification, type SubscriptionTier, type JoinRequest } from '@/services/api';
import { useRouter } from 'expo-router';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useSocket } from '@/hooks/useSocket';

interface ApiContextType {
  // Auth state
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;

  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  updateProfile: (profileData: { name?: string; preferences?: any; location?: any }) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (passwordData: { currentPassword: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;

  // Data state
  activities: Activity[];
  chats: Chat[];
  notifications: Notification[];
  subscriptionTiers: SubscriptionTier[];
  joinRequests: JoinRequest[];

  // Data actions
  loadActivities: () => Promise<void>;
  loadChats: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadSubscriptionTiers: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Activity actions
  createActivity: (activityData: {
    title: string;
    description: string;
    category: 'social' | 'fitness' | 'learning' | 'food' | 'travel' | 'music' | 'sports' | 'tech';
    location: {
      name: string;
      latitude: number;
      longitude: number;
      address: string;
    };
    date: string;
    duration: number;
    maxParticipants: number;
    radius: number;
    tags?: string[];
    imageUrl?: string;
    chatEnabled?: boolean;
    isPublic?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  joinActivity: (activityId: string) => Promise<{ success: boolean; error?: string }>;
  leaveActivity: (activityId: string) => Promise<{ success: boolean; error?: string }>;
  sendJoinRequest: (activityId: string, message: string) => Promise<{ success: boolean; error?: string }>;
  getJoinRequests: () => Promise<{ success: boolean; error?: string }>;
  respondToJoinRequest: (requestId: string, action: 'accept' | 'reject') => Promise<{ success: boolean; error?: string }>;

  // Chat actions
  sendMessage: (chatId: string, message: string) => Promise<{ success: boolean; error?: string }>;
  getChatMessages: (chatId: string, page?: number) => Promise<{ success: boolean; messages?: any[]; pagination?: any; error?: string }>;
  markChatAsRead: (chatId: string) => void;
  
  // Socket actions
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  getTypingUsers: (chatId: string) => string[];
  isSocketConnected: boolean;

  // Notification actions
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    // Provide more helpful error message with stack trace info
    const error = new Error('useApi must be used within an ApiProvider');
    console.error('useApi hook called outside of ApiProvider:', {
      error,
      stack: error.stack,
      // Log component tree if available
    });
    throw error;
  }
  return context;
};

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Request tracking to prevent infinite loops
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const router = useRouter();
  const errorHandler = useErrorHandler();
  const isAuthenticated = !!user && !!token;
  const { 
    socket, 
    isConnected: isSocketConnected, 
    sendMessage: socketSendMessage, 
    startTyping, 
    stopTyping, 
    markMessagesAsRead, 
    onNewMessage, 
    onUserTyping, 
    onMessagesRead, 
    onError, 
    getTypingUsers 
  } = useSocket({ token, isAuthenticated });
  
  // Initialize auth on app start with better error handling
  useEffect(() => {
    let isMounted = true;
    
    const initializeWithTimeout = async () => {
      try {
        // Add a small delay to prevent race conditions
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (!isMounted) return;
        
        await Promise.race([
          initializeAuth(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth initialization timeout')), 1500)
          )
        ]);
      } catch (error) {
        if (isMounted) {
          console.error('Auth initialization failed or timed out:', error);
          // Don't crash the app, just set loading to false
          setIsLoading(false);
        }
      }
    };

    // Also set a hard timeout to ensure loading never gets stuck
    const hardTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Hard timeout reached, forcing loading to false');
        setIsLoading(false);
      }
    }, 2000);

    initializeWithTimeout().finally(() => {
      clearTimeout(hardTimeout);
    });

    return () => {
      isMounted = false;
      clearTimeout(hardTimeout);
    };
  }, []);

  // Load data when authenticated (but only once to prevent infinite loops)
  useEffect(() => {
    if (isAuthenticated && !dataLoaded && !requestInProgress) {
      // console.log('User authenticated, loading data once...');
      // Add a small delay to prevent rapid-fire calls
      const timeoutId = setTimeout(() => {
        loadAllData();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, dataLoaded]);

  const initializeAuth = async () => {
    try {
      // console.log('Initializing auth...');
      const savedToken = await getAuthToken();
      // console.log('Saved token found:', !!savedToken);
      
      if (savedToken) {
        setToken(savedToken);
        // console.log('Token set, attempting to fetch user data...');
        
        try {
          // Add aggressive timeout to the API call itself
          const userResponse = await Promise.race([
            authAPI.getCurrentUser(savedToken),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('User API timeout')), 1000)
            )
          ]);
          
          // console.log('User response:', userResponse);
          
          if (userResponse.success && userResponse.data && userResponse.data.user) {
            setUser(userResponse.data.user);
            // console.log('User set successfully:', userResponse.data.user.name);
          } else {
            // console.log('Token invalid or user data missing, clearing token');
            await removeAuthToken();
            setToken(null);
            setUser(null);
          }
        } catch (apiError) {
          console.warn('User API call failed, but keeping token for offline mode:', apiError);
          // Don't clear the token if API fails - user might be offline
          // Just set a placeholder user
          setUser({ 
            id: 'offline-user', 
            name: 'User', 
            email: 'user@example.com',
            joinDate: new Date().toISOString(),
            subscription: 'free',
            stats: { 
              activitiesCreated: 0, 
              activitiesJoined: 0,
              connectionsMade: 0,
              streakDays: 0
            }
          });
          // Set as guest mode so user can still use the app
          setIsGuest(true);
        }
      } else {
        // console.log('No saved token found');
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Only clear state if it's a critical error, not just API timeout
      if (error instanceof Error && error.message.includes('timeout')) {
        // console.log('Auth timeout, but continuing with offline mode');
      } else {
        await removeAuthToken();
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
      // console.log('Auth initialization complete');
    }
  };

  const loadAllData = async () => {
    if (!token || dataLoaded) return;
    
    // Prevent infinite loops with request deduplication
    const now = Date.now();
    if (requestInProgress || (now - lastRequestTime) < 2000) {
      // console.log('Request already in progress or too recent, skipping...');
      return;
    }
    
    setRequestInProgress(true);
    setLastRequestTime(now);
    
    try {
      // console.log('Loading all data once...');
      await Promise.all([
        loadActivities(),
        loadChats(),
        loadNotifications(),
        loadSubscriptionTiers(),
        loadJoinRequests(),
      ]);
      // console.log('All data loaded successfully');
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRequestInProgress(false);
    }
  };

  // Socket.io event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      console.log('New message received:', data);
      // Update chats list with new message
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === data.chatId 
            ? { 
                ...chat, 
                lastMessage: {
                  text: data.message.text,
                  sender: data.message.sender.name,
                  timestamp: data.message.timestamp
                }
              }
            : chat
        )
      );
    };

    const handleUserTyping = (data: any) => {
      console.log('User typing:', data);
      // Typing indicators are handled by the useSocket hook
    };

    const handleMessagesRead = (data: any) => {
      console.log('Messages read:', data);
      // Could update read receipts here if needed
    };

    const handleError = (error: any) => {
      console.error('Socket error:', error);
      errorHandler.handleError(new Error(error.message), 'Socket connection error');
    };

    // Set up event listeners
    const unsubscribeNewMessage = onNewMessage(handleNewMessage);
    const unsubscribeUserTyping = onUserTyping(handleUserTyping);
    const unsubscribeMessagesRead = onMessagesRead(handleMessagesRead);
    const unsubscribeError = onError(handleError);

    return () => {
      unsubscribeNewMessage?.();
      unsubscribeUserTyping?.();
      unsubscribeMessagesRead?.();
      unsubscribeError?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const login = async (email: string, password: string) => {
    try {
      // console.log('Starting login process...');
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      // console.log('Login response:', response);
      
      if (response.success && response.token) {
        // console.log('Login successful, setting token and user...');
        setToken(response.token);
        setUser(response.user);
        setIsGuest(false); // Guest becomes authenticated user
        await saveAuthToken(response.token);
        // console.log('Login process complete');
        return { success: true };
      } else {
        console.error('Login failed:', response);
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      errorHandler.handleError(error, 'Login');
      return { success: false, error: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register({ name, email, password });
      
      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.user);
        setIsGuest(false); // Guest becomes authenticated user
        await saveAuthToken(response.token);
        return { success: true };
      } else {
        console.error('Registration failed:', response);
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      errorHandler.handleError(error, 'Registration');
      return { success: false, error: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      router.push("/login");
      await removeAuthToken();
      setToken(null);
      setUser(null);
      setIsGuest(false);
      setActivities([]);
      setChats([]);
      setNotifications([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const continueAsGuest = async () => {
    try {
      // Create a guest user object
      const guestUser: User = {
        id: 'guest',
        name: 'Guest User',
        email: 'guest@example.com',
        avatar: undefined,
        joinDate: new Date().toISOString(),
        subscription: 'free',
        stats: {
          activitiesCreated: 0,
          activitiesJoined: 0,
          connectionsMade: 0,
          streakDays: 0,
        },
        location: undefined,
        preferences: {
          radius: 10,
          notifications: {
            email: false,
            push: false,
            joinRequests: false,
            activityReminders: false,
          },
        },
      };

      setUser(guestUser);
      setToken('guest-token');
      setIsGuest(true);
      
      // Load some sample data for guest
      await loadActivities();
      await loadSubscriptionTiers();
      
      // Don't navigate here - let the login page useEffect handle navigation
      // This prevents double navigation
    } catch (error) {
      console.error('Error continuing as guest:', error);
    }
  };

  const updateProfile = async (profileData: { name?: string; preferences?: any; location?: any }) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await authAPI.updateProfile(profileData, token);
      if (response.success && response.data && response.data.user) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to update profile' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const updatePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await authAPI.updatePassword(passwordData, token);
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to update password' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const loadActivities = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await activitiesAPI.getActivities(token);
      if (response.success) {
        setActivities(response.activities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      errorHandler.handleError(error, 'Loading activities');
    }
  }, [token, errorHandler]);

  const loadChats = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await chatAPI.getChats(token);
      if (response.success) {
        setChats(response.chats || []);
      } else {
        setChats([]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setChats([]);
    }
  }, [token]);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await notificationsAPI.getNotifications(token);
      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [token]);

  const loadSubscriptionTiers = useCallback(async () => {
    try {
      const response = await subscriptionAPI.getTiers();
      if (response.success) {
        setSubscriptionTiers(response.tiers);
      }
    } catch (error) {
      console.error('Error loading subscription tiers:', error);
    }
  }, []);

  const loadJoinRequests = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await activitiesAPI.getJoinRequests(token);
      if (response.success) {
        setJoinRequests(response.requests || []);
      }
    } catch (error) {
      console.error('Error loading join requests:', error);
    }
  }, [token]);

  const refreshData = useCallback(async () => {
    // Reset data loaded flag for manual refresh
    setDataLoaded(false);
    await loadAllData();
  }, []);

  const createActivity = async (activityData: {
    title: string;
    description: string;
    category: 'social' | 'fitness' | 'learning' | 'food' | 'travel' | 'music' | 'sports' | 'tech';
    location: {
      name: string;
      latitude: number;
      longitude: number;
      address: string;
    };
    date: string;
    duration: number;
    maxParticipants: number;
    radius: number;
    tags?: string[];
    imageUrl?: string;
    chatEnabled?: boolean;
    isPublic?: boolean;
  }) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await activitiesAPI.createActivity(activityData, token);
      if (response.success) {
        await loadActivities(); // Refresh activities list
        await loadChats(); // Refresh chats list to include the new chat
        // Refresh user data to update stats (activity count)
        if (token) {
          try {
            const userResponse = await authAPI.getCurrentUser(token);
            if (userResponse.success && userResponse.data && userResponse.data.user) {
              setUser(userResponse.data.user);
            }
          } catch (error) {
            console.error('Error refreshing user data:', error);
            // Don't fail the activity creation if user refresh fails
          }
        }
        return { success: true };
      } else {
        // Extract error messages from validation errors array
        let errorMessage = response.message || 'Failed to create activity';
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          // Combine all validation error messages
          const errorMessages = response.errors.map((err: any) => {
            const field = err.path ? err.path.split('.').pop() : 'field';
            return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${err.msg}`;
          });
          errorMessage = errorMessages.join('\n');
        }
        return { success: false, error: errorMessage, errors: response.errors };
      }
    } catch (error: any) {
      console.error('Create activity error:', error);
      let errorMessage = 'Network error';
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          const errorMessages = data.errors.map((err: any) => {
            const field = err.path ? err.path.split('.').pop() : 'field';
            return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${err.msg}`;
          });
          errorMessage = errorMessages.join('\n');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      return { success: false, error: errorMessage, errors: error.response?.data?.errors };
    }
  };

  const joinActivity = async (activityId: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await activitiesAPI.joinActivity(activityId, token);
      if (response.success) {
        await loadActivities(); // Refresh activities list
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to join activity' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const leaveActivity = async (activityId: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await activitiesAPI.leaveActivity(activityId, token);
      if (response.success) {
        await loadActivities(); // Refresh activities list
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to leave activity' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const sendJoinRequest = async (activityId: string, message: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await activitiesAPI.sendJoinRequest(activityId, message, token);
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to send join request' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const getJoinRequests = async () => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await activitiesAPI.getJoinRequests(token);
      if (response.success) {
        setJoinRequests(response.requests || []);
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to load join requests' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const respondToJoinRequest = async (requestId: string, action: 'accept' | 'reject') => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await activitiesAPI.respondToJoinRequest(requestId, action, token);
      if (response.success) {
        await loadJoinRequests(); // Refresh join requests list
        return { success: true };
      } else {
        return { success: false, error: response.message || `Failed to ${action} join request` };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const sendMessage = async (chatId: string, message: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      // Use Socket.io for real-time messaging
      if (isSocketConnected) {
        socketSendMessage(chatId, message, 'text');
        return { success: true };
      } else {
        // Fallback to REST API if Socket.io not connected
        const response = await chatAPI.sendMessage(chatId, message, token);
        if (response.success) {
          await loadChats(); // Refresh chats list
          return { success: true };
        } else {
          return { success: false, error: response.message || 'Failed to send message' };
        }
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const getChatMessages = async (chatId: string, page: number = 1) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await chatAPI.getMessages(chatId, page, 20, token);
      
      // Transform response to match expected structure
      if (response.success) {
        // Handle different response structures
        const messages = response.messages || response.data?.messages || [];
        const pagination = response.pagination || response.data?.pagination || {};
        
        return {
          success: true,
          messages,
          pagination: {
            hasMore: pagination.hasMore !== undefined 
              ? pagination.hasMore 
              : (pagination.currentPage !== undefined && pagination.totalPages !== undefined
                  ? pagination.currentPage < pagination.totalPages
                  : (pagination.page !== undefined && pagination.pages !== undefined
                      ? pagination.page < pagination.pages
                      : messages.length >= 20)),
            currentPage: pagination.currentPage || pagination.page || page,
            totalPages: pagination.totalPages || pagination.pages || 1,
            totalMessages: pagination.totalMessages || pagination.total || messages.length
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const markChatAsRead = (chatId: string) => {
    if (isSocketConnected) {
      markMessagesAsRead(chatId);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!token) return;
    
    try {
      await notificationsAPI.markAsRead(notificationId, token);
      await loadNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const value: ApiContextType = {
    // Auth state
    user,
    token,
    isAuthenticated,
    isGuest,
    isLoading,

    // Auth actions
    login,
    register,
    logout,
    continueAsGuest,
    updateProfile,
    updatePassword,

    // Data state
    activities,
    chats,
    notifications,
    subscriptionTiers,
    joinRequests,

    // Data actions
    loadActivities,
    loadChats,
    loadNotifications,
    loadSubscriptionTiers,
    refreshData,

    // Activity actions
    createActivity,
    joinActivity,
    leaveActivity,
    sendJoinRequest,
    getJoinRequests,
    respondToJoinRequest,

    // Chat actions
    sendMessage,
    getChatMessages,
    markChatAsRead,

    // Socket actions
    startTyping,
    stopTyping,
    getTypingUsers,
    isSocketConnected,

    // Notification actions
    markNotificationAsRead,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};