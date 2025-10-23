import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, activitiesAPI, chatAPI, notificationsAPI, subscriptionAPI, getAuthToken, saveAuthToken, removeAuthToken, type User, type Activity, type Chat, type Notification, type SubscriptionTier, type JoinRequest } from '@/services/api';
import { useRouter } from 'expo-router';

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
  createActivity: (activityData: Partial<Activity>) => Promise<{ success: boolean; error?: string }>;
  joinActivity: (activityId: string) => Promise<{ success: boolean; error?: string }>;
  leaveActivity: (activityId: string) => Promise<{ success: boolean; error?: string }>;
  sendJoinRequest: (activityId: string, message: string) => Promise<{ success: boolean; error?: string }>;
  getJoinRequests: () => Promise<{ success: boolean; error?: string }>;
  respondToJoinRequest: (requestId: string, action: 'accept' | 'reject') => Promise<{ success: boolean; error?: string }>;

  // Chat actions
  sendMessage: (chatId: string, message: string) => Promise<{ success: boolean; error?: string }>;

  // Notification actions
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const router = useRouter();
  const isAuthenticated = !!user && !!token;
  
  // Debug logging
  useEffect(() => {
    console.log('Auth state changed:', { 
      hasUser: !!user, 
      hasToken: !!token, 
      isAuthenticated 
    });
  }, [user, token, isAuthenticated]);

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const initializeAuth = async () => {
    try {
      console.log('Initializing auth...');
      const savedToken = await getAuthToken();
      console.log('Saved token found:', !!savedToken);
      
      if (savedToken) {
        setToken(savedToken);
        console.log('Token set, fetching user data...');
        const userResponse = await authAPI.getCurrentUser(savedToken);
        console.log('User response:', userResponse);
        
        if (userResponse.success && userResponse.data && userResponse.data.user) {
          setUser(userResponse.data.user);
          console.log('User set successfully:', userResponse.data.user.name);
        } else {
          console.log('Token invalid or user data missing, clearing token');
          // Token is invalid, remove it
          await removeAuthToken();
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('No saved token found');
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Clear any invalid state
      await removeAuthToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('Auth initialization complete');
    }
  };

  const loadAllData = async () => {
    if (!token) return;
    
    try {
      await Promise.all([
        loadActivities(),
        loadChats(),
        loadNotifications(),
        loadSubscriptionTiers(),
        loadJoinRequests(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login process...');
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response);
      
      if (response.success && response.token) {
        console.log('Login successful, setting token and user...');
        setToken(response.token);
        setUser(response.user);
        await saveAuthToken(response.token);
        console.log('Login process complete');
        return { success: true };
      } else {
        console.error('Login failed:', response);
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
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
        await saveAuthToken(response.token);
        return { success: true };
      } else {
        console.error('Registration failed:', response);
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
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
      
      // Navigate to main app
      router.replace("/(tabs)");
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

  const loadActivities = async () => {
    if (!token) return;
    
    try {
      const response = await activitiesAPI.getActivities(token);
      if (response.success) {
        setActivities(response.activities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadChats = async () => {
    if (!token) return;
    
    try {
      const response = await chatAPI.getChats(token);
      if (response.success) {
        setChats(response.chats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadNotifications = async () => {
    if (!token) return;
    
    try {
      const response = await notificationsAPI.getNotifications(token);
      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadSubscriptionTiers = async () => {
    try {
      const response = await subscriptionAPI.getTiers();
      if (response.success) {
        setSubscriptionTiers(response.tiers);
      }
    } catch (error) {
      console.error('Error loading subscription tiers:', error);
    }
  };

  const loadJoinRequests = async () => {
    if (!token) return;
    
    try {
      const response = await activitiesAPI.getJoinRequests(token);
      if (response.success) {
        setJoinRequests(response.requests || []);
      }
    } catch (error) {
      console.error('Error loading join requests:', error);
    }
  };

  const refreshData = async () => {
    await loadAllData();
  };

  const createActivity = async (activityData: Partial<Activity>) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await activitiesAPI.createActivity(activityData, token);
      if (response.success) {
        await loadActivities(); // Refresh activities list
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to create activity' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
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
      const response = await chatAPI.sendMessage(chatId, message, token);
      if (response.success) {
        await loadChats(); // Refresh chats list
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to send message' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
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

    // Notification actions
    markNotificationAsRead,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};