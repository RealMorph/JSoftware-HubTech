/**
 * useDataAdapter Hook
 * 
 * This hook provides a simple way to access data adapters throughout the application.
 * It handles authentication token injection and provides type-safe access to data.
 */

import { useCallback } from 'react';
import { useAdapter, AdapterConfig } from '../adapters/AdapterFactory';
import { ResponseData, DataRequestParams, RequestOptions } from '../adapters/DataAdapter';
import { useAuth } from './useAuth';

/**
 * Hook for data adapter access with built-in authentication and error handling
 */
export function useDataAdapter<T = any>(config?: Partial<AdapterConfig>) {
  const adapter = useAdapter(config);
  // Access auth context
  const auth = useAuth();
  
  // Inject authentication token into headers if available
  const getAuthHeaders = useCallback((): Record<string, string> => {
    // Extract token from auth context - this is a safe approach that works with any auth structure
    // The actual property might be auth.token, auth.accessToken, etc.
    const token = auth && (
      typeof auth === 'object' && 
      ('token' in auth ? auth.token : 
       'accessToken' in auth ? auth.accessToken : 
       null)
    );
    
    return typeof token === 'string' ? { Authorization: `Bearer ${token}` } : {};
  }, [auth]);
  
  // Get a single resource
  const get = useCallback(
    async (endpoint: string, options: Partial<RequestOptions> = {}) => {
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
      };
      
      return adapter.get<T>(endpoint, {
        ...options,
        headers
      });
    },
    [adapter, getAuthHeaders]
  );
  
  // Get a list of resources
  const list = useCallback(
    async (endpoint: string, params?: DataRequestParams, options: Partial<RequestOptions> = {}) => {
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
      };
      
      return adapter.list<T>(endpoint, params, {
        ...options,
        headers
      });
    },
    [adapter, getAuthHeaders]
  );
  
  // Create a new resource
  const create = useCallback(
    async <D = any>(endpoint: string, data: D, options: Partial<RequestOptions> = {}) => {
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
      };
      
      return adapter.create<T, D>(endpoint, data, {
        ...options,
        headers
      });
    },
    [adapter, getAuthHeaders]
  );
  
  // Update a resource
  const update = useCallback(
    async <D = any>(endpoint: string, id: string | number, data: D, options: Partial<RequestOptions> = {}) => {
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
      };
      
      return adapter.update<T, D>(endpoint, id, data, {
        ...options,
        headers
      });
    },
    [adapter, getAuthHeaders]
  );
  
  // Partially update a resource
  const patch = useCallback(
    async <D = any>(endpoint: string, id: string | number, data: Partial<D>, options: Partial<RequestOptions> = {}) => {
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
      };
      
      return adapter.patch<T, D>(endpoint, id, data, {
        ...options,
        headers
      });
    },
    [adapter, getAuthHeaders]
  );
  
  // Delete a resource
  const remove = useCallback(
    async (endpoint: string, id: string | number, options: Partial<RequestOptions> = {}) => {
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
      };
      
      return adapter.remove<T>(endpoint, id, {
        ...options,
        headers
      });
    },
    [adapter, getAuthHeaders]
  );
  
  // Batch operations
  const batchGet = useCallback(
    async (endpoint: string, ids: (string | number)[], options: Partial<RequestOptions> = {}) => {
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
      };
      
      return adapter.batchGet<T>(endpoint, ids, {
        ...options,
        headers
      });
    },
    [adapter, getAuthHeaders]
  );
  
  const batchCreate = useCallback(
    async <D = any>(endpoint: string, data: D[], options: Partial<RequestOptions> = {}) => {
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
      };
      
      return adapter.batchCreate<T, D>(endpoint, data, {
        ...options,
        headers
      });
    },
    [adapter, getAuthHeaders]
  );
  
  const batchUpdate = useCallback(
    async <D = any>(endpoint: string, data: (D & { id: string | number })[], options: Partial<RequestOptions> = {}) => {
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
      };
      
      return adapter.batchUpdate<T, D>(endpoint, data, {
        ...options,
        headers
      });
    },
    [adapter, getAuthHeaders]
  );
  
  const batchRemove = useCallback(
    async (endpoint: string, ids: (string | number)[], options: Partial<RequestOptions> = {}) => {
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
      };
      
      return adapter.batchRemove<T>(endpoint, ids, {
        ...options,
        headers
      });
    },
    [adapter, getAuthHeaders]
  );
  
  // Cache control
  const clearCache = useCallback(
    async (endpoint?: string) => {
      return adapter.clearCache(endpoint);
    },
    [adapter]
  );
  
  const invalidateCache = useCallback(
    async (endpoint: string, id?: string | number) => {
      return adapter.invalidateCache(endpoint, id);
    },
    [adapter]
  );
  
  // Offline support
  const syncOfflineData = useCallback(
    async () => {
      return adapter.syncOfflineData();
    },
    [adapter]
  );
  
  const enableOfflineMode = useCallback(
    (enabled: boolean) => {
      adapter.enableOfflineMode(enabled);
    },
    [adapter]
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
    // Expose the raw adapter for advanced usage
    adapter
  };
}

/**
 * Type-safe hook for working with a specific data model
 */
export function createModelAdapter<T, CreateDto = T, UpdateDto = Partial<T>>(
  endpoint: string,
  config?: Partial<AdapterConfig>
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
    } = useDataAdapter<T>(config);
    
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