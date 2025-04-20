# Data Caching and Persistence

This module provides a comprehensive system for data caching, offline persistence, and synchronization for the application. It is designed to enhance performance, reduce server load, and provide a seamless offline experience.

## Architecture Overview

The data caching and persistence system is built on three main components:

1. **CacheService**: A unified caching layer supporting multiple storage options
2. **CacheableAdapter**: A wrapper for data adapters that adds caching capabilities
3. **Offline Storage**: Utilities for working with offline data and synchronization

## Key Features

- Multiple storage options (memory, localStorage, IndexedDB)
- Configurable cache TTL (Time To Live) for different data types
- Configurable eviction policies (LRU, FIFO, LFU)
- Automatic cache invalidation on data updates
- Offline operation support with background synchronization
- Type-safe API with TypeScript support
- Compatible with all adapter types (REST, Firebase, etc.)
- User-specific cache namespacing
- Cache statistics for monitoring
- Transparent API - minimal changes to existing code

## Usage Examples

### Basic Usage with Hooks

```tsx
import { useCachedAdapter } from '../core/hooks/useCachedAdapter';

function UserList() {
  // Use a cached adapter for user data
  const { list, isLoading } = useCachedAdapter<User>(
    { type: 'firebase' }, // adapter config
    {}, // cache options
    'users' // predefined cache config for users
  );
  
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await list('users');
      setUsers(response.data);
    };
    
    fetchUsers();
  }, []);
  
  return (
    <div>
      {/* Render user list */}
    </div>
  );
}
```

### Creating a Model Adapter

```tsx
import { createCachedModelAdapter } from '../core/hooks/useCachedAdapter';

// Create a type-safe user model adapter with caching
export const useUserModel = createCachedModelAdapter<User, CreateUserDto, UpdateUserDto>(
  'users',
  'users', // use the predefined 'users' cache configuration
  { type: 'firebase' }
);

function UserProfile({ userId }: { userId: string }) {
  const userModel = useUserModel();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const response = await userModel.getById(userId);
      setUser(response.data);
    };
    
    fetchUser();
  }, [userId]);
  
  return (
    <div>
      {/* Render user profile */}
    </div>
  );
}
```

### Working with Offline Data

```tsx
import { useOfflineStorage } from '../core/hooks/useOfflineStorage';

function OfflineCapableForm() {
  const offlineStorage = useOfflineStorage({
    namespace: 'form-data',
    autoSync: true,
    storage: 'indexedDB'
  });
  
  const saveData = async (formData: FormData) => {
    if (offlineStorage.state.isOnline) {
      // We're online, save directly
      await api.saveForm(formData);
    } else {
      // We're offline, queue for later
      await offlineStorage.queueOperation('create', 'forms', formData);
      // Also store the data locally for immediate access
      await offlineStorage.storeOfflineData(`form-${Date.now()}`, formData);
    }
  };
  
  return (
    <div>
      <form onSubmit={saveData}>
        {/* Form fields */}
      </form>
      
      {!offlineStorage.state.isOnline && (
        <div className="offline-indicator">
          You are currently offline. Your changes will be saved when you reconnect.
        </div>
      )}
      
      {offlineStorage.state.hasPendingOperations && (
        <div className="sync-status">
          {offlineStorage.state.pendingOperationsCount} changes pending synchronization
          <button onClick={() => offlineStorage.syncPendingOperations()}>
            Sync Now
          </button>
        </div>
      )}
    </div>
  );
}
```

## CacheService

The `CacheService` is a singleton service that manages the cache storage. It supports three storage types:

- **Memory**: In-memory cache (fastest, but cleared on page refresh)
- **localStorage**: Browser's localStorage (persistent, but limited size)
- **IndexedDB**: Browser's IndexedDB (persistent, larger capacity)

### Key Features

- **TTL**: All cached items have a configurable expiration time
- **Eviction Policies**: Support for LRU, FIFO, and LFU eviction strategies
- **Automatic Pruning**: Expired items are automatically removed
- **Namespacing**: Cache keys are namespaced to avoid collisions
- **Statistics**: Cache hits, misses, and size tracking
- **Fallback Mechanism**: Falls back to localStorage if IndexedDB isn't available

## CacheableAdapter

The `CacheableAdapter` is a wrapper for data adapters that adds caching capabilities. It implements the same `DataAdapter` interface, making it a drop-in replacement for existing adapters.

### Key Features

- **Transparent Caching**: Automatically caches responses from the underlying adapter
- **Operation Configuration**: Fine-grained control over which operations to cache
- **Cache Invalidation**: Automatically invalidates cache on data updates
- **Custom Cache Keys**: Support for custom cache key generation
- **Cache Statistics**: Access to cache hit/miss statistics

## Offline Storage

The `useOfflineStorage` hook provides utilities for working with offline data and synchronization. It helps manage offline operations queue and provides a way to store and retrieve data while offline.

### Key Features

- **Operation Queue**: Automatically queues operations for later synchronization
- **Background Sync**: Periodically attempts to synchronize when online
- **State Tracking**: Tracks online status and pending operations
- **Automatic Sync**: Synchronizes automatically when coming back online
- **Custom Sync Logic**: Support for custom synchronization functions

## Configuration Options

### CacheService Options

```typescript
interface CacheOptions {
  storage: 'memory' | 'localStorage' | 'indexedDB';
  ttl: number; // Time to live in milliseconds
  namespace: string; // To avoid collisions with other cached data
  maxSize?: number; // Maximum number of items in cache
  compression?: boolean; // Whether to compress data
  priority?: 'lru' | 'fifo' | 'lfu'; // Cache eviction policy
}
```

### CacheableAdapter Options

```typescript
interface CacheableAdapterOptions {
  enabled?: boolean; // Whether to enable caching
  ttl?: number; // Time to live in milliseconds
  namespace?: string; // Namespace for the cache keys
  storage?: 'memory' | 'localStorage' | 'indexedDB'; // Storage type
  maxSize?: number; // Maximum size of the cache
  priority?: 'lru' | 'fifo' | 'lfu'; // Cache eviction policy
  offlineSupport?: boolean; // Whether to enable offline support
  operations?: { /* Configuration for caching operations */ };
  keyFunctions?: { /* Custom cache key generation functions */ };
}
```

### OfflineStorage Options

```typescript
interface OfflineStorageOptions {
  namespace: string; // Namespace for offline data
  storage?: 'localStorage' | 'indexedDB'; // Storage type
  autoSync?: boolean; // Whether to automatically sync when online
  syncInterval?: number; // Sync interval in milliseconds
}
```

## Best Practices

1. **Use appropriate TTL values** based on how frequently data changes:
   - User data: Short TTL (5-15 minutes)
   - Reference data: Long TTL (hours or days)
   - Public content: Medium TTL (30-60 minutes)

2. **Choose storage type** based on data size and usage:
   - Small, frequently accessed data: Memory or localStorage
   - Large datasets: IndexedDB
   - Critical data: IndexedDB with failover to localStorage

3. **Implement proper cache invalidation** for data that can be updated from multiple sources

4. **Use user-specific namespaces** for private data to prevent leakage between users

5. **Monitor cache statistics** to optimize cache settings based on real usage patterns

6. **Implement timeouts and error handling** for all cache operations

7. **Test offline scenarios** thoroughly to ensure a seamless offline experience 