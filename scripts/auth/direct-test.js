/**
 * Simple script to directly test the refresh token endpoint
 */

const axios = require('axios');
const https = require('https');
const http = require('http');

// Configuration
const API_URL = 'http://localhost:3001';

async function testRefreshEndpoint() {
  console.log('Testing refresh token endpoint directly...');
  
  // Let's try with two different property names to see which one works
  const mockToken = 'mock_refresh_token_1_' + Date.now();
  
  try {
    console.log('Attempt 1: Using { refreshToken }');
    const requestConfig = {
      method: 'post',
      url: `${API_URL}/auth/refresh`,
      headers: { 'Content-Type': 'application/json' },
      data: { refreshToken: mockToken }
    };
    
    console.log('Request config:', JSON.stringify(requestConfig, null, 2));
    
    const response1 = await axios(requestConfig);
    
    console.log('Response status:', response1.status);
    console.log('Response data:', response1.data);
    return true;
  } catch (error) {
    console.error('Error with { refreshToken }:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    }
    
    // Try a direct HTTP request as a last resort
    return new Promise((resolve, reject) => {
      console.log('\nAttempt 2: Using direct HTTP request');
      
      const data = JSON.stringify({ refreshToken: mockToken });
      
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/auth/refresh',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      
      console.log('HTTP request options:', JSON.stringify(options, null, 2));
      console.log('HTTP request data:', data);
      
      const req = http.request(options, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            console.log('Response data:', parsed);
            resolve(true);
          } catch (e) {
            console.log('Raw response:', responseData);
            resolve(false);
          }
        });
      });
      
      req.on('error', (e) => {
        console.error('HTTP request error:', e.message);
        resolve(false);
      });
      
      req.write(data);
      req.end();
    });
  }
}

// Run the test
testRefreshEndpoint(); 