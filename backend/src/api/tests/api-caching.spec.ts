import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ApiController } from '../api.controller';
import { ApiService } from '../api.service';
import { CacheService } from '../../cache/cache.service';
import * as request from 'supertest';
import { CacheModule } from '@nestjs/cache-manager';
import { describe, beforeEach, afterAll, it, expect, jest } from '@jest/globals';

describe('ApiService Caching', () => {
  let apiService: ApiService;
  let cacheService: CacheService;
  
  // Create a mock cache service
  const mockCacheService = {
    // Use explicit any to silence TypeScript errors
    get: jest.fn().mockImplementation(() => Promise.resolve(null)),
    set: jest.fn().mockImplementation(() => Promise.resolve()),
    del: jest.fn().mockImplementation(() => Promise.resolve()),
    delByPattern: jest.fn().mockImplementation(() => Promise.resolve()),
    reset: jest.fn().mockImplementation(() => Promise.resolve()),
    getStats: jest.fn().mockReturnValue({
      hits: 0,
      misses: 0,
      total: 0,
      hitRate: '0%'
    }),
    resetStats: jest.fn()
  };
  
  // Store for the cache
  const cacheStore = new Map<string, any>();
  
  beforeEach(async () => {
    // Reset the cache for each test
    cacheStore.clear();
    
    // Reset mock implementations
    mockCacheService.get.mockImplementation((...args: any[]) => {
      const key = args[0];
      return Promise.resolve(cacheStore.get(key));
    });
    
    mockCacheService.set.mockImplementation((...args: any[]) => {
      const [key, value] = args;
      cacheStore.set(key, value);
      return Promise.resolve();
    });
    
    mockCacheService.del.mockImplementation((...args: any[]) => {
      const key = args[0];
      cacheStore.delete(key);
      return Promise.resolve();
    });
    
    mockCacheService.delByPattern.mockImplementation((...args: any[]) => {
      const pattern = args[0];
      const keys = Array.from(cacheStore.keys()).filter(key => key.includes(pattern));
      for (const key of keys) {
        cacheStore.delete(key);
      }
      return Promise.resolve();
    });
    
    mockCacheService.reset.mockImplementation(() => {
      cacheStore.clear();
      return Promise.resolve();
    });
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiService,
        {
          provide: CacheService,
          useValue: mockCacheService
        }
      ],
    }).compile();

    apiService = module.get<ApiService>(ApiService);
    cacheService = module.get<CacheService>(CacheService);
    
    // Reset mock counts
    mockCacheService.get.mockClear();
    mockCacheService.set.mockClear();
    mockCacheService.del.mockClear();
    mockCacheService.delByPattern.mockClear();
    mockCacheService.reset.mockClear();
    
    // Setup a test API key for all tests
    const apiKey = {
      id: 'test-id',
      key: 'test-api-key',
      name: 'Test API Key',
      permissions: ['read', 'write'],
      tier: 'premium' as const,
      createdAt: new Date(),
      lastUsed: new Date()
    };
    
    // Add the API key to the service's array
    (apiService as any).apiKeys = [apiKey];
  });

  describe('API Key Caching', () => {
    it('should cache API key validation', async () => {
      // First request should fetch from database and cache
      const apiKey = 'test-api-key';
      await apiService.validateApiKey(apiKey);
      
      // Verify the key was cached
      expect(cacheService.set).toHaveBeenCalledWith(
        `api-key:${apiKey}`,
        expect.objectContaining({ key: apiKey }),
        600
      );
      
      // Second request should hit the cache
      await apiService.validateApiKey(apiKey);
      
      // Should have called get twice, but set only once
      expect(cacheService.get).toHaveBeenCalledTimes(2);
      expect(cacheService.set).toHaveBeenCalledTimes(1);
    });
    
    it('should invalidate API key cache when revoking', async () => {
      const apiKey = 'test-api-key';
      const apiKeyId = 'test-id';
      
      // Cache the API key first
      await apiService.validateApiKey(apiKey);
      
      // Revoke the API key
      await apiService.revokeApiKey(apiKeyId);
      
      // Should invalidate related cache
      expect(cacheService.del).toHaveBeenCalledWith(`api-key:${apiKey}`);
      expect(cacheService.delByPattern).toHaveBeenCalledWith('api-keys:');
    });
    
    it('should handle cache misses correctly', async () => {
      // Mock CacheService.get to return null (cache miss)
      mockCacheService.get.mockImplementation(() => Promise.resolve(undefined));
      
      // Validate an API key that's not in cache
      await apiService.validateApiKey('test-api-key');
      
      // It should try to get from cache, then set it
      expect(cacheService.get).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalled();
    });
  });
  
  describe('Rate Limit Caching', () => {
    it('should cache rate limit configs', async () => {
      // First request should set the cache
      const tier = 'premium';
      const limit = await apiService.getRateLimitForTier(tier);
      
      // Verify the limit was cached
      expect(cacheService.set).toHaveBeenCalledWith(
        `rate-limit:config:${tier}`,
        expect.any(Number),
        3600
      );
      
      // Second request should hit the cache
      await apiService.getRateLimitForTier(tier);
      
      // Should have called get twice, but set only once
      expect(cacheService.get).toHaveBeenCalledTimes(2);
      expect(cacheService.set).toHaveBeenCalledTimes(1);
    });
    
    it('should track rate limit usage in cache', async () => {
      const apiKey = 'test-api-key';
      
      // Track usage
      await apiService.trackRateLimitUsage(apiKey);
      
      // Verify usage was stored in cache
      expect(cacheService.set).toHaveBeenCalledWith(
        `rate-limit:usage:${apiKey}`,
        1, // Initial usage
        60 // TTL of 60 seconds
      );
      
      // Track again
      await apiService.trackRateLimitUsage(apiKey);
      
      // Should have set a value of 2 in the second call
      expect(cacheService.set).toHaveBeenLastCalledWith(
        `rate-limit:usage:${apiKey}`,
        2, // Second usage
        60
      );
    });
    
    it('should use cached rate limit usage for checks', async () => {
      const apiKey = 'test-api-key';
      
      // Set up a cached usage count
      await cacheService.set(`rate-limit:usage:${apiKey}`, 5, 60);
      
      // Check rate limit
      const result = await apiService.checkRateLimit(apiKey);
      
      // Should have used the cached value
      expect(result.current).toBe(5);
      expect(result.allowed).toBe(true); // Under the limit
      
      // Set a higher usage
      await cacheService.set(`rate-limit:usage:${apiKey}`, 150, 60);
      
      // Check again
      const result2 = await apiService.checkRateLimit(apiKey);
      
      // Should have denied due to exceeded limit
      expect(result2.current).toBe(150);
      expect(result2.allowed).toBe(false); // Over the limit
    });
  });
  
  describe('API Key Info Caching', () => {
    it('should cache API key info', async () => {
      const apiKey = 'test-api-key';
      
      // First request
      await apiService.getApiKeyInfo(apiKey);
      
      // Verify it was cached
      expect(cacheService.set).toHaveBeenCalledWith(
        `api-key-info:${apiKey}`,
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          permissions: expect.any(Array),
        }),
        300 // 5 minute TTL
      );
      
      // Reset mocks for clarity
      mockCacheService.get.mockClear();
      mockCacheService.set.mockClear();
      
      // Second request should use cache
      await apiService.getApiKeyInfo(apiKey);
      
      // Should have called get, but not set
      expect(cacheService.get).toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });
}); 