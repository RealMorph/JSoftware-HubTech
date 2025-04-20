/**
 * useOfflineStorage Hook
 * 
 * This hook provides utilities for handling offline data storage and synchronization.
 * It works with the CacheService to provide a consistent offline experience.
 */

import { useState, useEffect, useCallback } from 'react';
import { CacheService } from '../cache/CacheService';

interface OfflineStorageOptions {
  namespace: string;
  storage?: 'localStorage' | 'indexedDB';
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

interface PendingOperation<T = any> {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data?: T;
  timestamp: number;
  retryCount: number;
}

interface OfflineStorageState {
  isOnline: boolean;
  hasPendingOperations: boolean;
  pendingOperationsCount: number;
  lastSyncTime: number | null;
  isSyncing: boolean;
}

/**
 * Hook for offline data storage and synchronization
 */
export function useOfflineStorage(options: OfflineStorageOptions) {
  const [state, setState] = useState<OfflineStorageState>({
    isOnline: navigator.onLine,
    hasPendingOperations: false,
    pendingOperationsCount: 0,
    lastSyncTime: null,
    isSyncing: false
  });

  const cacheService = CacheService.getInstance({
    namespace: `${options.namespace}-offline`,
    storage: options.storage || 'indexedDB'
  });

  // Load pending operations on mount
  useEffect(() => {
    loadPendingOperations();
    
    // Set up online/offline listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto sync if enabled
  useEffect(() => {
    if (!options.autoSync) return;
    
    const interval = setInterval(() => {
      if (navigator.onLine && state.hasPendingOperations && !state.isSyncing) {
        syncPendingOperations();
      }
    }, options.syncInterval || 60000); // Default to 1 minute
    
    return () => clearInterval(interval);
  }, [options.autoSync, options.syncInterval, state.hasPendingOperations, state.isSyncing]);

  /**
   * Handle when the device comes online
   */
  const handleOnline = useCallback(() => {
    setState(prev => ({ ...prev, isOnline: true }));
    
    // Auto sync when coming back online
    if (options.autoSync && state.hasPendingOperations) {
      syncPendingOperations();
    }
  }, [options.autoSync, state.hasPendingOperations]);

  /**
   * Handle when the device goes offline
   */
  const handleOffline = useCallback(() => {
    setState(prev => ({ ...prev, isOnline: false }));
  }, []);

  /**
   * Load pending operations from storage
   */
  const loadPendingOperations = useCallback(async () => {
    try {
      const operations = await cacheService.get<PendingOperation[]>('pendingOperations') || [];
      
      setState(prev => ({
        ...prev,
        hasPendingOperations: operations.length > 0,
        pendingOperationsCount: operations.length
      }));
    } catch (error) {
      console.error('Failed to load pending operations:', error);
    }
  }, []);

  /**
   * Queue a new operation for later synchronization
   */
  const queueOperation = useCallback(async <T>(
    type: PendingOperation['type'],
    endpoint: string,
    data?: T,
    id?: string
  ) => {
    try {
      // Generate a unique ID if not provided
      const operationId = id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Load existing operations
      const operations = await cacheService.get<PendingOperation[]>('pendingOperations') || [];
      
      // Add new operation
      const newOperation: PendingOperation = {
        id: operationId,
        type,
        endpoint,
        data,
        timestamp: Date.now(),
        retryCount: 0
      };
      
      operations.push(newOperation);
      
      // Save back to storage
      await cacheService.set('pendingOperations', operations);
      
      // Update state
      setState(prev => ({
        ...prev,
        hasPendingOperations: true,
        pendingOperationsCount: operations.length
      }));
      
      return operationId;
    } catch (error) {
      console.error('Failed to queue operation:', error);
      throw error;
    }
  }, []);

  /**
   * Synchronize all pending operations with the server
   */
  const syncPendingOperations = useCallback(async (syncFunction?: (operations: PendingOperation[]) => Promise<string[]>) => {
    if (!navigator.onLine || state.isSyncing) return;
    
    setState(prev => ({ ...prev, isSyncing: true }));
    
    try {
      // Load operations
      const operations = await cacheService.get<PendingOperation[]>('pendingOperations') || [];
      
      if (operations.length === 0) {
        setState(prev => ({
          ...prev,
          isSyncing: false,
          hasPendingOperations: false,
          lastSyncTime: Date.now()
        }));
        return;
      }
      
      let successfulOperationIds: string[] = [];
      
      if (syncFunction) {
        // Use provided sync function
        successfulOperationIds = await syncFunction(operations);
      } else {
        // Default implementation: assume all operations succeed
        // In a real app, you'd implement actual API calls here
        successfulOperationIds = operations.map(op => op.id);
      }
      
      // Remove successful operations
      const remainingOperations = operations.filter(op => !successfulOperationIds.includes(op.id));
      
      // Save remaining operations
      await cacheService.set('pendingOperations', remainingOperations);
      
      // Update state
      setState(prev => ({
        ...prev,
        isSyncing: false,
        hasPendingOperations: remainingOperations.length > 0,
        pendingOperationsCount: remainingOperations.length,
        lastSyncTime: Date.now()
      }));
      
      return successfulOperationIds;
    } catch (error) {
      console.error('Failed to sync operations:', error);
      
      setState(prev => ({
        ...prev,
        isSyncing: false
      }));
      
      throw error;
    }
  }, [state.isSyncing]);

  /**
   * Get all pending operations
   */
  const getPendingOperations = useCallback(async () => {
    return await cacheService.get<PendingOperation[]>('pendingOperations') || [];
  }, []);

  /**
   * Clear all pending operations
   */
  const clearPendingOperations = useCallback(async () => {
    await cacheService.set('pendingOperations', []);
    
    setState(prev => ({
      ...prev,
      hasPendingOperations: false,
      pendingOperationsCount: 0
    }));
  }, []);

  /**
   * Store data for offline use
   */
  const storeOfflineData = useCallback(async <T>(key: string, data: T, ttl?: number) => {
    await cacheService.set(key, data, ttl);
  }, []);

  /**
   * Get stored offline data
   */
  const getOfflineData = useCallback(async <T>(key: string): Promise<T | null> => {
    return await cacheService.get<T>(key);
  }, []);

  /**
   * Remove stored offline data
   */
  const removeOfflineData = useCallback(async (key: string) => {
    await cacheService.remove(key);
  }, []);

  /**
   * Check if the application is currently online
   */
  const isOnline = useCallback(() => {
    return navigator.onLine;
  }, []);

  return {
    // State
    state,
    
    // Operation queue methods
    queueOperation,
    syncPendingOperations,
    getPendingOperations,
    clearPendingOperations,
    
    // Offline data storage methods
    storeOfflineData,
    getOfflineData,
    removeOfflineData,
    
    // Utility methods
    isOnline
  };
} 