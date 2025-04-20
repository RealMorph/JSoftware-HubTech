# API Documentation

This documentation provides a comprehensive guide to the Web Engine Platform API architecture, authentication flows, and usage patterns.

## Table of Contents

1. [API Architecture](#api-architecture)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [API Endpoints](#api-endpoints)
5. [Using the API in Frontend Code](#using-the-api-in-frontend-code)

## API Architecture

The Web Engine Platform uses a RESTful API architecture built on HTTP and JSON. The API is organized around resources and uses standard HTTP methods to operate on these resources.

### API Base URL

- Development: `http://localhost:3001/api`
- Production: `https://api.webengineplatform.example.com`

### Request/Response Format

All requests and responses use JSON format unless otherwise specified (e.g., file uploads use `multipart/form-data`).

Example request:

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Example response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "username": "johndoe",
  "role": "user",
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-02T00:00:00Z"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. 

### Authentication Flow

1. **Login**: Client sends credentials to `/auth/login` and receives a JWT token
2. **Using the Token**: Client includes the token in the `Authorization` header of subsequent requests
3. **Token Refresh**: When the token expires, client uses `/auth/refresh` to get a new token
4. **Logout**: Client discards the token (no server endpoint needed)

### JWT Token Format

The authentication token is a Bearer token with the following format:

```
Authorization: Bearer <jwt_token>
```

### Token Lifetime

- Access Token: 30 minutes
- Refresh Token: 7 days (stored in HTTP-only cookie)

## Error Handling

API errors follow a consistent format:

```json
{
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "errors": {
    "field1": ["Error for field1"],
    "field2": ["Error1 for field2", "Error2 for field2"]
  }
}
```

### Common Error Codes

| Status Code | Description                                           |
|-------------|-------------------------------------------------------|
| 400         | Bad Request - Invalid input parameters                |
| 401         | Unauthorized - Authentication required or token invalid|
| 403         | Forbidden - Insufficient permissions                  |
| 404         | Not Found - Resource does not exist                   |
| 429         | Too Many Requests - Rate limit exceeded               |
| 500         | Internal Server Error - Something went wrong          |

## API Endpoints

The API is organized around the following resources:

- **Authentication**: User authentication and token management
- **Users**: User profile management
- **Projects**: Project resource management (create, read, update, delete)
- **Tasks**: Task management within projects
- **Comments**: Comments on tasks and projects
- **Notifications**: User notifications

For a complete list of endpoints with request/response schemas, see the [OpenAPI Specification](./openapi.yaml).

## Using the API in Frontend Code

The Web Engine Platform frontend uses RTK Query to interact with the API. This provides automatic caching, request deduplication, and optimistic updates.

### Base API Setup

The project uses a `baseApi` configuration in `src/core/state/rtk/api/baseApi.ts` which handles:

- Authentication headers
- Token refresh
- Error standardization

```typescript
// Example of the baseApi configuration
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth, // Custom query with auth handling
  endpoints: () => ({}),
  tagTypes: ['User', 'Project', 'Task', 'Comment', 'Notification'],
});
```

### API Service Example

Each API resource has its own service file that extends the base API:

```typescript
// Example of userApi.ts
import { baseApi, standardizeError } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query({
      query: () => '/users/me',
      transformErrorResponse: standardizeError,
      providesTags: ['User'],
    }),
    
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/me/profile',
        method: 'PATCH',
        body: data,
      }),
      transformErrorResponse: standardizeError,
      invalidatesTags: ['User'],
    }),
    
    // More endpoints...
  }),
});

export const {
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
} = userApi;
```

### Using the API Hooks in Components

```tsx
import React from 'react';
import { useGetCurrentUserQuery, useUpdateProfileMutation } from '../core/state/rtk/api/userApi';

const UserProfile = () => {
  const { data: user, isLoading, error } = useGetCurrentUserQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  
  const handleSubmit = async (profileData) => {
    try {
      await updateProfile(profileData).unwrap();
      // Success handling
    } catch (error) {
      // Error handling
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      {/* Profile form */}
    </div>
  );
};
```

## API Versioning

The API uses URL versioning when breaking changes are introduced. The current version is v1, which is implicit in the base URL.

Future versions will use an explicit version in the URL, such as `/api/v2/users`.

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are as follows:

- Authentication endpoints: 5 requests per minute
- Standard endpoints: 60 requests per minute

When rate limits are exceeded, the API will return a 429 status code with a `Retry-After` header indicating when the client should try again. 