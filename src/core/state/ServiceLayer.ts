import { useState, useCallback } from 'react';

// Generic request state interface
export interface RequestState<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Standard API response interface
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// Options for API requests
export interface RequestOptions {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  timeout?: number;
  signal?: AbortSignal;
}

// Base service class that provides common functionality
export class BaseService {
  private baseUrl: string;
  private defaultOptions: RequestOptions;

  constructor(baseUrl: string, defaultOptions: RequestOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...defaultOptions,
    };
  }

  // Helper to construct the full URL
  protected buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  // Helper to merge options
  protected mergeOptions(options: RequestOptions = {}): RequestOptions {
    return {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      },
    };
  }

  // Generic request method
  protected async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const mergedOptions = this.mergeOptions(options);
    
    try {
      const response = await fetch(url, {
        method,
        headers: mergedOptions.headers,
        credentials: mergedOptions.withCredentials ? 'include' : 'same-origin',
        body: data ? JSON.stringify(data) : undefined,
        signal: mergedOptions.signal,
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        
        // Standard response structure
        return {
          data: responseData.data || responseData,
          success: response.ok,
          message: responseData.message || '',
          errors: responseData.errors || {},
        };
      } else {
        const textData = await response.text();
        return {
          data: textData as unknown as T,
          success: response.ok,
          message: response.ok ? 'Success' : 'Error',
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null as unknown as T,
          success: false,
          message: error.message,
        };
      }
      return {
        data: null as unknown as T,
        success: false,
        message: 'Unknown error occurred',
      };
    }
  }

  // Convenience methods for different HTTP methods
  protected get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  protected post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  protected put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  protected patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  protected delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
}

// Hook for managing request state
export function useRequest<T>() {
  const [state, setState] = useState<RequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (promise: Promise<ApiResponse<T>>) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const response = await promise;
      
      if (response.success) {
        setState({ data: response.data, loading: false, error: null });
        return response;
      } else {
        const error = new Error(response.message || 'Request failed');
        setState({ data: null, loading: false, error });
        return response;
      }
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Unknown error');
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, execute };
}

// Create a service factory
export function createService<T extends BaseService>(
  ServiceClass: new (baseUrl: string, options?: RequestOptions) => T,
  baseUrl: string,
  options?: RequestOptions
): T {
  return new ServiceClass(baseUrl, options);
} 