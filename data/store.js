// Simple in-memory data store for demo purposes
// TODO: Migrate to a proper database

let events = [];
let messages = [];
let feedbacks = [];
let joinRequests = [];
let users = new Map();

// Event management
export const createEvent = (eventData) => {
  const event = {
    id: `evt_${Date.now()}`,
    ...eventData,
    createdAt: new Date().toISOString(),
    participants: [],
  };
  events.push(event);
  return event;
};

export const getEvent = (eventId) => {
  return events.find(e => e.id === eventId);
};

export const getEvents = (filters = {}) => {
  let filtered = [...events];
  
  if (filters.radius && filters.userLat && filters.userLng) {
    filtered = filtered.filter(event => {
      const distance = calculateDistance(
        filters.userLat,
        filters.userLng,
        event.latitude,
        event.longitude
      );
      return distance <= filters.radius;
    });
  }
  
  return filtered;
};

export const updateEvent = (eventId, updates) => {
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    return events[index];
  }
  return null;
};

// Join request management
export const createJoinRequest = (requestData) => {
  const request = {
    id: `req_${Date.now()}`,
    ...requestData,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  joinRequests.push(request);
  return request;
};

export const getJoinRequests = (eventId) => {
  return joinRequests.filter(r => r.eventId === eventId && r.status === 'pending');
};

export const updateJoinRequest = (requestId, status) => {
  const index = joinRequests.findIndex(r => r.id === requestId);
  if (index !== -1) {
    joinRequests[index].status = status;
    
    if (status === 'accepted') {
      const request = joinRequests[index];
      const event = getEvent(request.eventId);
      if (event) {
        event.participants.push({
          id: request.userId,
          name: request.userName,
          status: 'accepted',
        });
      }
    }
    
    return joinRequests[index];
  }
  return null;
};

// Message management
export const createMessage = (messageData) => {
  const message = {
    id: `msg_${Date.now()}`,
    ...messageData,
    timestamp: new Date().toISOString(),
  };
  messages.push(message);
  return message;
};

export const getMessages = (eventId) => {
  return messages.filter(m => m.eventId === eventId);
};

// Feedback management
export const createFeedback = (feedbackData) => {
  const feedback = {
    id: `fb_${Date.now()}`,
    ...feedbackData,
    timestamp: new Date().toISOString(),
  };
  feedbacks.push(feedback);
  return feedback;
};

export const getFeedbacks = (eventId) => {
  return feedbacks.filter(f => f.eventId === eventId);
};

// User management
export const createOrUpdateUser = (userId, userData) => {
  users.set(userId, { ...users.get(userId), ...userData });
  return users.get(userId);
};

export const getUser = (userId) => {
  return users.get(userId);
};

// Utility functions
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Analytics
let analytics = {
  activeUsers: new Set(),
  totalJoins: 0,
  totalFeedbacks: 0,
};

export const trackActiveUser = (userId) => {
  analytics.activeUsers.add(userId);
};

export const incrementJoins = () => {
  analytics.totalJoins += 1;
};

export const incrementFeedbacks = () => {
  analytics.totalFeedbacks += 1;
};

export const getAnalytics = () => {
  return {
    activeUsers: analytics.activeUsers.size,
    totalJoins: analytics.totalJoins,
    totalFeedbacks: analytics.totalFeedbacks,
  };
};
