# API Endpoints

This document provides detailed information about the available API endpoints in the Web Engine Platform, including request/response examples.

## Base URL

All API endpoints are relative to:
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.webengineplatform.com/api/v1`

## Authentication Endpoints

### Register

Create a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "user123",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response (201 Created)**:
```json
{
  "user": {
    "id": "usr_123456789",
    "email": "user@example.com",
    "username": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2023-04-19T12:00:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email or username already exists

### Login

Authenticate a user and receive access and refresh tokens.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200 OK)**:
```json
{
  "user": {
    "id": "usr_123456789",
    "email": "user@example.com",
    "username": "user123",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid credentials

### Refresh Token

Refresh an expired access token.

- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Auth Required**: No (Requires refresh token)

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `400 Bad Request`: Missing refresh token
- `401 Unauthorized`: Invalid or expired refresh token

### Logout

Invalidate the current refresh token.

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (204 No Content)**:
```
(No content)
```

**Error Responses**:
- `400 Bad Request`: Missing refresh token
- `401 Unauthorized`: Invalid authentication

## User Endpoints

### Get Current User

Retrieve the authenticated user's profile.

- **URL**: `/users/me`
- **Method**: `GET`
- **Auth Required**: Yes

**Success Response (200 OK)**:
```json
{
  "id": "usr_123456789",
  "email": "user@example.com",
  "username": "user123",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Software developer passionate about web technology",
  "avatar": "https://assets.webengineplatform.com/avatars/usr_123456789.jpg",
  "createdAt": "2023-04-19T12:00:00Z",
  "updatedAt": "2023-04-19T12:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid authentication

### Get User by ID

Retrieve a user's public profile by ID.

- **URL**: `/users/:id`
- **Method**: `GET`
- **Auth Required**: Yes

**Success Response (200 OK)**:
```json
{
  "id": "usr_123456789",
  "username": "user123",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Software developer passionate about web technology",
  "avatar": "https://assets.webengineplatform.com/avatars/usr_123456789.jpg"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: User not found

### Update Profile

Update the authenticated user's profile.

- **URL**: `/users/me/profile`
- **Method**: `PATCH`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Full-stack developer with 5 years of experience"
}
```

**Success Response (200 OK)**:
```json
{
  "id": "usr_123456789",
  "email": "user@example.com",
  "username": "user123",
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Full-stack developer with 5 years of experience",
  "avatar": "https://assets.webengineplatform.com/avatars/usr_123456789.jpg",
  "updatedAt": "2023-04-20T15:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication

### Update User Preferences

Update the authenticated user's preferences.

- **URL**: `/users/me/preferences`
- **Method**: `PATCH`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "theme": "dark",
  "notifications": {
    "email": true,
    "push": false,
    "inApp": true
  },
  "language": "en-US"
}
```

**Success Response (200 OK)**:
```json
{
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false,
      "inApp": true
    },
    "language": "en-US"
  },
  "updatedAt": "2023-04-20T15:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication

### Change Password

Change the authenticated user's password.

- **URL**: `/users/me/password`
- **Method**: `PUT`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "currentPassword": "securePassword123",
  "newPassword": "evenMoreSecure456"
}
```

**Success Response (204 No Content)**:
```
(No content)
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Current password is incorrect

### Upload Avatar

Upload a new avatar image for the authenticated user.

- **URL**: `/users/me/avatar`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`

**Request Body**:
```
Form data with field "avatar" containing image file
```

**Success Response (200 OK)**:
```json
{
  "avatar": "https://assets.webengineplatform.com/avatars/usr_123456789.jpg",
  "updatedAt": "2023-04-20T15:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid file format or size
- `401 Unauthorized`: Missing or invalid authentication

### Delete Account

Delete the authenticated user's account.

- **URL**: `/users/me`
- **Method**: `DELETE`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "password": "securePassword123"
}
```

**Success Response (204 No Content)**:
```
(No content)
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Password is incorrect

## Using Endpoints with RTK Query

### Example: User API Implementation

```typescript
import { baseApi, standardizeError } from './baseApi';

// Define types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
}

// Define the API
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => '/users/me',
      transformErrorResponse: standardizeError,
      providesTags: ['User']
    }),
    
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: '/users/me/profile',
        method: 'PATCH',
        body: data
      }),
      transformErrorResponse: standardizeError,
      invalidatesTags: ['User']
    }),
    
    // Other endpoints...
  })
});

// Export hooks for use in components
export const {
  useGetCurrentUserQuery,
  useUpdateProfileMutation
} = userApi;
```

### Example: Using the API in Components

```tsx
import React, { useState } from 'react';
import { useGetCurrentUserQuery, useUpdateProfileMutation } from '../api/userApi';

const UserProfile = () => {
  const { data: user, isLoading, error } = useGetCurrentUserQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: ''
  });
  
  // Update form when user data is loaded
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || ''
      });
    }
  }, [user]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData).unwrap();
      // Show success message
    } catch (error) {
      // Handle error
      console.error('Failed to update profile:', error);
    }
  };
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading profile</p>;
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
      />
      <textarea
        placeholder="Bio"
        value={formData.bio}
        onChange={(e) => setFormData({...formData, bio: e.target.value})}
      />
      <button type="submit" disabled={isUpdating}>
        {isUpdating ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
};
``` 