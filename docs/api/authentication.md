# Authentication System

This document provides detailed information about the authentication system used in the Web Engine Platform.

## Authentication Flows

This document details the authentication flows supported by the Web Engine Platform API, including token handling, security considerations, and implementation examples.

## Overview

The Web Engine Platform uses JWT (JSON Web Tokens) for authentication. The system implements a dual-token approach:

1. **Access Token**: Short-lived token (15 minutes) used for API authentication
2. **Refresh Token**: Long-lived token (7 days) used to obtain new access tokens

## Authentication Flow Diagram

```
┌─────────┐                                                 ┌─────────────┐
│  Client │                                                 │    Server   │
└────┬────┘                                                 └──────┬──────┘
     │                                                             │
     │  POST /auth/login or /auth/register                        │
     │  {email, password}                                         │
     │ ─────────────────────────────────────────────────────────► │
     │                                                             │
     │  200 OK                                                     │
     │  {accessToken, refreshToken, user}                          │
     │ ◄───────────────────────────────────────────────────────── │
     │                                                             │
     │  Store tokens                                               │
     │                                                             │
     │  Request with accessToken                                   │
     │  Authorization: Bearer {accessToken}                        │
     │ ─────────────────────────────────────────────────────────► │
     │                                                             │
     │  200 OK with data                                           │
     │ ◄───────────────────────────────────────────────────────── │
     │                                                             │
     │  When accessToken expires:                                  │
     │  POST /auth/refresh                                         │
     │  {refreshToken}                                             │
     │ ─────────────────────────────────────────────────────────► │
     │                                                             │
     │  200 OK                                                     │
     │  {accessToken, refreshToken}                                │
     │ ◄───────────────────────────────────────────────────────── │
     │                                                             │
     │  Store new tokens                                           │
     │                                                             │
     │  Request with new accessToken                               │
     │  Authorization: Bearer {new accessToken}                    │
     │ ─────────────────────────────────────────────────────────► │
```

## Token Structure

### Access Token

The access token is a JWT with the following claims:

```json
{
  "sub": "usr_123456789",
  "email": "user@example.com",
  "username": "user123",
  "roles": ["user"],
  "permissions": ["read:profile", "update:profile"],
  "iat": 1619011200,
  "exp": 1619012100,
  "iss": "webengineplatform.com",
  "jti": "abc123def456"
}
```

### Refresh Token

The refresh token is a JWT with minimal claims:

```json
{
  "sub": "usr_123456789",
  "jti": "xyz789pqr456",
  "iat": 1619011200,
  "exp": 1619617200,
  "iss": "webengineplatform.com"
}
```

## Implementing Authentication in Frontend

### Authentication Service

```typescript
// src/services/authService.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.webengineplatform.com/api/v1';

// Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
  firstName: string;
  lastName: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

// Token Storage
const storeTokens = (tokens: AuthTokens): void => {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const getStoredTokens = (): AuthTokens | null => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
  return null;
};

// Check if access token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
};

// Authentication API calls
export const login = async (credentials: LoginCredentials): Promise<AuthState> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { user, tokens } = response.data;
    
    storeTokens(tokens);
    
    return {
      user,
      tokens,
      isAuthenticated: true
    };
  } catch (error) {
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<AuthState> => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    const { user, tokens } = response.data;
    
    storeTokens(tokens);
    
    return {
      user,
      tokens,
      isAuthenticated: true
    };
  } catch (error) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  const tokens = getStoredTokens();
  
  if (tokens?.refreshToken) {
    try {
      await axios.post(`${API_URL}/auth/logout`, {
        refreshToken: tokens.refreshToken
      }, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`
        }
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  clearTokens();
};

export const refreshTokens = async (): Promise<AuthTokens> => {
  const tokens = getStoredTokens();
  
  if (!tokens?.refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: tokens.refreshToken
    });
    
    const newTokens = response.data;
    storeTokens(newTokens);
    return newTokens;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

// Create authenticated API instance with token refresh
export const createAuthenticatedApi = () => {
  const api = axios.create({
    baseURL: API_URL
  });
  
  api.interceptors.request.use(async (config) => {
    let tokens = getStoredTokens();
    
    if (!tokens) {
      return config;
    }
    
    // Check if access token is expired and refresh if needed
    if (isTokenExpired(tokens.accessToken)) {
      try {
        tokens = await refreshTokens();
      } catch (error) {
        // If refresh fails, clear tokens and continue without auth
        clearTokens();
        return config;
      }
    }
    
    // Add the access token to the request
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    return config;
  });
  
  return api;
};

// Initialize authenticated API
export const authApi = createAuthenticatedApi();
```

### Integration with Redux Toolkit

```typescript
// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  AuthState,
  LoginCredentials,
  RegisterData,
  getStoredTokens
} from '../../services/authService';

const initialState: AuthState & { loading: boolean; error: string | null } = {
  user: null,
  tokens: getStoredTokens(),
  isAuthenticated: !!getStoredTokens(),
  loading: false,
  error: null
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      return await loginApi(credentials);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      return await registerApi(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthState>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthState>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
```

### Protected Route Component

```tsx
// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectPath = '/login'
}) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
```

### Route Configuration

```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

## Security Considerations

### Token Storage

- Access and refresh tokens should be stored in memory when possible
- For persistence across sessions, use secure HttpOnly cookies or localStorage as a fallback
- Never store tokens in local storage for high-security applications

### CSRF Protection

- Implement anti-CSRF tokens for cookie-based authentication
- Use SameSite=Strict or SameSite=Lax cookies

### Token Revocation

Tokens can be revoked in the following ways:

1. Using a token blacklist on the server
2. Implementing token versioning
3. Using short expiration times for access tokens

### Multi-device Management

The API includes endpoints for managing active sessions:

- `GET /auth/sessions` - List all active sessions
- `DELETE /auth/sessions/:id` - Revoke a specific session
- `DELETE /auth/sessions` - Revoke all sessions except the current one

## Additional Authentication Features

### Two-Factor Authentication (2FA)

The Web Engine Platform supports TOTP-based two-factor authentication:

1. **Enable 2FA**:
   - `POST /auth/2fa/enable` - Initiates 2FA setup and returns TOTP secret
   - User registers the secret with an authenticator app
   - `POST /auth/2fa/verify` - Verifies the setup with a TOTP code

2. **Login with 2FA**:
   - `POST /auth/login` - Initial login with username/password
   - Response includes `requires2FA: true` flag
   - `POST /auth/2fa/validate` - Validate 2FA code and receive tokens

3. **Disable 2FA**:
   - `POST /auth/2fa/disable` - Requires password and TOTP code

### OAuth Integration

The platform supports authentication via:

- Google
- GitHub
- Microsoft

OAuth endpoints:

- `GET /auth/oauth/:provider` - Initiates OAuth flow
- `GET /auth/oauth/:provider/callback` - OAuth callback endpoint

### Social Login Example

```typescript
// Initiating social login
const initiateGoogleLogin = () => {
  window.location.href = `${API_URL}/auth/oauth/google`;
};

// Handling OAuth callback in your app
// This would be part of the component that handles the callback route
// (e.g., /oauth-callback)
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');
    
    if (error) {
      console.error('OAuth error:', error);
      navigate('/login');
    } else if (accessToken && refreshToken) {
      // Store tokens and update state
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Fetch user info
      fetchUserInfo(accessToken).then(user => {
        dispatch(setAuthenticated({ user, tokens: { accessToken, refreshToken } }));
        navigate('/dashboard');
      });
    }
  }, [location, navigate, dispatch]);
  
  return <div>Processing authentication...</div>;
};
```

## Common Authentication Errors

| Error Code           | HTTP Status | Description                                     | Solution                                        |
|----------------------|-------------|-------------------------------------------------|-------------------------------------------------|
| `INVALID_CREDENTIALS`| 401         | Email/password incorrect                        | Verify credentials and try again                |
| `TOKEN_EXPIRED`      | 401         | Access token has expired                        | Use refresh token to get a new access token     |
| `INVALID_TOKEN`      | 401         | Token is malformed or invalid                   | Re-authenticate to get new tokens               |
| `REFRESH_EXPIRED`    | 401         | Refresh token has expired                       | User must login again                           |
| `TOKEN_REVOKED`      | 401         | Token has been revoked                          | User must login again                           |
| `ACCOUNT_LOCKED`     | 403         | Too many failed login attempts                  | Wait for timeout or contact support             |
| `2FA_REQUIRED`       | 403         | Two-factor authentication required              | Complete 2FA verification                       |
| `2FA_INVALID`        | 401         | Invalid 2FA code provided                       | Enter the correct 2FA code                      | 