// API service for Link Up app
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3001/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  subscription: 'free' | 'silver' | 'gold' | 'platinum';
  stats: {
    activitiesCreated: number;
    activitiesJoined: number;
    connectionsMade: number;
    streakDays: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferences?: {
    radius: number;
    notifications: {
      email: boolean;
      push: boolean;
      joinRequests: boolean;
      activityReminders: boolean;
    };
  };
}

export interface Activity {
  _id: string;
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
  participants: User[];
  radius: number;
  createdBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  tags: string[];
  imageUrl?: string;
  chatEnabled: boolean;
  isPublic: boolean;
  joinRequests: any[];
}

export interface JoinRequest {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Chat {
  id: string;
  activityId: string;
  activityTitle: string;
  participants: number;
  lastMessage: {
    text: string;
    sender: string;
    timestamp: string;
  };
  unreadCount: number;
  messages: Message[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
}

export interface Notification {
  _id: string;
  type: 'join_request' | 'activity_reminder' | 'new_activity' | 'achievement';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
  data?: any;
  user: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  maxActivities: number;
  maxRadius: number;
  features: string[];
  popular?: boolean;
}

// Auth API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      console.log('Register response:', data);
      
      // Transform the response to match frontend expectations
      if (data.success && data.data) {
        return {
          success: true,
          token: data.data.token,
          user: data.data.user
        };
      }
      return data;
    } catch (error) {
      console.error('Register API error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      console.log('Login response:', data);
      
      // Transform the response to match frontend expectations
      if (data.success && data.data) {
        return {
          success: true,
          token: data.data.token,
          user: data.data.user
        };
      }
      return data;
    } catch (error) {
      console.error('Login API error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  getCurrentUser: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    console.log('getCurrentUser response:', data);
    return data;
  },

  updateProfile: async (profileData: { name?: string; preferences?: any; location?: any }, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      console.log('Update profile response:', data);
      return data;
    } catch (error) {
      console.error('Update profile API error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(passwordData),
      });
      const data = await response.json();
      console.log('Update password response:', data);
      return data;
    } catch (error) {
      console.error('Update password API error:', error);
      return { success: false, message: 'Network error' };
    }
  },
};

// Activities API
export const activitiesAPI = {
  getActivities: async (token: string, params?: { radius?: number; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.radius) queryParams.append('radius', params.radius.toString());
    if (params?.category) queryParams.append('category', params.category);
    
    const response = await fetch(`${API_BASE_URL}/activities?${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    
    // Transform the response to match frontend expectations
    if (data.success && data.data) {
      return {
        success: true,
        activities: data.data.activities
      };
    }
    return data;
  },

  getActivity: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  createActivity: async (activityData: Partial<Activity>, token: string) => {
    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(activityData),
    });
    return response.json();
  },

  joinActivity: async (activityId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/activities/${activityId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  leaveActivity: async (activityId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/activities/${activityId}/leave`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  sendJoinRequest: async (activityId: string, message: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/activities/${activityId}/join-request`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ message }),
    });
    return response.json();
  },

  getJoinRequests: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/activities/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  respondToJoinRequest: async (requestId: string, action: 'accept' | 'reject', token: string) => {
    const response = await fetch(`${API_BASE_URL}/activities/requests/${requestId}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};

// Chat API
export const chatAPI = {
  getChats: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    
    // Transform the response to match frontend expectations
    if (data.success && data.data) {
      return {
        success: true,
        chats: data.data.chats
      };
    }
    return data;
  },

  getChat: async (chatId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  sendMessage: async (chatId: string, message: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ text: message }),
    });
    return response.json();
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    
    // Transform the response to match frontend expectations
    if (data.success && data.data) {
      return {
        success: true,
        notifications: data.data.notifications
      };
    }
    return data;
  },

  markAsRead: async (notificationId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};

// Subscription API
export const subscriptionAPI = {
  getTiers: async () => {
    const response = await fetch(`${API_BASE_URL}/subscription/tiers`);
    const data = await response.json();
    
    // Transform the response to match frontend expectations
    if (data.success && data.data) {
      return {
        success: true,
        tiers: data.data.tiers
      };
    }
    return data;
  },

  getCurrentSubscription: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  upgradeSubscription: async (tierId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/subscription/upgrade`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ tierId }),
    });
    return response.json();
  },
};

// Helper function to get auth token from storage
export const getAuthToken = async (): Promise<string | null> => {
  try {
    console.log('Getting auth token from storage...');
    const token = await AsyncStorage.getItem('authToken');
    console.log('Retrieved token:', token ? 'Token found' : 'No token found');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to save auth token to storage
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    if (!token || token === 'undefined' || token === 'null') {
      console.warn('Invalid token provided to saveAuthToken:', token);
      return;
    }
    console.log('Saving auth token to storage...');
    await AsyncStorage.setItem('authToken', token);
    console.log('Auth token saved successfully');
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

// Helper function to remove auth token from storage
export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};
