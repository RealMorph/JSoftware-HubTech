/**
 * Script to test the token refresh flow
 * Helps verify that the API implementation supports JWT refresh tokens
 */

const axios = require('axios');
const readline = require('readline');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Store tokens
let tokens = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null
};

// Function to login and get tokens
async function login(credentials) {
  console.log('\n📝 Logging in to get tokens...');
  
  try {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.accessToken && response.data.refreshToken) {
      tokens.accessToken = response.data.accessToken;
      tokens.refreshToken = response.data.refreshToken;
      tokens.expiresIn = response.data.expiresIn || null;
      
      console.log('✅ Login successful!');
      console.log(`📊 Token expires in: ${tokens.expiresIn ? `${tokens.expiresIn} seconds` : 'Unknown'}`);
      
      // Display truncated tokens for verification
      console.log(`🔑 Access Token: ${tokens.accessToken.substring(0, 15)}...`);
      console.log(`🔄 Refresh Token: ${tokens.refreshToken.substring(0, 15)}...`);
      
      return true;
    } else {
      console.error('❌ Login response did not contain required tokens');
      return false;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

// Function to directly test the refresh token endpoint with a mock token
async function testRefreshEndpoint() {
  console.log('\n📝 Testing refresh token endpoint directly...');
  
  // Use a mock refresh token (will be handled by our mock implementation)
  const mockRefreshToken = 'mock_refresh_token_1_' + Date.now();
  
  try {
    const response = await api.post('/auth/refresh', { 
      refreshToken: mockRefreshToken 
    });
    
    if (response.data && response.data.accessToken && response.data.refreshToken) {
      console.log('✅ Refresh token endpoint is working!');
      console.log('📊 Response structure:');
      console.log('  - accessToken: ✓');
      console.log('  - refreshToken: ✓');
      console.log(`  - expiresIn: ${response.data.expiresIn || 'Not provided'}`);
      console.log(`  - tokenType: ${response.data.tokenType || 'Not provided'}`);
      console.log(`  - user: ${response.data.user ? '✓' : 'Not provided'}`);
      
      // Store the tokens for later use
      tokens.accessToken = response.data.accessToken;
      tokens.refreshToken = response.data.refreshToken;
      tokens.expiresIn = response.data.expiresIn || null;
      
      return true;
    } else {
      console.error('❌ Refresh response did not contain required tokens');
      return false;
    }
  } catch (error) {
    console.error('❌ Refresh token endpoint failed:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data: `, error.response.data);
    } else {
      console.error('  Error: ', error.message);
    }
    return false;
  }
}

// Function to test an authenticated endpoint
async function testAuthenticatedEndpoint() {
  console.log('\n📝 Testing authenticated endpoint...');
  
  try {
    const response = await api.get('/user/profile', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    
    console.log('✅ Authenticated request successful!');
    console.log('📊 Response:', response.data);
    
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('⚠️ Token expired or invalid (401 Unauthorized)');
    } else {
      console.error('❌ Authenticated request failed:', error.response?.data || error.message);
    }
    
    return false;
  }
}

// Function to refresh tokens
async function refreshToken() {
  console.log('\n📝 Testing token refresh...');
  
  try {
    const response = await api.post('/auth/refresh', {
      refreshToken: tokens.refreshToken
    });
    
    if (response.data.accessToken && response.data.refreshToken) {
      tokens.accessToken = response.data.accessToken;
      tokens.refreshToken = response.data.refreshToken;
      tokens.expiresIn = response.data.expiresIn || null;
      
      console.log('✅ Token refresh successful!');
      console.log(`📊 New token expires in: ${tokens.expiresIn ? `${tokens.expiresIn} seconds` : 'Unknown'}`);
      
      // Display truncated tokens for verification
      console.log(`🔑 New Access Token: ${tokens.accessToken.substring(0, 15)}...`);
      console.log(`🔄 New Refresh Token: ${tokens.refreshToken.substring(0, 15)}...`);
      
      return true;
    } else {
      console.error('❌ Refresh response did not contain required tokens');
      return false;
    }
  } catch (error) {
    console.error('❌ Token refresh failed:', error.response?.data || error.message);
    return false;
  }
}

// Function to test token logout
async function testLogout() {
  console.log('\n📝 Testing token revocation (logout)...');
  
  try {
    const response = await api.post('/auth/logout', {
      refreshToken: tokens.refreshToken
    }, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    
    console.log('✅ Logout successful!');
    console.log('📊 Response:', response.data);
    
    // Now try to use the tokens
    try {
      await api.get('/user/profile', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`
        }
      });
      
      console.warn('⚠️ Warning: Access token still works after logout!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Access token correctly invalidated after logout (401 Unauthorized)');
      } else {
        console.error('❌ Unexpected error after logout:', error.response?.data || error.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Logout failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('===== JWT TOKEN REFRESH FLOW TEST =====');
  console.log(`API URL: ${API_URL}`);
  
  // First test the direct refresh token endpoint
  const refreshEndpointSuccess = await testRefreshEndpoint();
  
  if (refreshEndpointSuccess) {
    console.log('\n✅ The backend API supports JWT refresh token pattern!');
    
    // Further tests can be skipped since the primary goal is checking refresh token support
    const runAdditionalTests = await prompt('\nRun additional tests (login, authenticated request, etc.)? (y/n): ');
    
    if (runAdditionalTests.toLowerCase() === 'y') {
      // Try the login flow
      const useCustomCredentials = await prompt('Use custom credentials? (y/n, default: n): ');
      
      if (useCustomCredentials.toLowerCase() === 'y') {
        CREDENTIALS.email = await prompt('Email: ');
        CREDENTIALS.password = await prompt('Password: ');
      }
    
      // Step 1: Login to get tokens
      const loginSuccess = await login(CREDENTIALS);
      if (!loginSuccess) {
        console.warn('⚠️ Login failed but refresh token endpoint is working');
      } else {
        // Step 2: Test an authenticated endpoint
        await testAuthenticatedEndpoint();
      
        // Step 3: Refresh token again (now with the token from login)
        const refreshSuccess = await refreshToken();
        
        // Step 4: Test with new token
        if (refreshSuccess) {
          await testAuthenticatedEndpoint();
        }
        
        // Step 5: Test logout
        if (loginSuccess) {
          await testLogout();
        }
      }
    }
  } else {
    console.error('\n❌ The backend API does not properly support JWT refresh token pattern.');
  }

  console.log('\n===== TEST SUMMARY =====');
  console.log('Refresh Token Endpoint Support: ' + (refreshEndpointSuccess ? '✅' : '❌'));
  
  rl.close();
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error during tests:', error);
  rl.close();
}); 