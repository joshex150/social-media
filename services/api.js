// API service for Link Up app
const API_BASE_URL = 'https://linkup-api-66uv.onrender.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Get headers with auth token
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Activity methods
  async getActivities(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    return this.request(`/activities?${queryParams}`);
  }

  async getActivity(id) {
    return this.request(`/activities/${id}`);
  }

  async createActivity(activityData) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async updateActivity(id, activityData) {
    return this.request(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    });
  }

  async deleteActivity(id) {
    return this.request(`/activities/${id}`, {
      method: 'DELETE',
    });
  }

  async joinActivity(id) {
    return this.request(`/activities/${id}/join`, {
      method: 'POST',
    });
  }

  async leaveActivity(id) {
    return this.request(`/activities/${id}/leave`, {
      method: 'POST',
    });
  }

  async requestToJoinActivity(id, message = '') {
    return this.request(`/activities/${id}/request`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getUserActivities(userId, type = 'created') {
    return this.request(`/activities/user/${userId}?type=${type}`);
  }

  // Chat methods
  async getChats() {
    return this.request('/chat');
  }

  async getChat(id) {
    return this.request(`/chat/${id}`);
  }

  async sendMessage(chatId, text, type = 'text') {
    return this.request(`/chat/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, type }),
    });
  }

  async getChatMessages(chatId, page = 1, limit = 50) {
    return this.request(`/chat/${chatId}/messages?page=${page}&limit=${limit}`);
  }

  async markChatAsRead(chatId) {
    return this.request(`/chat/${chatId}/read`, {
      method: 'PUT',
    });
  }

  async createActivityChat(activityId) {
    return this.request(`/chat/activity/${activityId}`, {
      method: 'POST',
    });
  }

  async leaveChat(chatId) {
    return this.request(`/chat/${chatId}/leave`, {
      method: 'DELETE',
    });
  }

  // Notification methods
  async getNotifications(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    return this.request(`/notifications?${queryParams}`);
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async clearAllNotifications() {
    return this.request('/notifications/clear-all', {
      method: 'DELETE',
    });
  }

  // Subscription methods
  async getSubscriptionTiers() {
    return this.request('/subscription/tiers');
  }

  async getSubscription() {
    return this.request('/subscription');
  }

  async createStripeCustomer(customerData) {
    return this.request('/subscription/create-customer', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async createSubscription(subscriptionData) {
    return this.request('/subscription/create', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  async updateSubscription(tier) {
    return this.request('/subscription/update', {
      method: 'PUT',
      body: JSON.stringify({ tier }),
    });
  }

  async cancelSubscription() {
    return this.request('/subscription/cancel', {
      method: 'DELETE',
    });
  }

  async getBillingHistory() {
    return this.request('/subscription/billing-history');
  }

  // Utility methods
  async logout() {
    this.token = null;
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
