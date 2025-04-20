/**
 * REST API Adapter Implementation
 * 
 * This file implements the DataAdapter interface for RESTful API endpoints.
 * It provides standardized methods to interact with REST APIs using fetch.
 */

import { 
  DataAdapter, 
  BaseDataAdapter, 
  RequestOptions, 
  ResponseData, 
  DataRequestParams 
} from './DataAdapter';

/**
 * Cache configuration interface
 */
interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  prefix: string;
}

/**
 * Implementation of DataAdapter for REST APIs
 */
export class RestApiAdapter extends BaseDataAdapter implements DataAdapter {
  private cacheConfig: CacheConfig;
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private offlineQueue: Array<{
    method: string;
    endpoint: string;
    data?: any;
    id?: string | number;
    options?: RequestOptions;
    timestamp: number;
  }> = [];
  
  constructor(
    baseUrl: string, 
    defaultHeaders: Record<string, string> = {},
    cacheConfig: Partial<CacheConfig> = {}
  ) {
    super(baseUrl, defaultHeaders);
    
    // Default cache configuration
    this.cacheConfig = {
      enabled: true,
      ttl: 5 * 60 * 1000, // 5 minutes
      prefix: 'rest-cache:',
      ...cacheConfig
    };
    
    // Set up event listeners for online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }
  
  /**
   * Handle online event
   */
  private handleOnline(): void {
    if (this.offlineEnabled) {
      this.syncOfflineData();
    }
  }
  
  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('App is offline. Requests will be queued.');
  }
  
  /**
   * Constructs the full URL for an endpoint
   */
  private getFullUrl(endpoint: string): string {
    // Ensure no double slashes between baseUrl and endpoint
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${path}`;
  }
  
  /**
   * Generate a cache key for the request
   */
  private getCacheKey(endpoint: string, params?: any): string {
    const queryParams = params ? JSON.stringify(params) : '';
    return `${this.cacheConfig.prefix}${endpoint}:${queryParams}`;
  }
  
  /**
   * Store data in the cache
   */
  private async setCache<T>(key: string, data: T): Promise<void> {
    if (!this.cacheConfig.enabled) return;
    
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        expiry: Date.now() + this.cacheConfig.ttl
      }));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }
  
  /**
   * Get data from the cache
   */
  private getCache<T>(key: string): T | null {
    if (!this.cacheConfig.enabled) return null;
    
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const { data, expiry } = JSON.parse(cached);
      
      // Check if the cache has expired
      if (Date.now() > expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data as T;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }
  
  /**
   * Make a fetch request to the API
   */
  private async fetchWithTimeout(
    url: string, 
    options: RequestInit & { timeout?: number } = {}
  ): Promise<Response> {
    const { timeout = 10000, ...fetchOptions } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      
      return response;
    } finally {
      clearTimeout(id);
    }
  }
  
  /**
   * Process API response
   */
  private async processResponse<T>(response: Response): Promise<ResponseData<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      return this.handleError({
        status: response.status,
        data: errorData
      });
    }
    
    // Handle empty responses
    if (response.status === 204) {
      return {
        data: null as unknown as T,
        meta: {
          status: response.status,
          message: 'Success with no content',
          timestamp: Date.now()
        }
      };
    }
    
    const data = await response.json();
    
    // Handle different API response formats
    if (data.data !== undefined) {
      // Already in our expected format
      return data as ResponseData<T>;
    }
    
    // Convert to our standard format
    return {
      data: data as T,
      meta: {
        status: response.status,
        timestamp: Date.now()
      }
    };
  }
  
  /**
   * Add query parameters to a URL
   */
  private addQueryParams(url: string, params?: Record<string, any>): string {
    if (!params) return url;
    
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(`${key}[]`, String(item)));
      } else if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (!queryString) return url;
    
    return `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
  }
  
  /**
   * Format data request parameters for the API
   */
  private formatRequestParams(params?: DataRequestParams): Record<string, any> {
    if (!params) return {};
    
    const result: Record<string, any> = {};
    
    // Handle pagination
    if (params.page !== undefined) result.page = params.page;
    if (params.pageSize !== undefined) result.pageSize = params.pageSize;
    if (params.offset !== undefined) result.offset = params.offset;
    if (params.limit !== undefined) result.limit = params.limit;
    
    // Handle filtering
    if (params.filters) result.filters = params.filters;
    if (params.search) result.search = params.search;
    if (params.sort) result.sort = params.sort;
    if (params.sortDirection) result.sortDirection = params.sortDirection;
    
    // Handle field selection
    if (params.select) result.select = params.select;
    if (params.include) result.include = params.include;
    if (params.fields) result.fields = params.fields;
    if (params.expand) result.expand = params.expand;
    if (params.groupBy) result.groupBy = params.groupBy;
    
    return result;
  }
  
  /**
   * Queue a request for offline mode
   */
  private queueRequest(
    method: string,
    endpoint: string,
    data?: any,
    id?: string | number,
    options?: RequestOptions
  ): void {
    this.offlineQueue.push({
      method,
      endpoint,
      data,
      id,
      options,
      timestamp: Date.now()
    });
    
    // Store the queue in localStorage
    try {
      localStorage.setItem('offline-queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.warn('Failed to store offline queue:', error);
    }
  }
  
  // DataAdapter interface implementation
  
  /**
   * Get a single resource by endpoint
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ResponseData<T>> {
    const fullUrl = this.getFullUrl(endpoint);
    const cacheKey = this.getCacheKey(endpoint, options?.params);
    
    // Check if we're offline
    if (!this.isOnline() && this.offlineEnabled) {
      // Try to get from cache first
      const cachedData = this.getCache<ResponseData<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // If no cache, we can't proceed offline without data
      throw new Error('Cannot fetch new data in offline mode and no cached data available');
    }
    
    // Check for existing pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    // Check cache first if not explicitly disabled
    if (options?.cache !== 'no-cache' && options?.cache !== 'reload') {
      const cachedData = this.getCache<ResponseData<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    const urlWithParams = this.addQueryParams(fullUrl, options?.params);
    
    const requestPromise = this.fetchWithTimeout(urlWithParams, {
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...options?.headers
      },
      credentials: options?.credentials,
      timeout: options?.timeout,
      signal: options?.signal
    })
    .then(response => this.processResponse<T>(response))
    .then(result => {
      // Cache the result
      this.setCache(cacheKey, result);
      return result;
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      return this.handleError(error);
    })
    .finally(() => {
      // Remove from pending requests
      this.pendingRequests.delete(cacheKey);
    });
    
    // Store as pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
  
  /**
   * Get a list of resources
   */
  async list<T>(
    endpoint: string, 
    params?: DataRequestParams, 
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    const formattedParams = this.formatRequestParams(params);
    return this.get<T[]>(endpoint, {
      ...options,
      params: {
        ...options?.params,
        ...formattedParams
      }
    });
  }
  
  /**
   * Create a new resource
   */
  async create<T, D = any>(
    endpoint: string, 
    data: D, 
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    const fullUrl = this.getFullUrl(endpoint);
    
    // Check if we're offline
    if (!this.isOnline() && this.offlineEnabled) {
      this.queueRequest('POST', endpoint, data, undefined, options);
      
      // Return a mock response
      return {
        data: { id: `temp-${Date.now()}` } as unknown as T,
        meta: {
          status: 202,
          message: 'Queued for creation when online',
          timestamp: Date.now()
        }
      };
    }
    
    const urlWithParams = this.addQueryParams(fullUrl, options?.params);
    
    return this.fetchWithTimeout(urlWithParams, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        ...options?.headers
      },
      body: JSON.stringify(data),
      credentials: options?.credentials,
      timeout: options?.timeout,
      signal: options?.signal
    })
    .then(response => this.processResponse<T>(response))
    .catch(error => {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      return this.handleError(error);
    });
  }
  
  /**
   * Update a resource
   */
  async update<T, D = any>(
    endpoint: string, 
    id: string | number, 
    data: D, 
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    const fullUrl = this.getFullUrl(`${endpoint}/${id}`);
    
    // Check if we're offline
    if (!this.isOnline() && this.offlineEnabled) {
      this.queueRequest('PUT', endpoint, data, id, options);
      
      // Return a mock response
      return {
        data: { id, ...data } as unknown as T,
        meta: {
          status: 202,
          message: 'Queued for update when online',
          timestamp: Date.now()
        }
      };
    }
    
    const urlWithParams = this.addQueryParams(fullUrl, options?.params);
    
    return this.fetchWithTimeout(urlWithParams, {
      method: 'PUT',
      headers: {
        ...this.defaultHeaders,
        ...options?.headers
      },
      body: JSON.stringify(data),
      credentials: options?.credentials,
      timeout: options?.timeout,
      signal: options?.signal
    })
    .then(response => this.processResponse<T>(response))
    .catch(error => {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      return this.handleError(error);
    });
  }
  
  /**
   * Partially update a resource
   */
  async patch<T, D = any>(
    endpoint: string, 
    id: string | number, 
    data: Partial<D>, 
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    const fullUrl = this.getFullUrl(`${endpoint}/${id}`);
    
    // Check if we're offline
    if (!this.isOnline() && this.offlineEnabled) {
      this.queueRequest('PATCH', endpoint, data, id, options);
      
      // Return a mock response
      return {
        data: { id, ...data } as unknown as T,
        meta: {
          status: 202,
          message: 'Queued for partial update when online',
          timestamp: Date.now()
        }
      };
    }
    
    const urlWithParams = this.addQueryParams(fullUrl, options?.params);
    
    return this.fetchWithTimeout(urlWithParams, {
      method: 'PATCH',
      headers: {
        ...this.defaultHeaders,
        ...options?.headers
      },
      body: JSON.stringify(data),
      credentials: options?.credentials,
      timeout: options?.timeout,
      signal: options?.signal
    })
    .then(response => this.processResponse<T>(response))
    .catch(error => {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      return this.handleError(error);
    });
  }
  
  /**
   * Delete a resource
   */
  async remove<T>(
    endpoint: string, 
    id: string | number, 
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    const fullUrl = this.getFullUrl(`${endpoint}/${id}`);
    
    // Check if we're offline
    if (!this.isOnline() && this.offlineEnabled) {
      this.queueRequest('DELETE', endpoint, undefined, id, options);
      
      // Return a mock response
      return {
        data: { id } as unknown as T,
        meta: {
          status: 202,
          message: 'Queued for deletion when online',
          timestamp: Date.now()
        }
      };
    }
    
    const urlWithParams = this.addQueryParams(fullUrl, options?.params);
    
    return this.fetchWithTimeout(urlWithParams, {
      method: 'DELETE',
      headers: {
        ...this.defaultHeaders,
        ...options?.headers
      },
      credentials: options?.credentials,
      timeout: options?.timeout,
      signal: options?.signal
    })
    .then(response => this.processResponse<T>(response))
    .catch(error => {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      return this.handleError(error);
    });
  }
  
  /**
   * Get multiple resources by IDs
   */
  async batchGet<T>(
    endpoint: string, 
    ids: (string | number)[], 
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    // Some APIs support a specific batch endpoint
    const batchEndpoint = `${endpoint}/batch`;
    
    // Try to use a specific batch endpoint if available
    try {
      return await this.create<T[]>(batchEndpoint, { ids }, options);
    } catch (error) {
      // Fallback to individual requests if batch endpoint fails
      console.log('Batch endpoint not available, falling back to individual requests');
      
      const promises = ids.map(id => this.get<T>(`${endpoint}/${id}`, options));
      const results = await Promise.all(promises);
      
      // Combine results into a single response
      return {
        data: results.map(result => result.data),
        meta: {
          status: 200,
          timestamp: Date.now()
        }
      };
    }
  }
  
  /**
   * Create multiple resources
   */
  async batchCreate<T, D = any>(
    endpoint: string, 
    data: D[], 
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    return this.create<T[]>(endpoint, data, options);
  }
  
  /**
   * Update multiple resources
   */
  async batchUpdate<T, D = any>(
    endpoint: string, 
    data: (D & { id: string | number })[], 
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    // Some APIs support a specific batch update endpoint
    const batchEndpoint = `${endpoint}/batch`;
    
    // Try to use a specific batch endpoint if available
    try {
      return await this.create<T[]>(batchEndpoint, { data }, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options?.headers,
          'X-HTTP-Method-Override': 'PUT'
        }
      });
    } catch (error) {
      // Fallback to individual requests if batch endpoint fails
      console.log('Batch update endpoint not available, falling back to individual requests');
      
      const promises = data.map(item => {
        const { id, ...rest } = item;
        return this.update<T, D>(`${endpoint}/${id}`, id, rest as D, options);
      });
      
      const results = await Promise.all(promises);
      
      // Combine results into a single response
      return {
        data: results.map(result => result.data),
        meta: {
          status: 200,
          timestamp: Date.now()
        }
      };
    }
  }
  
  /**
   * Delete multiple resources
   */
  async batchRemove<T>(
    endpoint: string, 
    ids: (string | number)[], 
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    // Some APIs support a specific batch delete endpoint
    const batchEndpoint = `${endpoint}/batch`;
    
    // Try to use a specific batch endpoint if available
    try {
      return await this.create<T[]>(batchEndpoint, { ids }, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options?.headers,
          'X-HTTP-Method-Override': 'DELETE'
        }
      });
    } catch (error) {
      // Fallback to individual requests if batch endpoint fails
      console.log('Batch delete endpoint not available, falling back to individual requests');
      
      const promises = ids.map(id => this.remove<T>(endpoint, id, options));
      const results = await Promise.all(promises);
      
      // Combine results into a single response
      return {
        data: results.map(result => result.data),
        meta: {
          status: 200,
          timestamp: Date.now()
        }
      };
    }
  }
  
  /**
   * Clear the adapter's cache
   */
  async clearCache(endpoint?: string): Promise<void> {
    if (!this.cacheConfig.enabled) return;
    
    if (endpoint) {
      // Clear cache for a specific endpoint
      const prefix = `${this.cacheConfig.prefix}${endpoint}`;
      
      // Iterate through localStorage and remove matching items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      // Clear all cache for this adapter
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.cacheConfig.prefix)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
  
  /**
   * Invalidate cache for a specific endpoint or resource
   */
  async invalidateCache(endpoint: string, id?: string | number): Promise<void> {
    if (!this.cacheConfig.enabled) return;
    
    if (id) {
      // Invalidate a specific resource
      const key = this.getCacheKey(`${endpoint}/${id}`, {});
      localStorage.removeItem(key);
    } else {
      // Invalidate all resources for an endpoint
      const prefix = `${this.cacheConfig.prefix}${endpoint}`;
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
  
  /**
   * Synchronize offline data with the server
   */
  async syncOfflineData(): Promise<void> {
    if (!this.isOnline() || !this.offlineEnabled || this.offlineQueue.length === 0) {
      return;
    }
    
    console.log(`Syncing ${this.offlineQueue.length} offline requests...`);
    
    // Process the queue in order
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    localStorage.removeItem('offline-queue');
    
    for (const request of queue) {
      try {
        switch (request.method) {
          case 'POST':
            await this.create(request.endpoint, request.data, request.options);
            break;
          case 'PUT':
            await this.update(request.endpoint, request.id!, request.data, request.options);
            break;
          case 'PATCH':
            await this.patch(request.endpoint, request.id!, request.data, request.options);
            break;
          case 'DELETE':
            await this.remove(request.endpoint, request.id!, request.options);
            break;
        }
        
        console.log(`Successfully synced offline request: ${request.method} ${request.endpoint}`);
      } catch (error) {
        console.error(`Failed to sync offline request: ${request.method} ${request.endpoint}`, error);
        
        // Re-add to queue if it failed
        this.offlineQueue.push(request);
      }
    }
    
    // Save the remaining queue if any
    if (this.offlineQueue.length > 0) {
      try {
        localStorage.setItem('offline-queue', JSON.stringify(this.offlineQueue));
      } catch (error) {
        console.warn('Failed to store offline queue:', error);
      }
    }
    
    console.log(`Offline sync complete. ${this.offlineQueue.length} requests remaining.`);
  }
} 