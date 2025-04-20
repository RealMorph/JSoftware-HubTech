import { useCallback, useEffect, useState } from 'react';

// Storage types supported by the utility
export enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage',
  INDEXED_DB = 'indexedDB',
}

// Configuration options for storage
export interface StorageConfig {
  // The storage type to use
  type?: StorageType;
  // Key prefix for all stored items to avoid collisions
  prefix?: string;
  // Time-to-live in milliseconds (items will expire after this time)
  ttl?: number;
  // Whether to encrypt the stored data
  encrypt?: boolean;
  // Custom encryption key (a default will be used if not provided)
  encryptionKey?: string;
  // Database name for IndexedDB
  dbName?: string;
  // Store name for IndexedDB
  storeName?: string;
}

// Default configuration
const DEFAULT_CONFIG: StorageConfig = {
  type: StorageType.LOCAL,
  prefix: 'app_',
  ttl: 0, // No expiration by default
  encrypt: false,
  dbName: 'appDatabase',
  storeName: 'appStore',
};

// Error types for storage operations
export enum StorageErrorType {
  STORAGE_UNAVAILABLE = 'STORAGE_UNAVAILABLE',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  ITEM_EXPIRED = 'ITEM_EXPIRED',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  DECRYPTION_ERROR = 'DECRYPTION_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  INDEXED_DB_ERROR = 'INDEXED_DB_ERROR',
}

// Storage error class
export class StorageError extends Error {
  type: StorageErrorType;

  constructor(type: StorageErrorType, message: string) {
    super(message);
    this.type = type;
    this.name = 'StorageError';
  }
}

// Interface for stored item metadata
interface StoredItemMeta {
  timestamp: number;
  expiry: number | null;
  encrypted: boolean;
}

// Interface for stored item with value and metadata
interface StoredItem<T> {
  value: T;
  meta: StoredItemMeta;
}

// Simple encryption/decryption utility
const encryptionUtil = {
  // Generate a simple hash for the encryption key
  generateKeyHash(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  },

  // Basic XOR encryption (for demonstration - use a proper encryption library in production)
  encrypt(data: string, key: string): string {
    const keyHash = this.generateKeyHash(key);
    let result = '';
    
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ keyHash.charCodeAt(i % keyHash.length);
      result += String.fromCharCode(charCode);
    }
    
    return btoa(result); // Base64 encode the result
  },

  // Basic XOR decryption
  decrypt(data: string, key: string): string {
    try {
      const keyHash = this.generateKeyHash(key);
      const decodedData = atob(data); // Base64 decode
      let result = '';
      
      for (let i = 0; i < decodedData.length; i++) {
        const charCode = decodedData.charCodeAt(i) ^ keyHash.charCodeAt(i % keyHash.length);
        result += String.fromCharCode(charCode);
      }
      
      return result;
    } catch (error) {
      throw new StorageError(
        StorageErrorType.DECRYPTION_ERROR,
        'Failed to decrypt data'
      );
    }
  }
};

/**
 * Class to create a persistent storage instance
 */
export class PersistentStorage {
  private config: StorageConfig;
  private indexedDB: IDBDatabase | null = null;
  private dbInitPromise: Promise<boolean> | null = null;

  constructor(config: StorageConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize IndexedDB if that's the chosen storage
    if (this.config.type === StorageType.INDEXED_DB) {
      this.initIndexedDB();
    }
  }

  /**
   * Initialize IndexedDB
   */
  private initIndexedDB(): Promise<boolean> {
    if (this.dbInitPromise) return this.dbInitPromise;

    this.dbInitPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new StorageError(
          StorageErrorType.STORAGE_UNAVAILABLE,
          'IndexedDB is not available in this browser'
        ));
        return;
      }

      const dbName = this.config.dbName || DEFAULT_CONFIG.dbName!;
      const storeName = this.config.storeName || DEFAULT_CONFIG.storeName!;
      const request = indexedDB.open(dbName, 1);

      request.onerror = () => {
        reject(new StorageError(
          StorageErrorType.INDEXED_DB_ERROR,
          'Failed to open IndexedDB'
        ));
      };

      request.onsuccess = (event) => {
        this.indexedDB = (event.target as IDBRequest).result;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
    });

    return this.dbInitPromise;
  }

  /**
   * Check if storage is available
   */
  private isStorageAvailable(): boolean {
    const storageType = this.config.type || DEFAULT_CONFIG.type!;
    
    try {
      if (storageType === StorageType.INDEXED_DB) {
        return !!window.indexedDB;
      }
      
      const storage = window[storageType as 'localStorage' | 'sessionStorage'];
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get the full key with prefix
   */
  private getFullKey(key: string): string {
    const prefix = this.config.prefix || DEFAULT_CONFIG.prefix!;
    return `${prefix}${key}`;
  }

  /**
   * Check if an item has expired
   */
  private isExpired(meta: StoredItemMeta): boolean {
    if (!meta.expiry) return false;
    return Date.now() > meta.expiry;
  }

  /**
   * Save an item to storage
   */
  async setItem<T>(key: string, value: T, options?: Partial<StorageConfig>): Promise<void> {
    const mergedConfig = { ...this.config, ...options };
    const fullKey = this.getFullKey(key);
    
    if (!this.isStorageAvailable()) {
      throw new StorageError(
        StorageErrorType.STORAGE_UNAVAILABLE,
        `Storage type ${mergedConfig.type} is not available`
      );
    }

    // Calculate expiry time if TTL is provided
    const timestamp = Date.now();
    const expiry = mergedConfig.ttl && mergedConfig.ttl > 0 
      ? timestamp + mergedConfig.ttl 
      : null;

    // Create the stored item object
    const item: StoredItem<T> = {
      value,
      meta: {
        timestamp,
        expiry,
        encrypted: mergedConfig.encrypt === true,
      }
    };

    // Serialize the data
    let serializedData = JSON.stringify(item);
    
    // Encrypt the data if needed
    if (mergedConfig.encrypt) {
      try {
        const encryptionKey = mergedConfig.encryptionKey || 'defaultKey';
        serializedData = encryptionUtil.encrypt(serializedData, encryptionKey);
      } catch (error) {
        throw new StorageError(
          StorageErrorType.ENCRYPTION_ERROR,
          'Failed to encrypt data'
        );
      }
    }

    // Store the data based on storage type
    if (mergedConfig.type === StorageType.INDEXED_DB) {
      await this.setItemIndexedDB(fullKey, serializedData);
    } else {
      const storage = window[mergedConfig.type as 'localStorage' | 'sessionStorage'];
      storage.setItem(fullKey, serializedData);
    }
  }

  /**
   * Save an item to IndexedDB
   */
  private async setItemIndexedDB(key: string, value: string): Promise<void> {
    await this.initIndexedDB();
    
    if (!this.indexedDB) {
      throw new StorageError(
        StorageErrorType.INDEXED_DB_ERROR,
        'IndexedDB is not initialized'
      );
    }

    return new Promise((resolve, reject) => {
      const storeName = this.config.storeName || DEFAULT_CONFIG.storeName!;
      const transaction = this.indexedDB!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);
      
      request.onerror = () => {
        reject(new StorageError(
          StorageErrorType.INDEXED_DB_ERROR,
          'Failed to store data in IndexedDB'
        ));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Get an item from storage
   */
  async getItem<T>(key: string, options?: Partial<StorageConfig>): Promise<T | null> {
    const mergedConfig = { ...this.config, ...options };
    const fullKey = this.getFullKey(key);
    
    if (!this.isStorageAvailable()) {
      throw new StorageError(
        StorageErrorType.STORAGE_UNAVAILABLE,
        `Storage type ${mergedConfig.type} is not available`
      );
    }

    let serializedData: string | null;
    
    // Get the data based on storage type
    if (mergedConfig.type === StorageType.INDEXED_DB) {
      serializedData = await this.getItemIndexedDB(fullKey);
    } else {
      const storage = window[mergedConfig.type as 'localStorage' | 'sessionStorage'];
      serializedData = storage.getItem(fullKey);
    }

    if (!serializedData) {
      return null;
    }

    try {
      // Decrypt the data if it was encrypted
      if (mergedConfig.encrypt) {
        const encryptionKey = mergedConfig.encryptionKey || 'defaultKey';
        serializedData = encryptionUtil.decrypt(serializedData, encryptionKey);
      }

      // Parse the data
      const item = JSON.parse(serializedData) as StoredItem<T>;
      
      // Check if the item has expired
      if (this.isExpired(item.meta)) {
        // Remove the expired item
        this.removeItem(key);
        throw new StorageError(
          StorageErrorType.ITEM_EXPIRED,
          `Item with key ${key} has expired`
        );
      }
      
      return item.value;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      
      throw new StorageError(
        StorageErrorType.PARSE_ERROR,
        `Failed to parse data for key ${key}`
      );
    }
  }

  /**
   * Get an item from IndexedDB
   */
  private async getItemIndexedDB(key: string): Promise<string | null> {
    await this.initIndexedDB();
    
    if (!this.indexedDB) {
      throw new StorageError(
        StorageErrorType.INDEXED_DB_ERROR,
        'IndexedDB is not initialized'
      );
    }

    return new Promise((resolve, reject) => {
      const storeName = this.config.storeName || DEFAULT_CONFIG.storeName!;
      const transaction = this.indexedDB!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onerror = () => {
        reject(new StorageError(
          StorageErrorType.INDEXED_DB_ERROR,
          'Failed to get data from IndexedDB'
        ));
      };
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  /**
   * Remove an item from storage
   */
  async removeItem(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    
    if (!this.isStorageAvailable()) {
      throw new StorageError(
        StorageErrorType.STORAGE_UNAVAILABLE,
        `Storage type ${this.config.type} is not available`
      );
    }

    // Remove the item based on storage type
    if (this.config.type === StorageType.INDEXED_DB) {
      await this.removeItemIndexedDB(fullKey);
    } else {
      const storage = window[this.config.type as 'localStorage' | 'sessionStorage'];
      storage.removeItem(fullKey);
    }
  }

  /**
   * Remove an item from IndexedDB
   */
  private async removeItemIndexedDB(key: string): Promise<void> {
    await this.initIndexedDB();
    
    if (!this.indexedDB) {
      throw new StorageError(
        StorageErrorType.INDEXED_DB_ERROR,
        'IndexedDB is not initialized'
      );
    }

    return new Promise((resolve, reject) => {
      const storeName = this.config.storeName || DEFAULT_CONFIG.storeName!;
      const transaction = this.indexedDB!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onerror = () => {
        reject(new StorageError(
          StorageErrorType.INDEXED_DB_ERROR,
          'Failed to remove data from IndexedDB'
        ));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Clear all items with the configured prefix
   */
  async clear(): Promise<void> {
    if (!this.isStorageAvailable()) {
      throw new StorageError(
        StorageErrorType.STORAGE_UNAVAILABLE,
        `Storage type ${this.config.type} is not available`
      );
    }

    const prefix = this.config.prefix || DEFAULT_CONFIG.prefix!;
    
    // Clear items based on storage type
    if (this.config.type === StorageType.INDEXED_DB) {
      await this.clearIndexedDB(prefix);
    } else {
      const storage = window[this.config.type as 'localStorage' | 'sessionStorage'];
      
      // Find all keys with the prefix
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all matching items
      keysToRemove.forEach(key => {
        storage.removeItem(key);
      });
    }
  }

  /**
   * Clear all items with the prefix from IndexedDB
   */
  private async clearIndexedDB(prefix: string): Promise<void> {
    await this.initIndexedDB();
    
    if (!this.indexedDB) {
      throw new StorageError(
        StorageErrorType.INDEXED_DB_ERROR,
        'IndexedDB is not initialized'
      );
    }

    return new Promise((resolve, reject) => {
      const storeName = this.config.storeName || DEFAULT_CONFIG.storeName!;
      const transaction = this.indexedDB!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.openCursor();
      
      request.onerror = () => {
        reject(new StorageError(
          StorageErrorType.INDEXED_DB_ERROR,
          'Failed to open cursor in IndexedDB'
        ));
      };
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (cursor) {
          if (typeof cursor.key === 'string' && cursor.key.startsWith(prefix)) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }
}

/**
 * Create a persistent storage instance with the given configuration
 */
export function createStorage(config?: StorageConfig): PersistentStorage {
  return new PersistentStorage(config);
}

/**
 * Hook for using persistent storage in React components
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  config?: StorageConfig
): [T, (value: T | ((prevValue: T) => T)) => void, boolean, Error | null] {
  const storage = useState(() => createStorage(config))[0];
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load the value from storage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const storedValue = await storage.getItem<T>(key);
        if (storedValue !== null) {
          setValue(storedValue);
        }
        setLoading(false);
      } catch (err) {
        // If item expired or another expected error, just use initial value
        if (err instanceof StorageError && 
            (err.type === StorageErrorType.ITEM_EXPIRED || 
             err.type === StorageErrorType.ITEM_NOT_FOUND)) {
          setLoading(false);
        } else {
          console.error('Error loading from persistent storage:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    };

    loadValue();
  }, [key, storage]);

  // Update function that also persists the new value
  const updateValue = useCallback((newValue: T | ((prevValue: T) => T)) => {
    setValue(prevValue => {
      // Handle function updates
      const updatedValue = typeof newValue === 'function'
        ? (newValue as ((prevValue: T) => T))(prevValue)
        : newValue;
      
      // Persist the new value
      storage.setItem(key, updatedValue).catch(err => {
        console.error('Error saving to persistent storage:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });
      
      return updatedValue;
    });
  }, [key, storage]);

  return [value, updateValue, loading, error];
}

// Example usage:
/*
// Create a storage instance
const storage = createStorage({
  type: StorageType.LOCAL,
  prefix: 'myApp_',
  ttl: 86400000, // 24 hours
  encrypt: true,
  encryptionKey: 'mySecretKey'
});

// Store data
await storage.setItem('user', { id: 1, name: 'John' });

// Retrieve data
const user = await storage.getItem('user');

// Remove data
await storage.removeItem('user');

// Clear all data with prefix
await storage.clear();

// Using the React hook
const [user, setUser, loading, error] = usePersistentState('user', null, {
  type: StorageType.LOCAL,
  encrypt: true
});
*/ 