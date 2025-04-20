/**
 * useCachedAdapter Hook
 * 
 * This hook provides a way to access cached data adapters throughout the application.
 * It wraps the useAdapter hook with the CacheableAdapter to add caching capabilities.
 */

import { useCallback } from 'react';
import { useAdapter, AdapterConfig } from '../adapters/AdapterFactory';
import { CacheableAdapter, CacheableAdapterOptions } from '../adapters/CacheableAdapter';
import { ResponseData, DataRequestParams, RequestOptions } from '../adapters/DataAdapter';
import { useAuth } from './useAuth';

// Cache configuration for different modules to avoid repetition
const moduleConfigs: Record<string, CacheableAdapterOptions> = {
  // User-related data: short cache time since it changes frequently
  users: {
    namespace: 'user-cache',
    ttl: 5 * 60 * 1000, // 5 minutes
    storage: 'localStorage'
  },
  
  // Products data: longer cache time, less frequent changes
  products: {
    namespace: 'product-cache',
    ttl: 30 * 60 * 1000, // 30 minutes
    storage: 'localStorage'
  },
  
  // Reference data: very long cache, rarely changes
  references: {
    namespace: 'reference-cache',
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    storage: 'localStorage'
  },
  
  // Large datasets: use IndexedDB
  largeData: {
    namespace: 'large-data-cache',
    ttl: 60 * 60 * 1000, // 1 hour
    storage: 'indexedDB',
    operations: {
      list: true,
      get: true,
      create: false,
      update: false,
      remove: false,
      batchGet: true
    }
  },
  
  // Default configuration
  default: {
    namespace: 'data-cache',
    ttl: 15 * 60 * 1000, // 15 minutes
    storage: 'localStorage'
  }
};

/**
 * Hook for cached data adapter access with authentication and optimized caching
 */
export function useCachedAdapter<T = any>(
  config?: Partial<AdapterConfig>,
  cacheOptions?: Partial<CacheableAdapterOptions>,
  moduleName: keyof typeof moduleConfigs = 'default'
) {
  // Get the basic adapter
  const adapter = useAdapter(config);
  // Access auth context
  const auth = useAuth();
  
  // Create a memoized wrapped adapter
  const cachedAdapter = useCallback(() => {
    // Merge module config with provided options
    const mergedOptions: CacheableAdapterOptions = {
      ...moduleConfigs[moduleName],
      ...cacheOptions,
      // Add user-specific namespace if authenticated
      ...(auth?.currentUser?.uid && {
        namespace: `${moduleConfigs[moduleName].namespace}-${auth.currentUser.uid}`
      })
    };
    
    return new CacheableAdapter(adapter, mergedOptions);
  }, [adapter, cacheOptions, moduleName, auth?.currentUser?.uid]);
  
  // Get a single resource with caching
  const get = useCallback(
    async (endpoint: string, options: Partial<RequestOptions> = {}) => {
      return cachedAdapter().get<T>(endpoint, options);
    },
    [cachedAdapter]
  );
  
  // Get a list of resources with caching
  const list = useCallback(
    async (endpoint: string, params?: DataRequestParams, options: Partial<RequestOptions> = {}) => {
      return cachedAdapter().list<T>(endpoint, params, options);
    },
    [cachedAdapter]
  );
  
  // Create a new resource
  const create = useCallback(
    async <D = any>(endpoint: string, data: D, options: Partial<RequestOptions> = {}) => {
      return cachedAdapter().create<T, D>(endpoint, data, options);
    },
    [cachedAdapter]
  );
  
  // Update a resource
  const update = useCallback(
    async <D = any>(endpoint: string, id: string | number, data: D, options: Partial<RequestOptions> = {}) => {
      return cachedAdapter().update<T, D>(endpoint, id, data, options);
    },
    [cachedAdapter]
  );
  
  // Partially update a resource
  const patch = useCallback(
    async <D = any>(endpoint: string, id: string | number, data: Partial<D>, options: Partial<RequestOptions> = {}) => {
      return cachedAdapter().patch<T, D>(endpoint, id, data, options);
    },
    [cachedAdapter]
  );
  
  // Delete a resource
  const remove = useCallback(
    async (endpoint: string, id: string | number, options: Partial<RequestOptions> = {}) => {
      return cachedAdapter().remove<T>(endpoint, id, options);
    },
    [cachedAdapter]
  );
  
  // Batch operations
  const batchGet = useCallback(
    async (endpoint: string, ids: (string | number)[], options: Partial<RequestOptions> = {}) => {
      return cachedAdapter().batchGet<T>(endpoint, ids, options);
    },
    [cachedAdapter]
  );
  
  const batchCreate = useCallback(
    async <D = any>(endpoint: string, data: D[], options: Partial<RequestOptions> = {}) => {
      return cachedAdapter().batchCreate<T, D>(endpoint, data, options);
    },
    [cachedAdapter]
  );
  
  const batchUpdate = useCallback(
    async <D = any>(endpoint: string, data: (D & { id: string | number })[], options: Partial<RequestOptions> = {}) => {
      return cachedAdapter().batchUpdate<T, D>(endpoint, data, options);
    },
    [cachedAdapter]
  );
  
  const batchRemove = useCallback(
    async (endpoint: string, ids: (string | number)[], options: Partial<RequestOptions> = {}) => {
      return cachedAdapter().batchRemove<T>(endpoint, ids, options);
    },
    [cachedAdapter]
  );
  
  // Cache control
  const clearCache = useCallback(
    async (endpoint?: string) => {
      return cachedAdapter().clearCache(endpoint);
    },
    [cachedAdapter]
  );
  
  const invalidateCache = useCallback(
    async (endpoint: string, id?: string | number) => {
      return cachedAdapter().invalidateCache(endpoint, id);
    },
    [cachedAdapter]
  );
  
  // Offline support
  const syncOfflineData = useCallback(
    async () => {
      return cachedAdapter().syncOfflineData();
    },
    [cachedAdapter]
  );
  
  const enableOfflineMode = useCallback(
    (enabled: boolean) => {
      cachedAdapter().enableOfflineMode(enabled);
    },
    [cachedAdapter]
  );
  
  // Cache statistics
  const getCacheStats = useCallback(
    () => {
      return cachedAdapter().getCacheStats();
    },
    [cachedAdapter]
  );
  
  return {
    get,
    list,
    create,
    update,
    patch,
    remove,
    batchGet,
    batchCreate,
    batchUpdate,
    batchRemove,
    clearCache,
    invalidateCache,
    syncOfflineData,
    enableOfflineMode,
    getCacheStats,
    // Expose the raw adapter for advanced usage
    adapter: cachedAdapter()
  };
}

/**
 * Type-safe hook for working with a specific cached data model
 */
export function createCachedModelAdapter<T, CreateDto = T, UpdateDto = Partial<T>>(
  endpoint: string,
  moduleName: keyof typeof moduleConfigs = 'default',
  config?: Partial<AdapterConfig>,
  cacheOptions?: Partial<CacheableAdapterOptions>
) {
  return () => {
    const {
      get,
      list,
      create,
      update,
      patch,
      remove,
      batchGet,
      batchCreate,
      batchUpdate,
      batchRemove,
      clearCache,
      invalidateCache,
      ...rest
    } = useCachedAdapter<T>(config, cacheOptions, moduleName);
    
    return {
      // Simplified model API
      getById: (id: string | number, options: Partial<RequestOptions> = {}) => get(`${endpoint}/${id}`, options),
      getAll: (params?: DataRequestParams, options: Partial<RequestOptions> = {}) => list(endpoint, params, options),
      create: (data: CreateDto, options: Partial<RequestOptions> = {}) => create(endpoint, data, options),
      update: (id: string | number, data: UpdateDto, options: Partial<RequestOptions> = {}) => update(endpoint, id, data, options),
      patch: (id: string | number, data: Partial<UpdateDto>, options: Partial<RequestOptions> = {}) => patch(endpoint, id, data, options),
      remove: (id: string | number, options: Partial<RequestOptions> = {}) => remove(endpoint, id, options),
      
      // Batch operations
      batchGet: (ids: (string | number)[], options: Partial<RequestOptions> = {}) => batchGet(endpoint, ids, options),
      batchCreate: (data: CreateDto[], options: Partial<RequestOptions> = {}) => batchCreate(endpoint, data, options),
      batchUpdate: (data: (UpdateDto & { id: string | number })[], options: Partial<RequestOptions> = {}) => batchUpdate(endpoint, data, options),
      batchRemove: (ids: (string | number)[], options: Partial<RequestOptions> = {}) => batchRemove(endpoint, ids, options),
      
      // Cache management
      clearCache: () => clearCache(endpoint),
      invalidateCache: (id?: string | number) => invalidateCache(endpoint, id),
      
      // Pass through other methods
      ...rest
    };
  };
} 