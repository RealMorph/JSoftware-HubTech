# Authentication System Usage Guide

This document outlines how to properly use the authentication system in our application. The authentication system is built with security best practices and provides a robust way to handle user authentication, token management, and protected routes.

## Core Components

The authentication system consists of several key components:

1. **AuthProvider** - React context provider for authentication state
2. **TokenService** - Service for secure token management
3. **AuthService** - Service handling authentication operations
4. **ApiClient** - HTTP client with automatic token refresh
5. **ProtectedRoute** - Component for securing routes
6. **Authentication UI Components** - Login, Register, Password Reset forms

## Using Authentication in Components

### 1. Access Authentication State with `useAuth` Hook

The `useAuth` hook is the recommended way to access authentication state and methods in your components.

```tsx
import { useAuth } from '../core/auth/AuthProvider';

const MyComponent = () => {
  const { 
    user,                // The current authenticated user (null if not authenticated)
    isAuthenticated,     // Boolean flag indicating if user is authenticated
    isLoading,           // Boolean flag indicating if auth state is being loaded
    login,               // Function to log in a user
    register,            // Function to register a new user
    logout,              // Function to log out the current user
    resetPassword        // Function to request a password reset
  } = useAuth();

  // Example usage
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <button onClick={logout}>Log Out</button>
    </div>
  ) : (
    <div>
      <h1>Please log in</h1>
      <button onClick={() => navigate('/login')}>Log In</button>
    </div>
  );
};
```

### 2. Securing Routes

Use the `ProtectedRoute` component to secure routes that require authentication:

```tsx
// In your Router component
import { ProtectedRoute } from '../core/auth/ProtectedRoute';

// ...

<Routes>
  {/* Public routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* Protected routes */}
  <Route 
    path="/dashboard" 
    element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    } 
  />
  
  {/* Protected routes with permission requirements */}
  <Route 
    path="/admin" 
    element={
      <ProtectedRoute requiredPermissions={['admin:access']}>
        <AdminPage />
      </ProtectedRoute>
    } 
  />
</Routes>
```

### 3. Implementing Login Functionality

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthProvider';

const LoginComponent = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };
  
  // Render login form
};
```

### 4. Handling User Registration

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthProvider';

const RegisterComponent = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    // Other required fields
  });
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      await register(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };
  
  // Render registration form
};
```

## Best Practices

### 1. Never Access Tokens Directly

Always use the TokenService to access tokens - never use localStorage directly:

```tsx
// INCORRECT - Don't do this!
const token = localStorage.getItem('token');

// CORRECT - Do this instead
import { TokenService } from '../core/auth/token-service';
const token = TokenService.getAccessToken();
```

### 2. Always Use the AuthProvider Context

Avoid creating multiple instances of the AuthService directly in components:

```tsx
// INCORRECT - Don't do this!
import { AuthService } from '../core/auth/auth-service';
const authService = new AuthService();
const isLoggedIn = authService.isAuthenticated();

// CORRECT - Do this instead
import { useAuth } from '../core/auth/AuthProvider';
const { isAuthenticated } = useAuth();
```

### 3. Handle Loading States

Always handle loading states in components using authentication:

```tsx
const { isLoading, isAuthenticated } = useAuth();

if (isLoading) {
  return <Spinner />;
}

return isAuthenticated ? <AuthenticatedContent /> : <UnauthenticatedContent />;
```

### 4. Redirect After Authentication Events

After login, registration, or logout, use the router to redirect users:

```tsx
const navigate = useNavigate();

// After login/registration
await login(credentials);
navigate('/dashboard');

// After logout
await logout();
navigate('/login');
```

## Security Considerations

1. **Access Tokens** are stored in memory only (not localStorage) for improved security.
2. **Refresh Tokens** are stored in localStorage (in production, these should be HTTP-only cookies).
3. **Automatic Token Refresh** happens in the background before tokens expire.
4. **Failed Token Refresh** results in automatic logout.
5. **Login State** is checked on application load to restore authenticated sessions.

## Troubleshooting

### "Token expired" errors
This should be handled automatically by the ApiClient. If you see these errors:
1. Check that the ApiClient is being used for all API calls
2. Verify the refresh token endpoint is working properly
3. Check that token expiration detection is working correctly

### Authentication state lost on page refresh
1. Ensure AuthProvider is initializing properly
2. Check that tokens are being properly stored
3. Verify TokenService can retrieve the tokens correctly

### "Unauthorized" redirect loops
1. Check the isAuthenticated logic in the AuthService
2. Verify the token validation is working correctly
3. Ensure the ProtectedRoute component is checking auth state properly 