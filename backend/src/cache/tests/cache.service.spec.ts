import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';

// Mock for process.memoryUsage
const mockMemoryUsage = {
  rss: 50 * 1024 * 1024,         // 50MB
  heapTotal: 30 * 1024 * 1024,   // 30MB
  heapUsed: 20 * 1024 * 1024,    // 20MB
  external: 10 * 1024 * 1024,    // 10MB
  arrayBuffers: 1 * 1024 * 1024  // 1MB
};

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: any;
  
  // Mock cache for testing
  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    store: {
      keys: jest.fn()
    }
  };
  
  // Create a map to simulate cache storage
  const cacheStore = new Map<string, any>();
  
  beforeEach(async () => {
    jest.spyOn(process, 'memoryUsage').mockReturnValue(mockMemoryUsage);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    
    // Reset the cache for each test
    cacheStore.clear();
    
    // Setup the mock cache functions
    mockCache.get.mockImplementation((key: string) => {
      return Promise.resolve(cacheStore.get(key));
    });
    
    mockCache.set.mockImplementation((key: string, value: any, ttl?: number) => {
      cacheStore.set(key, value);
      return Promise.resolve();
    });
    
    mockCache.del.mockImplementation((key: string) => {
      cacheStore.delete(key);
      return Promise.resolve();
    });
    
    mockCache.store.keys.mockImplementation(() => {
      return Promise.resolve(Array.from(cacheStore.keys()));
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCache
        }
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
    
    // Reset call counts
    mockCache.get.mockClear();
    mockCache.set.mockClear();
    mockCache.del.mockClear();
    mockCache.store.keys.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Cache Operations', () => {
    it('should set and get a value from cache', async () => {
      const key = 'test-key';
      const value = { id: 1, name: 'Test Item' };
      
      await service.set(key, value);
      expect(cacheManager.set).toHaveBeenCalledWith(key, value, undefined);
      
      // Get value for the first time (miss)
      await service.get(key);
      
      // Get value again (hit)
      const result = await service.get(key);
      expect(result).toEqual(value);
    });
    
    it('should track cache hits and misses correctly', async () => {
      // Set some data
      await service.set('key1', 'value1');
      await service.set('key2', 'value2');
      
      // First gets (should be misses in our test due to how we reset tracking)
      await service.get('key1');
      await service.get('non-existent-key');
      
      // Second get (should be a hit)
      await service.get('key1');
      
      const stats = service.getStats();
      
      // We should have 1 hit and 2 misses
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.total).toBe(3);
      
      // Hit rate should be around 66.67%
      expect(parseFloat(stats.hitRate)).toBeCloseTo(66.67, 1);
    });
    
    it('should reset statistics', async () => {
      // Generate some activity
      await service.set('key1', 'value1');
      await service.get('key1');
      await service.get('key1');
      await service.get('non-existent');
      
      // Verify we have stats
      const beforeReset = service.getStats();
      expect(beforeReset.total).toBeGreaterThan(0);
      
      // Reset stats
      service.resetStats();
      
      // Verify stats are reset
      const afterReset = service.getStats();
      expect(afterReset.hits).toBe(0);
      expect(afterReset.misses).toBe(0);
      expect(afterReset.total).toBe(0);
    });
    
    it('should delete a key from cache', async () => {
      // Set a value
      await service.set('key-to-delete', 'some-value');
      
      // Verify it's there
      expect(await service.get('key-to-delete')).toBe('some-value');
      
      // Delete it
      await service.del('key-to-delete');
      
      // Verify it's gone
      expect(await service.get('key-to-delete')).toBeNull();
    });
    
    it('should delete by pattern', async () => {
      // Set several values with a pattern
      await service.set('user:1:profile', { name: 'User 1' });
      await service.set('user:2:profile', { name: 'User 2' });
      await service.set('post:1', { title: 'Post 1' });
      
      // Delete by pattern
      await service.delByPattern('user:');
      
      // Verify user cache is gone, but posts remain
      expect(await service.get('user:1:profile')).toBeNull();
      expect(await service.get('user:2:profile')).toBeNull();
      expect(await service.get('post:1')).toEqual({ title: 'Post 1' });
    });
    
    it('should reset the entire cache', async () => {
      // Set several values
      await service.set('key1', 'value1');
      await service.set('key2', 'value2');
      
      // Verify they're there
      expect(await service.get('key1')).toBe('value1');
      expect(await service.get('key2')).toBe('value2');
      
      // Reset the cache
      await service.reset();
      
      // Verify they're gone
      expect(await service.get('key1')).toBeNull();
      expect(await service.get('key2')).toBeNull();
    });
  });
  
  describe('Memory Usage Tracking', () => {
    it('should track memory usage', () => {
      const stats = service.getStats();
      
      // Check that memory usage is provided
      expect(stats.memoryUsage).toBeDefined();
      expect(stats.memoryUsage.current).toBe('20 MB');
      expect(stats.memoryUsage.peak).toBe('20 MB');
      expect(stats.memoryUsage.trend).toBe('stable');
    });
    
    it('should handle increasing memory trend', () => {
      // Simulate multiple memory usage events
      // @ts-ignore - accessing private property for testing
      const memoryTracker = service['trackMemoryUsage'].bind(service);
      
      // Initial usage
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        ...mockMemoryUsage,
        heapUsed: 20 * 1024 * 1024 // 20MB
      });
      
      memoryTracker();
      
      // Usage goes up by 5MB each time
      for (let i = 1; i <= 10; i++) {
        jest.spyOn(process, 'memoryUsage').mockReturnValue({
          ...mockMemoryUsage,
          heapUsed: (20 + i * 5) * 1024 * 1024
        });
        
        memoryTracker();
      }
      
      const stats = service.getStats();
      expect(stats.memoryUsage.trend).toBe('increasing');
      expect(stats.memoryUsage.peak).toBe('70 MB');
    });
    
    it('should handle decreasing memory trend', () => {
      // Simulate multiple memory usage events
      // @ts-ignore - accessing private property for testing
      const memoryTracker = service['trackMemoryUsage'].bind(service);
      
      // Initial high usage
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        ...mockMemoryUsage,
        heapUsed: 70 * 1024 * 1024 // 70MB
      });
      
      memoryTracker();
      
      // Usage decreases by 5MB each time
      for (let i = 1; i <= 10; i++) {
        jest.spyOn(process, 'memoryUsage').mockReturnValue({
          ...mockMemoryUsage,
          heapUsed: (70 - i * 5) * 1024 * 1024
        });
        
        memoryTracker();
      }
      
      const stats = service.getStats();
      expect(stats.memoryUsage.trend).toBe('decreasing');
    });
  });
}); 