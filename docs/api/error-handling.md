# API Error Handling

This document outlines the standard error handling patterns used throughout the Web Engine Platform API, helping developers understand and handle errors consistently.

## Error Response Format

All API errors follow a consistent JSON format:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "The request contains invalid parameters",
  "details": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ],
  "timestamp": "2023-04-15T08:30:45.123Z",
  "path": "/api/v1/users",
  "requestId": "req_12345abcde"
}
```

### Error Properties

| Property   | Type            | Description                                              |
|------------|-----------------|----------------------------------------------------------|
| status     | number          | HTTP status code                                         |
| code       | string          | Unique error code for programmatic handling              |
| message    | string          | Human-readable error description                         |
| details    | array (optional)| Additional context about the error                       |
| timestamp  | string          | ISO 8601 timestamp of when the error occurred            |
| path       | string          | The API endpoint path that generated the error           |
| requestId  | string          | Unique identifier for the request (for support purposes) |

## HTTP Status Codes

The API uses standard HTTP status codes to indicate the success or failure of requests:

| Status Code | Category        | Description                                              |
|-------------|-----------------|----------------------------------------------------------|
| 200         | Success         | Request succeeded                                        |
| 201         | Success         | Resource created successfully                            |
| 204         | Success         | Request succeeded, no content returned                   |
| 400         | Client Error    | Bad request or validation error                          |
| 401         | Client Error    | Authentication required or failed                        |
| 403         | Client Error    | Permission denied                                        |
| 404         | Client Error    | Resource not found                                       |
| 409         | Client Error    | Resource conflict                                        |
| 422         | Client Error    | Unprocessable entity                                     |
| 429         | Client Error    | Too many requests (rate limiting)                        |
| 500         | Server Error    | Internal server error                                    |
| 502         | Server Error    | Bad gateway                                              |
| 503         | Server Error    | Service unavailable                                      |

## Error Codes

The API uses specific error codes to help identify the exact nature of errors:

### Authentication Errors (401, 403)

| Code                 | Description                                         |
|----------------------|-----------------------------------------------------|
| INVALID_CREDENTIALS  | Username/email or password is incorrect             |
| TOKEN_EXPIRED        | JWT has expired                                     |
| INVALID_TOKEN        | JWT is malformed or signature is invalid            |
| TOKEN_REVOKED        | JWT has been revoked                                |
| REFRESH_EXPIRED      | Refresh token has expired                           |
| INSUFFICIENT_SCOPE   | Token doesn't have required permissions             |
| 2FA_REQUIRED         | Two-factor authentication is required               |
| 2FA_INVALID          | Invalid 2FA code provided                           |
| ACCOUNT_LOCKED       | Account is locked due to too many failed attempts   |

### Validation Errors (400)

| Code                 | Description                                         |
|----------------------|-----------------------------------------------------|
| VALIDATION_ERROR     | Request contains invalid data                       |
| MISSING_REQUIRED     | Required field is missing                           |
| INVALID_FORMAT       | Field format is invalid                             |
| INVALID_EMAIL        | Email address is invalid                            |
| INVALID_PASSWORD     | Password doesn't meet the requirements              |
| FILE_TOO_LARGE       | Uploaded file exceeds maximum allowed size          |
| UNSUPPORTED_FORMAT   | File format is not supported                        |

### Resource Errors (404, 409)

| Code                 | Description                                         |
|----------------------|-----------------------------------------------------|
| RESOURCE_NOT_FOUND   | Requested resource does not exist                   |
| DUPLICATE_RESOURCE   | Resource already exists                             |
| RESOURCE_CONFLICT    | Operation would cause a conflict with existing data |
| RESOURCE_DELETED     | Resource has been deleted                           |

### Rate Limiting Errors (429)

| Code                 | Description                                         |
|----------------------|-----------------------------------------------------|
| RATE_LIMIT_EXCEEDED  | Too many requests in a given time period            |
| QUOTA_EXCEEDED       | API usage quota has been exceeded                   |

### Server Errors (500, 502, 503)

| Code                 | Description                                         |
|----------------------|-----------------------------------------------------|
| INTERNAL_ERROR       | Unexpected server error                             |
| SERVICE_UNAVAILABLE  | Service is temporarily unavailable                  |
| DATABASE_ERROR       | Database operation failed                           |
| THIRD_PARTY_ERROR    | Error in third-party service                        |

## Handling Errors in Frontend Code

### Using RTK Query

```typescript
// src/features/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { setError } from '../error/errorSlice';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.webengineplatform.com/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.tokens?.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});

// Error handling middleware
export const errorHandlingMiddleware = (store: any) => (next: any) => (action: any) => {
  // Check if the action is a rejected RTK Query action
  if (action.type?.endsWith('/rejected') && action.payload) {
    const { status, data } = action.payload;
    
    // Handle specific error codes
    if (data?.code === 'TOKEN_EXPIRED') {
      // Trigger token refresh logic
      store.dispatch(refreshToken());
    } else if (status === 401 || status === 403) {
      // Handle authentication errors
      store.dispatch(setError({
        title: 'Authentication Error',
        message: data?.message || 'Please log in again to continue',
        code: data?.code || 'AUTH_ERROR'
      }));
    } else if (status === 429) {
      // Handle rate limiting
      store.dispatch(setError({
        title: 'Too Many Requests',
        message: 'Please try again later',
        code: data?.code || 'RATE_LIMIT_ERROR'
      }));
    } else if (status >= 500) {
      // Handle server errors
      store.dispatch(setError({
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        code: data?.code || 'SERVER_ERROR',
        supportId: data?.requestId
      }));
    }
  }
  
  return next(action);
};
```

### Using Axios

```typescript
// src/services/apiClient.ts
import axios, { AxiosError } from 'axios';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';
import { showErrorToast } from '../utils/toastUtils';

const apiClient = axios.create({
  baseURL: 'https://api.webengineplatform.com/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const response = error.response;
    
    if (response && response.data) {
      const errorData = response.data as any;
      
      // Handle specific status codes
      switch (response.status) {
        case 401:
          // Authentication error
          if (errorData.code === 'TOKEN_EXPIRED') {
            // Handle token expiration
            return refreshTokenAndRetry(error);
          } else {
            // Other auth errors
            store.dispatch(logout());
            showErrorToast('Session expired. Please log in again.');
          }
          break;
          
        case 403:
          // Authorization error
          showErrorToast('You don\'t have permission to perform this action');
          break;
          
        case 404:
          // Resource not found
          showErrorToast('The requested resource was not found');
          break;
          
        case 422:
          // Validation errors - show specific field errors
          if (errorData.details && Array.isArray(errorData.details)) {
            const messages = errorData.details.map((detail: any) => 
              `${detail.field}: ${detail.message}`
            ).join('\n');
            showErrorToast(`Validation error: ${messages}`);
          } else {
            showErrorToast(errorData.message || 'Validation error');
          }
          break;
          
        case 429:
          // Rate limiting
          showErrorToast('Too many requests. Please try again later.');
          break;
          
        case 500:
        case 502:
        case 503:
          // Server errors
          showErrorToast(
            'Something went wrong on our end. Please try again later.',
            `Reference ID: ${errorData.requestId || 'unknown'}`
          );
          // Log to error reporting service
          logErrorToService(errorData);
          break;
          
        default:
          // Default error handling
          showErrorToast(errorData.message || 'An error occurred');
      }
    } else {
      // Network error or other errors without response data
      showErrorToast('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

async function refreshTokenAndRetry(error: AxiosError) {
  try {
    // Get the refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      store.dispatch(logout());
      return Promise.reject(error);
    }
    
    // Try to get a new token
    const response = await axios.post(
      'https://api.webengineplatform.com/api/v1/auth/refresh',
      { refreshToken }
    );
    
    // Store the new tokens
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    // Retry the original request
    const config = error.config;
    if (!config) {
      return Promise.reject(error);
    }
    
    config.headers.Authorization = `Bearer ${accessToken}`;
    return axios(config);
  } catch (refreshError) {
    // If refresh fails, log out the user
    store.dispatch(logout());
    return Promise.reject(error);
  }
}

function logErrorToService(errorData: any) {
  // Implement integration with error reporting service like Sentry
  console.error('Server error:', errorData);
}

export default apiClient;
```

## Error Handling Guidelines

### Client-Side Best Practices

1. **Graceful Degradation**: Always provide fallback behavior when API calls fail
2. **Offline Support**: Cache critical data when possible and implement offline behavior
3. **Retry Logic**: Implement exponential backoff for transient errors
4. **Error Context**: Display meaningful error messages with actionable information
5. **Field-level Feedback**: Show validation errors next to the relevant form fields
6. **Debug Information**: Include request IDs in error reports to help support

Example of field-level validation errors:

```tsx
// src/components/UserForm.tsx
import React, { useState } from 'react';
import { useCreateUserMutation } from '../services/api';

const UserForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createUser, { isLoading }] = useCreateUserMutation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    
    try {
      await createUser(formData).unwrap();
      // Handle success
    } catch (err: any) {
      // Handle API errors
      if (err.data?.details) {
        // Transform API field errors to state
        const errors: Record<string, string> = {};
        err.data.details.forEach((detail: any) => {
          errors[detail.field] = detail.message;
        });
        setFieldErrors(errors);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
        />
        {fieldErrors.username && (
          <p className="error">{fieldErrors.username}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        {fieldErrors.email && (
          <p className="error">{fieldErrors.email}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        {fieldErrors.password && (
          <p className="error">{fieldErrors.password}</p>
        )}
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
};

export default UserForm;
```

## Troubleshooting Common Errors

### Authentication Issues

- **INVALID_CREDENTIALS**: Check username/email and password
- **TOKEN_EXPIRED**: The session has timed out; log in again
- **ACCOUNT_LOCKED**: Too many failed login attempts; wait or contact support

### API Usage Issues

- **RATE_LIMIT_EXCEEDED**: Implement request throttling or batching
- **QUOTA_EXCEEDED**: Upgrade subscription plan or optimize API usage

### Network Issues

- **Request Timeouts**: Check connection and API service status
- **CORS Errors**: Verify that the API allows requests from your domain

### Submission Issues

- **VALIDATION_ERROR**: Check form fields for invalid entries
- **DUPLICATE_RESOURCE**: The resource already exists (e.g., email already registered)

## Error Support and Debugging

When contacting support about API errors, always include:

1. The request ID from the error response
2. Timestamp of the error
3. The API endpoint and HTTP method used
4. Any request parameters (sanitized of sensitive information)
5. The complete error response

### Logging Best Practices

```typescript
// Structured error logging
function logApiError(error: any, context?: Record<string, any>) {
  // Don't log sensitive information
  const sanitizedContext = { ...context };
  delete sanitizedContext.password;
  delete sanitizedContext.token;
  
  const errorData = {
    timestamp: new Date().toISOString(),
    errorCode: error.data?.code || 'UNKNOWN_ERROR',
    status: error.status,
    message: error.data?.message || error.message,
    requestId: error.data?.requestId,
    path: error.data?.path,
    context: sanitizedContext
  };
  
  // Log to your logging system
  console.error('API Error:', errorData);
  
  // Send to error tracking service if it's a server error
  if (error.status >= 500) {
    // Example with Sentry
    // Sentry.captureException(new Error(errorData.message), {
    //   extra: errorData
    // });
  }
} 