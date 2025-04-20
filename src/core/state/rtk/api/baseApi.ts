/**
 * Base API configuration for RTK Query
 * This module sets up a base API with authentication, error handling, and token refresh
 */

// Import from our custom type declarations
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  BaseQueryFn, 
  FetchArgs, 
  FetchBaseQueryError,
  QueryReturnValue
} from '@reduxjs/toolkit/query';
import { RootState } from '../store';

// API error interface
export interface ApiError {
  status: number;
  data: {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
  };
}

// Fetch Headers type
type HeadersInit = Headers | Record<string, string> | [string, string][];

// API request interface
interface ApiRequest {
  dispatch: any;
  getState: () => any;
  extra: any;
  endpoint: string;
  type: 'query' | 'mutation';
  forced?: boolean;
}

// Base URL from environment variable or default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// Create custom base query with auth header and error handling
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers: Headers | Record<string, string>, { getState }: { getState: () => unknown }) => {
    // Get the auth token from state
    const token = (getState() as RootState).auth?.token;
    
    // If we have a token set the authorization header
    if (token) {
      if (headers instanceof Headers) {
        headers.set('authorization', `Bearer ${token}`);
      } else {
        headers = new Headers(headers);
        headers.set('authorization', `Bearer ${token}`);
      }
    }
    
    return headers;
  },
  credentials: 'include', // Include cookies in requests
});

// Wrapper for baseQuery to handle errors and refresh token
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args: string | FetchArgs, api: ApiRequest, extraOptions: any) => {
  // Execute the original query
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 Unauthorized errors (expired token)
  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );
    
    // If the refresh token request succeeds
    if (refreshResult.data) {
      // Store the new token
      // api.dispatch(setCredentials(refreshResult.data));
      
      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // If refresh fails, logout the user
      // api.dispatch(logout());
    }
  }
  
  return result;
};

// Create the API slice
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: ['User', 'Project', 'Task', 'Comment', 'Notification'],
});

// Helper function to standardize error responses
export const standardizeError = (error: FetchBaseQueryError | undefined): ApiError => {
  // Default error structure
  const standardError: ApiError = {
    status: 500,
    data: { message: 'An unknown error occurred' }
  };
  
  if (!error) return standardError;
  
  // Handle error based on its type
  if ('status' in error) {
    standardError.status = error.status as number;
    
    // Try to extract error message from the response
    if (error.data) {
      if (typeof error.data === 'string') {
        standardError.data.message = error.data;
      } else if (typeof error.data === 'object' && error.data !== null) {
        const data = error.data as any;
        standardError.data.message = data.message || data.error || 'An error occurred';
        standardError.data.code = data.code;
        standardError.data.errors = data.errors;
      }
    }
    
    // Friendly messages for common HTTP status codes
    if (error.status === 401) {
      standardError.data.message = 'Authentication required. Please log in.';
    } else if (error.status === 403) {
      standardError.data.message = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      standardError.data.message = 'The requested resource was not found.';
    } else if (error.status === 429) {
      standardError.data.message = 'Too many requests. Please try again later.';
    }
  }
  
  return standardError;
};

export default baseApi; 