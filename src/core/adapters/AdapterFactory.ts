/**
 * Data Adapter Factory
 * 
 * This file provides a factory for creating and managing different data adapter implementations.
 * It allows the application to switch between different data sources without changing consumer code.
 */

import { 
  DataAdapter, 
  AdapterType,
  BaseDataAdapter
} from './DataAdapter';
import { RestApiAdapter } from './RestApiAdapter';
import { FirebaseAdapter } from './FirebaseAdapter';
import { Firestore } from 'firebase/firestore';

/**
 * Configuration for creating adapters
 */
export interface AdapterConfig {
  type?: AdapterType;
  baseUrl?: string;
  headers?: Record<string, string>;
  cache?: {
    enabled: boolean;
    ttl?: number;
  };
  offlineSupport?: {
    enabled: boolean;
    syncInterval?: number;
  };
  firestore?: Firestore;
}

/**
 * Factory for creating data adapters
 */
export class AdapterFactory {
  private static instance: AdapterFactory;
  private adapters: Map<string, DataAdapter> = new Map();
  private defaultConfig: AdapterConfig;
  private firestoreInstance: Firestore | undefined;
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): AdapterFactory {
    if (!AdapterFactory.instance) {
      AdapterFactory.instance = new AdapterFactory();
    }
    return AdapterFactory.instance;
  }
  
  /**
   * Private constructor (use getInstance)
   */
  private constructor(defaultConfig: AdapterConfig = {}) {
    this.defaultConfig = defaultConfig;
  }
  
  /**
   * Set the default configuration
   */
  public setDefaultConfig(config: AdapterConfig): void {
    this.defaultConfig = {
      ...this.defaultConfig,
      ...config
    };
  }
  
  /**
   * Set the Firestore instance for Firebase adapters
   */
  public setFirestoreInstance(firestore: Firestore): void {
    this.firestoreInstance = firestore;
  }
  
  /**
   * Create a new adapter instance
   */
  public create(
    type: AdapterType, 
    config: AdapterConfig = {}
  ): DataAdapter {
    // Merge with default config
    const finalConfig = {
      ...this.defaultConfig,
      ...config
    };
    
    let adapter: DataAdapter;
    
    switch (type) {
      case 'rest':
        if (!finalConfig.baseUrl) {
          throw new Error('baseUrl is required for REST API adapter');
        }
        adapter = new RestApiAdapter(
          finalConfig.baseUrl,
          finalConfig.headers || {}
        );
        
        // Configure additional options if provided
        if (finalConfig.cache || finalConfig.offlineSupport) {
          adapter.configure({
            cache: finalConfig.cache,
            offlineSupport: finalConfig.offlineSupport
          });
        }
        break;
        
      case 'firebase':
        // Use the firestore instance from config or the default one
        const firestoreInstance = finalConfig.firestore || this.firestoreInstance;
        
        if (!firestoreInstance) {
          throw new Error('Firestore instance is required for Firebase adapter');
        }
        
        adapter = new FirebaseAdapter(
          firestoreInstance,
          finalConfig.headers || {}
        );
        
        // Configure additional options for Firebase adapter
        if (finalConfig.offlineSupport) {
          adapter.configure({
            offlineSupport: finalConfig.offlineSupport
          });
        }
        break;
        
      default:
        throw new Error(`Unsupported adapter type: ${type}`);
    }
    
    return adapter;
  }
  
  /**
   * Get an adapter instance, creating it if it doesn't exist
   */
  public getAdapter(
    type: AdapterType = 'rest',
    key: string = 'default',
    config: AdapterConfig = {}
  ): DataAdapter {
    const adapterKey = `${type}:${key}`;
    
    if (!this.adapters.has(adapterKey)) {
      // If it's a Firebase adapter, ensure we include the Firestore instance
      if (type === 'firebase' && this.firestoreInstance && !config.firestore) {
        config.firestore = this.firestoreInstance;
      }
      
      this.adapters.set(adapterKey, this.create(type, config));
    }
    
    return this.adapters.get(adapterKey)!;
  }
  
  /**
   * Register a custom adapter
   */
  public registerAdapter(
    type: AdapterType,
    key: string = 'default',
    adapter: DataAdapter
  ): void {
    const adapterKey = `${type}:${key}`;
    this.adapters.set(adapterKey, adapter);
  }
  
  /**
   * Remove an adapter instance
   */
  public removeAdapter(
    type: AdapterType,
    key: string = 'default'
  ): boolean {
    const adapterKey = `${type}:${key}`;
    return this.adapters.delete(adapterKey);
  }
}

/**
 * Convenience function to get a data adapter
 */
export function useAdapter(config: Partial<AdapterConfig> = {}): DataAdapter {
  return AdapterFactory.getInstance().getAdapter(
    config.type || 'rest', 
    'default', 
    config
  );
} 