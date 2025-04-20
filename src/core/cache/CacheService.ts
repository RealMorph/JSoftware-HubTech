/**
 * Cache Service
 * 
 * This service provides a unified caching layer for data persistence.
 * It supports multiple storage options (memory, localStorage, and IndexedDB)
 * with configurable expiration and automatic pruning.
 */

interface CacheOptions {
  storage: 'memory' | 'localStorage' | 'indexedDB';
  ttl: number; // Time to live in milliseconds
  namespace: string; // To avoid collisions with other cached data
  maxSize?: number; // Maximum number of items in cache
  compression?: boolean; // Whether to compress data (for localStorage/indexedDB)
  priority?: 'lru' | 'fifo' | 'lfu'; // Cache eviction policy
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  accessed?: number; // For LRU
  accessCount?: number; // For LFU
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  oldestItem: number;
  newestItem: number;
}

/**
 * Service for caching data with multiple storage options
 */
export class CacheService {
  private static instance: CacheService;
  private options: CacheOptions;
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    oldestItem: Date.now(),
    newestItem: Date.now()
  };
  private db: IDBDatabase | null = null;
  private dbReady = false;
  private dbPromise: Promise<IDBDatabase> | null = null;

  // Default options
  private static readonly DEFAULT_OPTIONS: CacheOptions = {
    storage: 'localStorage', // Default to localStorage for simplicity
    ttl: 30 * 60 * 1000, // 30 minutes
    namespace: 'app-cache',
    maxSize: 1000,
    compression: false,
    priority: 'lru'
  };

  /**
   * Private constructor to enforce singleton
   */
  private constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      ...CacheService.DEFAULT_OPTIONS,
      ...options
    };

    // If using IndexedDB, initialize the database
    if (this.options.storage === 'indexedDB') {
      this.initializeIndexedDB();
    }

    // Set up cache pruning
    this.setupPruning();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(options?: Partial<CacheOptions>): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(options);
    } else if (options) {
      // Update options if provided
      CacheService.instance.configure(options);
    }
    return CacheService.instance;
  }

  /**
   * Reconfigure the cache service
   */
  public configure(options: Partial<CacheOptions>): void {
    const previousStorage = this.options.storage;
    this.options = {
      ...this.options,
      ...options
    };

    // If storage type has changed, we need to initialize it
    if (options.storage && options.storage !== previousStorage) {
      if (options.storage === 'indexedDB') {
        this.initializeIndexedDB();
      }
    }
  }

  /**
   * Initialize IndexedDB
   */
  private initializeIndexedDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB is not supported in this browser, falling back to localStorage');
        this.options.storage = 'localStorage';
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = window.indexedDB.open(this.options.namespace, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.dbReady = true;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('Failed to open IndexedDB:', event);
        this.options.storage = 'localStorage';
        reject(new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  /**
   * Set up periodic cache pruning
   */
  private setupPruning(): void {
    // Prune expired items every minute
    setInterval(() => {
      this.prune();
    }, 60 * 1000);
  }

  /**
   * Remove expired items from the cache
   */
  public prune(): Promise<void> {
    const now = Date.now();

    switch (this.options.storage) {
      case 'memory':
        // Remove expired items from memory cache
        for (const [key, item] of this.memoryCache.entries()) {
          if (now > item.expiry) {
            this.memoryCache.delete(key);
          }
        }
        break;

      case 'localStorage':
        // Scan localStorage for expired items
        this.pruneLocalStorage(now);
        break;

      case 'indexedDB':
        // Prune IndexedDB (async)
        return this.pruneIndexedDB(now);
    }

    return Promise.resolve();
  }

  /**
   * Remove expired items from localStorage
   */
  private pruneLocalStorage(now: number): void {
    const prefix = `${this.options.namespace}:`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '');
          if (now > item.expiry) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // Invalid item, remove it
          localStorage.removeItem(key);
        }
      }
    }
  }

  /**
   * Remove expired items from IndexedDB
   */
  private async pruneIndexedDB(now: number): Promise<void> {
    if (!this.dbReady) {
      try {
        await this.initializeIndexedDB();
      } catch {
        return;
      }
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const item = cursor.value;
          if (now > item.expiry) {
            cursor.delete();
          }
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error('Failed to prune IndexedDB'));
    });
  }

  /**
   * Set an item in the cache
   */
  public async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const now = Date.now();
    const expiry = now + (ttl || this.options.ttl);
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiry,
      accessed: now,
      accessCount: 1
    };

    const fullKey = `${this.options.namespace}:${key}`;

    switch (this.options.storage) {
      case 'memory':
        // Check if we need to evict items
        if (this.options.maxSize && this.memoryCache.size >= this.options.maxSize) {
          this.evictItems();
        }
        this.memoryCache.set(fullKey, item);
        break;

      case 'localStorage':
        try {
          localStorage.setItem(fullKey, JSON.stringify(item));
        } catch (e) {
          // Local storage might be full, try to clean up
          this.pruneLocalStorage(now);
          try {
            localStorage.setItem(fullKey, JSON.stringify(item));
          } catch (e) {
            console.warn('Failed to store item in localStorage, it might be full');
          }
        }
        break;

      case 'indexedDB':
        await this.setInIndexedDB(fullKey, item);
        break;
    }

    // Update stats
    this.stats.size++;
    this.stats.newestItem = now;
    if (this.stats.oldestItem === 0) {
      this.stats.oldestItem = now;
    }
  }

  /**
   * Set an item in IndexedDB
   */
  private async setInIndexedDB<T>(key: string, item: CacheItem<T>): Promise<void> {
    if (!this.dbReady) {
      try {
        await this.initializeIndexedDB();
      } catch {
        // Fall back to localStorage
        localStorage.setItem(key, JSON.stringify(item));
        return;
      }
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({ key, ...item });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.warn('Failed to store item in IndexedDB, falling back to localStorage');
        try {
          localStorage.setItem(key, JSON.stringify(item));
        } catch (e) {
          console.warn('Failed to store item in localStorage');
        }
        reject(new Error('Failed to store in IndexedDB'));
      };
    });
  }

  /**
   * Get an item from the cache
   */
  public async get<T>(key: string): Promise<T | null> {
    const fullKey = `${this.options.namespace}:${key}`;
    const now = Date.now();

    switch (this.options.storage) {
      case 'memory':
        return this.getFromMemory<T>(fullKey, now);

      case 'localStorage':
        return this.getFromLocalStorage<T>(fullKey, now);

      case 'indexedDB':
        return this.getFromIndexedDB<T>(fullKey, now);
    }
  }

  /**
   * Get an item from memory cache
   */
  private getFromMemory<T>(key: string, now: number): T | null {
    const item = this.memoryCache.get(key) as CacheItem<T> | undefined;

    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (now > item.expiry) {
      this.memoryCache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update LRU/LFU metadata
    item.accessed = now;
    item.accessCount = (item.accessCount || 0) + 1;

    this.stats.hits++;
    return item.data;
  }

  /**
   * Get an item from localStorage
   */
  private getFromLocalStorage<T>(key: string, now: number): T | null {
    try {
      const json = localStorage.getItem(key);
      if (!json) {
        this.stats.misses++;
        return null;
      }

      const item = JSON.parse(json) as CacheItem<T>;

      if (now > item.expiry) {
        localStorage.removeItem(key);
        this.stats.misses++;
        return null;
      }

      // Update LRU/LFU metadata
      item.accessed = now;
      item.accessCount = (item.accessCount || 0) + 1;
      localStorage.setItem(key, JSON.stringify(item));

      this.stats.hits++;
      return item.data;
    } catch (e) {
      console.warn('Failed to parse cached item:', e);
      localStorage.removeItem(key);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Get an item from IndexedDB
   */
  private async getFromIndexedDB<T>(key: string, now: number): Promise<T | null> {
    if (!this.dbReady) {
      try {
        await this.initializeIndexedDB();
      } catch {
        // Fall back to localStorage
        return this.getFromLocalStorage<T>(key, now);
      }
    }

    return new Promise((resolve) => {
      if (!this.db) {
        this.stats.misses++;
        resolve(null);
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = (event) => {
        const item = (event.target as IDBRequest).result as { key: string } & CacheItem<T>;
        
        if (!item) {
          this.stats.misses++;
          resolve(null);
          return;
        }

        if (now > item.expiry) {
          store.delete(key);
          this.stats.misses++;
          resolve(null);
          return;
        }

        // Update LRU/LFU metadata
        item.accessed = now;
        item.accessCount = (item.accessCount || 0) + 1;
        store.put(item);

        this.stats.hits++;
        resolve(item.data);
      };

      request.onerror = () => {
        console.warn('Failed to get item from IndexedDB, falling back to localStorage');
        resolve(this.getFromLocalStorage<T>(key, now));
      };
    });
  }

  /**
   * Remove an item from the cache
   */
  public async remove(key: string): Promise<void> {
    const fullKey = `${this.options.namespace}:${key}`;

    switch (this.options.storage) {
      case 'memory':
        this.memoryCache.delete(fullKey);
        break;

      case 'localStorage':
        localStorage.removeItem(fullKey);
        break;

      case 'indexedDB':
        if (!this.dbReady) {
          try {
            await this.initializeIndexedDB();
          } catch {
            localStorage.removeItem(fullKey);
            return;
          }
        }

        if (!this.db) return;

        return new Promise((resolve) => {
          if (!this.db) {
            resolve();
            return;
          }

          const transaction = this.db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          store.delete(fullKey);

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => {
            localStorage.removeItem(fullKey);
            resolve();
          };
        });
    }
  }

  /**
   * Clear all items in the cache
   */
  public async clear(): Promise<void> {
    switch (this.options.storage) {
      case 'memory':
        this.memoryCache.clear();
        break;

      case 'localStorage':
        const prefix = `${this.options.namespace}:`;
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        }
        break;

      case 'indexedDB':
        if (!this.dbReady) {
          try {
            await this.initializeIndexedDB();
          } catch {
            // Clear localStorage as fallback
            this.clear();
            return;
          }
        }

        if (!this.db) return;

        return new Promise((resolve) => {
          if (!this.db) {
            resolve();
            return;
          }

          const transaction = this.db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          const request = store.clear();

          request.onsuccess = () => resolve();
          request.onerror = () => {
            // Fall back to clearing localStorage
            this.options.storage = 'localStorage';
            this.clear();
            resolve();
          };
        });
    }

    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      oldestItem: 0,
      newestItem: 0
    };
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Evict items based on the cache priority policy
   */
  private evictItems(): void {
    if (this.options.storage !== 'memory' || this.memoryCache.size === 0) {
      return;
    }

    // Determine how many items to evict (about 10% of max size)
    const toEvict = Math.max(1, Math.floor(this.options.maxSize! * 0.1));

    switch (this.options.priority) {
      case 'lru': // Least Recently Used
        this.evictLRU(toEvict);
        break;
      case 'fifo': // First In, First Out
        this.evictFIFO(toEvict);
        break;
      case 'lfu': // Least Frequently Used
        this.evictLFU(toEvict);
        break;
    }
  }

  /**
   * Evict items using LRU policy
   */
  private evictLRU(count: number): void {
    const items = Array.from(this.memoryCache.entries())
      .sort((a, b) => (a[1].accessed || 0) - (b[1].accessed || 0))
      .slice(0, count);

    for (const [key] of items) {
      this.memoryCache.delete(key);
    }
  }

  /**
   * Evict items using FIFO policy
   */
  private evictFIFO(count: number): void {
    const items = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, count);

    for (const [key] of items) {
      this.memoryCache.delete(key);
    }
  }

  /**
   * Evict items using LFU policy
   */
  private evictLFU(count: number): void {
    const items = Array.from(this.memoryCache.entries())
      .sort((a, b) => (a[1].accessCount || 0) - (b[1].accessCount || 0))
      .slice(0, count);

    for (const [key] of items) {
      this.memoryCache.delete(key);
    }
  }
} 