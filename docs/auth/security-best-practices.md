# Authentication Security Best Practices

This document outlines the security best practices implemented in our authentication system, providing guidance for developers to maintain and extend the system securely.

## Token Management

### Access Tokens

- **In-memory Storage Only**: Access tokens are stored exclusively in memory (JavaScript variables) and never persisted to localStorage, sessionStorage, or cookies accessible via JavaScript.
  ```typescript
  // ✅ Correct implementation in TokenService
  private static accessToken: string | null = null;
  
  // ❌ Incorrect (never do this)
  localStorage.setItem('accessToken', token);
  ```

- **Short Expiration Time**: Access tokens have a short lifespan (typically 15-30 minutes) to minimize the impact of token theft.

- **Automatic Refresh**: The system automatically refreshes access tokens before they expire to maintain seamless user experience.

### Refresh Tokens

- **Secure Storage**: Refresh tokens are stored in localStorage but are rotated with each use to prevent token reuse if stolen.
  ```typescript
  // When storing refresh tokens (only)
  localStorage.setItem('refreshToken', refreshToken);
  ```

- **Longer Expiration**: Refresh tokens have a longer lifespan (typically 7-14 days) but are still limited to prevent indefinite access.

- **Invalidation on Logout**: All tokens are properly invalidated when the user logs out.
  ```typescript
  // In logout method
  TokenService.clearTokens();
  apiClient.post('/auth/logout', { refreshToken: TokenService.getRefreshToken() });
  ```

## Authentication API

### Secure Endpoints

- All authentication-related API endpoints must use HTTPS.
- The login endpoint should implement rate limiting to prevent brute force attacks.
- Failed login attempts should return generic error messages to prevent user enumeration.

### Token Refresh

- The refresh token endpoint should validate both the token's signature and its presence in the active tokens database.
- Each refresh operation should issue both a new access token and refresh token (token rotation).
- Previously used refresh tokens should be invalidated.

## Application Security

### Route Protection

- **Authenticated Routes**: Use the `ProtectedRoute` component to restrict access to authenticated users.
  ```tsx
  <ProtectedRoute path="/profile" element={<ProfilePage />} />
  ```

- **Permission-Based Access**: Use role-based protection for routes requiring specific permissions.
  ```tsx
  <ProtectedRoute 
    path="/admin" 
    element={<AdminPage />} 
    requiredRole="admin" 
  />
  ```

### React Context

- **Single Source of Truth**: The AuthContext provides a single source of truth for authentication state.

- **Memoized Values**: Context values are memoized to prevent unnecessary re-renders.
  ```tsx
  const authContextValue = React.useMemo(() => ({
    user,
    isAuthenticated,
    login,
    logout,
    // other methods...
  }), [user, isAuthenticated]);
  ```

### Error Handling

- **Graceful Degradation**: Authentication errors should be handled gracefully with appropriate user feedback.
  ```tsx
  try {
    await authService.login(credentials);
  } catch (error) {
    // Handle different error types
    if (error.code === 'auth/invalid-credentials') {
      setError('Invalid email or password');
    } else if (error.code === 'auth/too-many-requests') {
      setError('Too many login attempts. Please try again later.');
    } else {
      setError('An error occurred during login. Please try again.');
    }
  }
  ```

- **Session Expiration**: When a session expires, the user should be redirected to the login page with a friendly message.

## API Client

### Authorization Headers

- **Automatic Token Addition**: The API client automatically adds the authorization header to requests.
  ```typescript
  // In api-client.ts
  api.interceptors.request.use(config => {
    const token = TokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  ```

### Handling 401 Errors

- **Token Refresh**: When receiving a 401 error, the client should attempt to refresh the token and retry the request.
  ```typescript
  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      // If error is 401 and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Attempt to refresh the token
          await authService.refreshTokens();
          
          // Update the request with the new token
          originalRequest.headers.Authorization = 
            `Bearer ${TokenService.getAccessToken()}`;
            
          // Retry the original request
          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, redirect to login
          authService.logout();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
  ```

## Testing

### Unit Tests

- Test token management functions for proper storage and retrieval.
- Verify token expiration checks work correctly.
- Test that authentication state updates properly.

### Integration Tests

- Verify protected routes redirect unauthenticated users.
- Test the complete authentication flow from login to accessing protected resources.
- Verify proper error handling during authentication failures.

### Security Testing

- Verify that access tokens are not exposed in localStorage or cookies.
- Test token refresh functionality when access tokens expire.
- Validate that expired or invalid tokens are properly rejected.

## Development Guidelines

### Using Authentication in Components

- Always use the `useAuth` hook to access authentication state and methods.
  ```tsx
  const { user, isAuthenticated, login, logout } = useAuth();
  ```

- Never directly access localStorage for authentication tokens.

- Always handle loading and error states in authentication-dependent components.
  ```tsx
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  ```

### Adding New Authentication Features

- Any new authentication features must follow the existing token management pattern.
- New protected routes must use the `ProtectedRoute` component.
- All authentication-related API endpoints must implement appropriate security measures.

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [React Security Considerations](https://reactjs.org/docs/security.html) 