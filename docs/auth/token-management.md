# Token Management System

This document provides an overview of how authentication tokens are managed in our application, focusing on the `TokenService` implementation, token lifecycle, and best practices for working with tokens.

## Overview

Our application implements a JWT-based authentication system with two types of tokens:

1. **Access Tokens**: Short-lived tokens used to authenticate API requests
2. **Refresh Tokens**: Longer-lived tokens used to obtain new access tokens

This separation follows security best practices by limiting the exposure of the access token while providing a seamless user experience through automatic token refresh.

## TokenService

The `TokenService` is a singleton class that centralizes all token-related operations. It implements the following features:

- In-memory storage for access tokens
- Secure storage for refresh tokens
- Token validation and expiration checking
- Token parsing and payload extraction

### API Reference

```typescript
class TokenService {
  // Core token operations
  static setAccessToken(token: string): void;
  static getAccessToken(): string | null;
  static setRefreshToken(token: string): void;
  static getRefreshToken(): string | null;
  static clearTokens(): void;
  
  // Token validation
  static isTokenExpired(token: string): boolean;
  static hasValidAccessToken(): boolean;
  static hasValidRefreshToken(): boolean;
  
  // Token parsing
  static parseJwt(token: string): any;
  static getTokenPayload(token: string): any;
  static getAccessTokenPayload(): any;
  
  // User info from tokens
  static getUserIdFromToken(): string | null;
  static getRolesFromToken(): string[] | null;
}
```

### Storage Mechanism

- **Access Tokens**: Stored in-memory (a static class property)
- **Refresh Tokens**: Stored in localStorage with appropriate key

```typescript
// Implementation details (simplified)
class TokenService {
  private static accessToken: string | null = null;
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  
  static setAccessToken(token: string): void {
    this.accessToken = token;
  }
  
  static getAccessToken(): string | null {
    return this.accessToken;
  }
  
  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }
  
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  static clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}
```

## Token Lifecycle

### Authentication Flow

1. User logs in with credentials
2. Server validates credentials and returns access and refresh tokens
3. `TokenService` stores the tokens
4. API requests include the access token
5. When the access token expires, the refresh token is used to obtain new tokens
6. On logout, both tokens are cleared

```typescript
// Example login flow
async function login(email: string, password: string) {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken, refreshToken } = response.data;
    
    TokenService.setAccessToken(accessToken);
    TokenService.setRefreshToken(refreshToken);
    
    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}
```

### Token Refresh

The token refresh happens automatically when the API client receives a 401 Unauthorized response, indicating the access token has expired:

```typescript
// Simplified refresh flow
async function refreshTokens() {
  const refreshToken = TokenService.getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    TokenService.setAccessToken(accessToken);
    TokenService.setRefreshToken(newRefreshToken);
    
    return true;
  } catch (error) {
    TokenService.clearTokens();
    throw new Error('Failed to refresh tokens');
  }
}
```

### Token Expiration

The `TokenService` can check if a token is expired by decoding the JWT and comparing the expiration time with the current time:

```typescript
static isTokenExpired(token: string): boolean {
  try {
    const payload = this.parseJwt(token);
    const expirationTime = payload.exp * 1000; // Convert seconds to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    return true; // If there's an error parsing, consider the token expired
  }
}
```

## Integration with API Client

The API client automatically includes the access token in all requests:

```typescript
// API client setup with token handling
apiClient.interceptors.request.use(config => {
  const token = TokenService.getAccessToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle token refresh on 401 responses
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await authService.refreshTokens();
        
        // Update authorization header with new token
        originalRequest.headers.Authorization = 
          `Bearer ${TokenService.getAccessToken()}`;
          
        // Retry the original request with the new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        TokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## Testing Tokens

When testing token functionality, it's important to reset the token state between tests:

```typescript
// Example test setup
beforeEach(() => {
  TokenService.clearTokens();
});

test('should store and retrieve access token', () => {
  const token = 'test-access-token';
  TokenService.setAccessToken(token);
  expect(TokenService.getAccessToken()).toBe(token);
});

test('should validate token expiration', () => {
  // Create a token that's already expired
  const payload = { exp: Math.floor(Date.now() / 1000) - 3600 }; // 1 hour ago
  const token = `header.${btoa(JSON.stringify(payload))}.signature`;
  
  expect(TokenService.isTokenExpired(token)).toBe(true);
});
```

## Best Practices

### Do's

- Always use `TokenService` for all token-related operations
- Implement automatic token refresh in the API client
- Clear tokens on logout
- Use token validation before making important API calls
- Extract user information from tokens when needed

### Don'ts

- Don't store access tokens in localStorage or cookies
- Don't implement token logic outside the `TokenService`
- Don't manually include tokens in API requests (let the interceptor handle it)
- Don't expose tokens in the UI or logs
- Don't ignore token expiration

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   
   Possible causes:
   - Access token has expired and refresh failed
   - Invalid or malformed token
   - Server rejected the token
   
   Resolution:
   - Check token expiration with `TokenService.isTokenExpired()`
   - Verify the token format
   - Check server logs for token validation errors

2. **Unexpected Logouts**
   
   Possible causes:
   - Refresh token has expired
   - Refresh token was invalidated by the server
   - Token storage was cleared
   
   Resolution:
   - Implement refresh token expiration monitoring
   - Add logging for token refresh operations
   - Check for unauthorized localStorage access

3. **Token Memory Leaks**
   
   Possible causes:
   - Token service not clearing tokens on logout
   - Multiple token services instances (should be a singleton)
   
   Resolution:
   - Ensure `TokenService.clearTokens()` is called on logout
   - Verify the singleton pattern is correctly implemented

## Conclusion

The token management system provides a secure and efficient way to handle authentication in our application. By centralizing token operations in the `TokenService` and implementing best practices for token storage and refresh, we maintain a high level of security while providing a seamless user experience. 