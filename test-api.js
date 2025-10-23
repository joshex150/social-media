// Test script for Link Up API
const API_BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

const testActivity = {
  title: 'Test Activity',
  description: 'This is a test activity',
  category: 'social',
  location: {
    name: 'Test Location',
    latitude: 40.7128,
    longitude: -74.0060,
    address: 'New York, NY'
  },
  date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  duration: 60,
  maxParticipants: 10,
  radius: 5,
  tags: ['test', 'social']
};

let authToken = '';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ API request failed: ${error.message}`);
    throw error;
  }
}

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing health check...');
  try {
    const response = await apiRequest('/health');
    console.log('✅ Health check passed:', response.message);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('👤 Testing user registration...');
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser),
    });
    
    if (response.success) {
      authToken = response.data.token;
      console.log('✅ User registration successful');
      return true;
    } else {
      console.log('❌ User registration failed:', response.message);
      return false;
    }
  } catch (error) {
    console.log('❌ User registration failed:', error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('🔐 Testing user login...');
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });
    
    if (response.success) {
      authToken = response.data.token;
      console.log('✅ User login successful');
      return true;
    } else {
      console.log('❌ User login failed:', response.message);
      return false;
    }
  } catch (error) {
    console.log('❌ User login failed:', error.message);
    return false;
  }
}

async function testGetCurrentUser() {
  console.log('👤 Testing get current user...');
  try {
    const response = await apiRequest('/auth/me');
    if (response.success) {
      console.log('✅ Get current user successful');
      return true;
    } else {
      console.log('❌ Get current user failed:', response.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Get current user failed:', error.message);
    return false;
  }
}

async function testCreateActivity() {
  console.log('🎯 Testing create activity...');
  try {
    const response = await apiRequest('/activities', {
      method: 'POST',
      body: JSON.stringify(testActivity),
    });
    
    if (response.success) {
      console.log('✅ Create activity successful');
      return response.data.activity.id;
    } else {
      console.log('❌ Create activity failed:', response.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Create activity failed:', error.message);
    return null;
  }
}

async function testGetActivities() {
  console.log('📋 Testing get activities...');
  try {
    const response = await apiRequest('/activities');
    if (response.success) {
      console.log(`✅ Get activities successful (${response.data.activities.length} activities)`);
      return true;
    } else {
      console.log('❌ Get activities failed:', response.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Get activities failed:', error.message);
    return false;
  }
}

async function testGetActivity(activityId) {
  console.log('🎯 Testing get single activity...');
  try {
    const response = await apiRequest(`/activities/${activityId}`);
    if (response.success) {
      console.log('✅ Get single activity successful');
      return true;
    } else {
      console.log('❌ Get single activity failed:', response.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Get single activity failed:', error.message);
    return false;
  }
}

async function testGetSubscriptionTiers() {
  console.log('💳 Testing get subscription tiers...');
  try {
    const response = await apiRequest('/subscription/tiers');
    if (response.success) {
      console.log(`✅ Get subscription tiers successful (${response.data.tiers.length} tiers)`);
      return true;
    } else {
      console.log('❌ Get subscription tiers failed:', response.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Get subscription tiers failed:', error.message);
    return false;
  }
}

async function testGetNotifications() {
  console.log('🔔 Testing get notifications...');
  try {
    const response = await apiRequest('/notifications');
    if (response.success) {
      console.log(`✅ Get notifications successful (${response.data.notifications.length} notifications)`);
      return true;
    } else {
      console.log('❌ Get notifications failed:', response.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Get notifications failed:', error.message);
    return false;
  }
}

async function testGetChats() {
  console.log('💬 Testing get chats...');
  try {
    const response = await apiRequest('/chat');
    if (response.success) {
      console.log(`✅ Get chats successful (${response.data.chats.length} chats)`);
      return true;
    } else {
      console.log('❌ Get chats failed:', response.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Get chats failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Link Up API Tests...\n');
  
  const results = {
    healthCheck: false,
    registration: false,
    login: false,
    getCurrentUser: false,
    createActivity: false,
    getActivities: false,
    getActivity: false,
    getSubscriptionTiers: false,
    getNotifications: false,
    getChats: false,
  };

  let activityId = null;

  // Run tests
  results.healthCheck = await testHealthCheck();
  console.log('');

  results.registration = await testUserRegistration();
  console.log('');

  if (!results.registration) {
    results.login = await testUserLogin();
    console.log('');
  }

  if (authToken) {
    results.getCurrentUser = await testGetCurrentUser();
    console.log('');

    results.createActivity = await testCreateActivity();
    if (results.createActivity) {
      activityId = results.createActivity;
    }
    console.log('');

    results.getActivities = await testGetActivities();
    console.log('');

    if (activityId) {
      results.getActivity = await testGetActivity(activityId);
      console.log('');
    }

    results.getSubscriptionTiers = await testGetSubscriptionTiers();
    console.log('');

    results.getNotifications = await testGetNotifications();
    console.log('');

    results.getChats = await testGetChats();
    console.log('');
  }

  // Print results
  console.log('📊 Test Results:');
  console.log('================');
  
  const testNames = {
    healthCheck: 'Health Check',
    registration: 'User Registration',
    login: 'User Login',
    getCurrentUser: 'Get Current User',
    createActivity: 'Create Activity',
    getActivities: 'Get Activities',
    getActivity: 'Get Single Activity',
    getSubscriptionTiers: 'Get Subscription Tiers',
    getNotifications: 'Get Notifications',
    getChats: 'Get Chats',
  };

  let passedTests = 0;
  let totalTests = 0;

  Object.entries(results).forEach(([test, passed]) => {
    totalTests++;
    if (passed) passedTests++;
    console.log(`${passed ? '✅' : '❌'} ${testNames[test]}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  console.log('\n📈 Summary:');
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! The API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the API server and database.');
  }
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

module.exports = { runTests };
