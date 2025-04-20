/**
 * Cacheable Adapter
 * 
 * This is a wrapper for any DataAdapter implementation that adds comprehensive caching
 * capabilities through the CacheService. It provides transparent caching for all
 * data operations with configurable strategies.
 */

import { 
  DataAdapter, 
  RequestOptions, 
  ResponseData, 
  DataRequestParams 
} from './DataAdapter';
import { CacheService } from '../cache/CacheService';

// Valid operation names for caching policies
export type CacheableOperationName = 'get' | 'list' | 'create' | 'update' | 'patch' | 'remove' | 'batchGet';

export interface CacheableAdapterOptions {
  /** Whether to enable caching */
  enabled?: boolean;
  
  /** Time to live in milliseconds (default: 5 minutes) */
  ttl?: number;
  
  /** Namespace for the cache keys */
  namespace?: string;
  
  /** Storage type to use */
  storage?: 'memory' | 'localStorage' | 'indexedDB';
  
  /** Maximum size of the cache (for memory cache) */
  maxSize?: number;
  
  /** Cache eviction policy */
  priority?: 'lru' | 'fifo' | 'lfu';
  
  /** Whether to enable offline support */
  offlineSupport?: boolean;
  
  /** Functions returning whether to cache specific operations */
  operations?: {
    get?: boolean | ((endpoint: string, options?: RequestOptions) => boolean);
    list?: boolean | ((endpoint: string, params?: DataRequestParams, options?: RequestOptions) => boolean);
    create?: boolean | ((endpoint: string, data: any, options?: RequestOptions) => boolean);
    update?: boolean | ((endpoint: string, id: string | number, data: any, options?: RequestOptions) => boolean);
    patch?: boolean | ((endpoint: string, id: string | number, data: any, options?: RequestOptions) => boolean);
    remove?: boolean | ((endpoint: string, id: string | number, options?: RequestOptions) => boolean);
    batchGet?: boolean | ((endpoint: string, ids: (string | number)[], options?: RequestOptions) => boolean);
  };
  
  /** Functions returning custom cache keys for operations */
  keyFunctions?: {
    get?: (endpoint: string, options?: RequestOptions) => string;
    list?: (endpoint: string, params?: DataRequestParams, options?: RequestOptions) => string;
    batchGet?: (endpoint: string, ids: (string | number)[], options?: RequestOptions) => string;
  };
}

/**
 * Default cacheable adapter options
 */
const DEFAULT_OPTIONS: CacheableAdapterOptions = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
  namespace: 'data-cache',
  storage: 'localStorage',
  maxSize: 1000,
  priority: 'lru',
  offlineSupport: true,
  operations: {
    get: true,
    list: true,
    create: false,
    update: false,
    patch: false,
    remove: false,
    batchGet: true
  }
};

/**
 * A wrapper adapter that adds caching to any data adapter
 */
export class CacheableAdapter implements DataAdapter {
  private adapter: DataAdapter;
  private cache: CacheService;
  private options: CacheableAdapterOptions;
  
  /**
   * Create a new cacheable adapter
   */
  constructor(adapter: DataAdapter, options: CacheableAdapterOptions = {}) {
    this.adapter = adapter;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      operations: {
        ...DEFAULT_OPTIONS.operations,
        ...options.operations
      }
    };
    
    // Initialize the cache service
    this.cache = CacheService.getInstance({
      namespace: this.options.namespace,
      ttl: this.options.ttl,
      storage: this.options.storage,
      maxSize: this.options.maxSize,
      priority: this.options.priority
    });
    
    // Enable offline mode if specified
    if (this.options.offlineSupport) {
      this.adapter.enableOfflineMode(true);
    }
  }
  
  /**
   * Generate a cache key for the get operation
   */
  private getGetCacheKey(endpoint: string, options?: RequestOptions): string {
    // Use custom key function if provided
    if (this.options.keyFunctions?.get) {
      return this.options.keyFunctions.get(endpoint, options);
    }
    
    const params = options?.params ? JSON.stringify(options.params) : '';
    return `get:${endpoint}:${params}`;
  }
  
  /**
   * Generate a cache key for the list operation
   */
  private getListCacheKey(endpoint: string, params?: DataRequestParams, options?: RequestOptions): string {
    // Use custom key function if provided
    if (this.options.keyFunctions?.list) {
      return this.options.keyFunctions.list(endpoint, params, options);
    }
    
    const paramsStr = params ? JSON.stringify(params) : '';
    const optionsParams = options?.params ? JSON.stringify(options.params) : '';
    return `list:${endpoint}:${paramsStr}:${optionsParams}`;
  }
  
  /**
   * Generate a cache key for the batchGet operation
   */
  private getBatchGetCacheKey(endpoint: string, ids: (string | number)[], options?: RequestOptions): string {
    // Use custom key function if provided
    if (this.options.keyFunctions?.batchGet) {
      return this.options.keyFunctions.batchGet(endpoint, ids, options);
    }
    
    const idsStr = ids.join(',');
    const params = options?.params ? JSON.stringify(options.params) : '';
    return `batchGet:${endpoint}:${idsStr}:${params}`;
  }
  
  /**
   * Determine if an operation should be cached
   */
  private shouldCache(operation: CacheableOperationName, ...args: any[]): boolean {
    if (!this.options.enabled) return false;
    
    const operationConfig = this.options.operations?.[operation];
    
    if (typeof operationConfig === 'function') {
      // Apply the function with the arguments
      return (operationConfig as Function)(...args);
    }
    
    return !!operationConfig;
  }
  
  /**
   * Invalidate cache entries related to an endpoint
   */
  private async invalidateEndpointCache(endpoint: string): Promise<void> {
    // Remove all cache entries for this endpoint
    // Note: This is a simple approach. A more sophisticated implementation
    // would track specific keys related to this endpoint
    await this.cache.clear();
  }
  
  /**
   * Get a single resource
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ResponseData<T>> {
    const shouldCache = this.shouldCache('get', endpoint, options);
    
    // Skip cache if explicitly disabled
    if (options?.cache === 'no-cache' || options?.cache === 'reload') {
      return this.adapter.get<T>(endpoint, options);
    }
    
    if (shouldCache) {
      const cacheKey = this.getGetCacheKey(endpoint, options);
      
      // Try to get from cache first
      const cachedData = await this.cache.get<ResponseData<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Not in cache, fetch from adapter
      const result = await this.adapter.get<T>(endpoint, options);
      
      // Cache the result if it's successful
      if (result.data) {
        await this.cache.set(cacheKey, result, this.options.ttl);
      }
      
      return result;
    }
    
    // No caching, directly use the adapter
    return this.adapter.get<T>(endpoint, options);
  }
  
  /**
   * Get a list of resources
   */
  async list<T>(
    endpoint: string, 
    params?: DataRequestParams, 
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    const shouldCache = this.shouldCache('list', endpoint, params, options);
    
    // Skip cache if explicitly disabled
    if (options?.cache === 'no-cache' || options?.cache === 'reload') {
      return this.adapter.list<T>(endpoint, params, options);
    }
    
    if (shouldCache) {
      const cacheKey = this.getListCacheKey(endpoint, params, options);
      
      // Try to get from cache first
      const cachedData = await this.cache.get<ResponseData<T[]>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Not in cache, fetch from adapter
      const result = await this.adapter.list<T>(endpoint, params, options);
      
      // Cache the result if it's successful
      if (result.data) {
        await this.cache.set(cacheKey, result, this.options.ttl);
      }
      
      return result;
    }
    
    // No caching, directly use the adapter
    return this.adapter.list<T>(endpoint, params, options);
  }
  
  /**
   * Create a new resource
   */
  async create<T, D = any>(
    endpoint: string, 
    data: D, 
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    const result = await this.adapter.create<T, D>(endpoint, data, options);
    
    // Invalidate cache for this endpoint
    await this.invalidateEndpointCache(endpoint);
    
    // Cache the result if configured to do so
    if (this.shouldCache('create', endpoint, data, options) && result.data) {
      const cacheKey = `item:${endpoint}:${(result.data as any).id}`;
      await this.cache.set(cacheKey, result, this.options.ttl);
    }
    
    return result;
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
    const result = await this.adapter.update<T, D>(endpoint, id, data, options);
    
    // Invalidate cache for this endpoint
    await this.invalidateEndpointCache(endpoint);
    
    // Cache the updated item if configured to do so
    if (this.shouldCache('update', endpoint, id, data, options) && result.data) {
      const cacheKey = `item:${endpoint}:${id}`;
      await this.cache.set(cacheKey, result, this.options.ttl);
    }
    
    return result;
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
    const result = await this.adapter.patch<T, D>(endpoint, id, data, options);
    
    // Invalidate cache for this endpoint
    await this.invalidateEndpointCache(endpoint);
    
    // Cache the updated item if configured to do so
    if (this.shouldCache('patch', endpoint, id, data, options) && result.data) {
      const cacheKey = `item:${endpoint}:${id}`;
      await this.cache.set(cacheKey, result, this.options.ttl);
    }
    
    return result;
  }
  
  /**
   * Delete a resource
   */
  async remove<T>(
    endpoint: string, 
    id: string | number, 
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    const result = await this.adapter.remove<T>(endpoint, id, options);
    
    // Invalidate cache for this endpoint
    await this.invalidateEndpointCache(endpoint);
    
    return result;
  }
  
  /**
   * Get multiple resources by IDs
   */
  async batchGet<T>(
    endpoint: string, 
    ids: (string | number)[], 
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    const shouldCache = this.shouldCache('batchGet', endpoint, ids, options);
    
    // Skip cache if explicitly disabled
    if (options?.cache === 'no-cache' || options?.cache === 'reload') {
      return this.adapter.batchGet<T>(endpoint, ids, options);
    }
    
    if (shouldCache) {
      const cacheKey = this.getBatchGetCacheKey(endpoint, ids, options);
      
      // Try to get from cache first
      const cachedData = await this.cache.get<ResponseData<T[]>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Not in cache, fetch from adapter
      const result = await this.adapter.batchGet<T>(endpoint, ids, options);
      
      // Cache the result if it's successful
      if (result.data) {
        await this.cache.set(cacheKey, result, this.options.ttl);
        
        // Also cache individual items for potential get operations
        result.data.forEach((item: any) => {
          if (item && item.id) {
            const itemCacheKey = `item:${endpoint}:${item.id}`;
            this.cache.set(itemCacheKey, {
              data: item,
              meta: result.meta
            }, this.options.ttl);
          }
        });
      }
      
      return result;
    }
    
    // No caching, directly use the adapter
    return this.adapter.batchGet<T>(endpoint, ids, options);
  }
  
  /**
   * Create multiple resources
   */
  async batchCreate<T, D = any>(
    endpoint: string, 
    data: D[], 
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    const result = await this.adapter.batchCreate<T, D>(endpoint, data, options);
    
    // Invalidate cache for this endpoint
    await this.invalidateEndpointCache(endpoint);
    
    return result;
  }
  
  /**
   * Update multiple resources
   */
  async batchUpdate<T, D = any>(
    endpoint: string, 
    data: (D & { id: string | number })[], 
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    const result = await this.adapter.batchUpdate<T, D>(endpoint, data, options);
    
    // Invalidate cache for this endpoint
    await this.invalidateEndpointCache(endpoint);
    
    return result;
  }
  
  /**
   * Delete multiple resources
   */
  async batchRemove<T>(
    endpoint: string, 
    ids: (string | number)[], 
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    const result = await this.adapter.batchRemove<T>(endpoint, ids, options);
    
    // Invalidate cache for this endpoint
    await this.invalidateEndpointCache(endpoint);
    
    return result;
  }
  
  /**
   * Clear cache
   */
  async clearCache(endpoint?: string): Promise<void> {
    // Clear underlying adapter cache
    await this.adapter.clearCache(endpoint);
    
    // Clear our cache service
    await this.cache.clear();
  }
  
  /**
   * Invalidate cache for a specific endpoint or resource
   */
  async invalidateCache(endpoint: string, id?: string | number): Promise<void> {
    // Invalidate in underlying adapter
    await this.adapter.invalidateCache(endpoint, id);
    
    if (id) {
      // Invalidate specific item
      await this.cache.remove(`item:${endpoint}:${id}`);
    } else {
      // Invalidate all items for this endpoint
      await this.invalidateEndpointCache(endpoint);
    }
  }
  
  /**
   * Check if we're online
   */
  isOnline(): boolean {
    return this.adapter.isOnline();
  }
  
  /**
   * Sync offline data with the server
   */
  async syncOfflineData(): Promise<void> {
    await this.adapter.syncOfflineData();
    
    // After syncing, invalidate the cache to ensure fresh data
    await this.cache.clear();
  }
  
  /**
   * Enable offline mode
   */
  enableOfflineMode(enabled: boolean): void {
    this.adapter.enableOfflineMode(enabled);
  }
  
  /**
   * Transform data
   */
  transform<T, R>(data: T, transformFn: (data: T) => R): R {
    return this.adapter.transform(data, transformFn);
  }
  
  /**
   * Configure the adapter
   */
  configure(config: Record<string, any>): void {
    this.adapter.configure(config);
    
    // Update cache options if provided
    if (config.cache) {
      this.options = {
        ...this.options,
        ...config.cache
      };
      
      // Update cache service configuration
      this.cache.configure({
        namespace: this.options.namespace,
        ttl: this.options.ttl,
        storage: this.options.storage,
        maxSize: this.options.maxSize,
        priority: this.options.priority
      });
    }
  }
  
  /**
   * Get the base URL from the underlying adapter
   */
  getBaseUrl(): string {
    return this.adapter.getBaseUrl();
  }
  
  /**
   * Set the base URL for the underlying adapter
   */
  setBaseUrl(url: string): void {
    this.adapter.setBaseUrl(url);
  }
  
  /**
   * Handle errors
   */
  handleError(error: any): Promise<never> {
    return this.adapter.handleError(error);
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
} 