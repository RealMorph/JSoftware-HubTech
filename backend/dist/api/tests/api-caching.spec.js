"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const api_service_1 = require("../api.service");
const cache_service_1 = require("../../cache/cache.service");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('ApiService Caching', () => {
    let apiService;
    let cacheService;
    const mockCacheService = {
        get: globals_1.jest.fn().mockImplementation(() => Promise.resolve(null)),
        set: globals_1.jest.fn().mockImplementation(() => Promise.resolve()),
        del: globals_1.jest.fn().mockImplementation(() => Promise.resolve()),
        delByPattern: globals_1.jest.fn().mockImplementation(() => Promise.resolve()),
        reset: globals_1.jest.fn().mockImplementation(() => Promise.resolve()),
        getStats: globals_1.jest.fn().mockReturnValue({
            hits: 0,
            misses: 0,
            total: 0,
            hitRate: '0%'
        }),
        resetStats: globals_1.jest.fn()
    };
    const cacheStore = new Map();
    (0, globals_1.beforeEach)(async () => {
        cacheStore.clear();
        mockCacheService.get.mockImplementation((...args) => {
            const key = args[0];
            return Promise.resolve(cacheStore.get(key));
        });
        mockCacheService.set.mockImplementation((...args) => {
            const [key, value] = args;
            cacheStore.set(key, value);
            return Promise.resolve();
        });
        mockCacheService.del.mockImplementation((...args) => {
            const key = args[0];
            cacheStore.delete(key);
            return Promise.resolve();
        });
        mockCacheService.delByPattern.mockImplementation((...args) => {
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                api_service_1.ApiService,
                {
                    provide: cache_service_1.CacheService,
                    useValue: mockCacheService
                }
            ],
        }).compile();
        apiService = module.get(api_service_1.ApiService);
        cacheService = module.get(cache_service_1.CacheService);
        mockCacheService.get.mockClear();
        mockCacheService.set.mockClear();
        mockCacheService.del.mockClear();
        mockCacheService.delByPattern.mockClear();
        mockCacheService.reset.mockClear();
        const apiKey = {
            id: 'test-id',
            key: 'test-api-key',
            name: 'Test API Key',
            permissions: ['read', 'write'],
            tier: 'premium',
            createdAt: new Date(),
            lastUsed: new Date()
        };
        apiService.apiKeys = [apiKey];
    });
    (0, globals_1.describe)('API Key Caching', () => {
        (0, globals_1.it)('should cache API key validation', async () => {
            const apiKey = 'test-api-key';
            await apiService.validateApiKey(apiKey);
            (0, globals_1.expect)(cacheService.set).toHaveBeenCalledWith(`api-key:${apiKey}`, globals_1.expect.objectContaining({ key: apiKey }), 600);
            await apiService.validateApiKey(apiKey);
            (0, globals_1.expect)(cacheService.get).toHaveBeenCalledTimes(2);
            (0, globals_1.expect)(cacheService.set).toHaveBeenCalledTimes(1);
        });
        (0, globals_1.it)('should invalidate API key cache when revoking', async () => {
            const apiKey = 'test-api-key';
            const apiKeyId = 'test-id';
            await apiService.validateApiKey(apiKey);
            await apiService.revokeApiKey(apiKeyId);
            (0, globals_1.expect)(cacheService.del).toHaveBeenCalledWith(`api-key:${apiKey}`);
            (0, globals_1.expect)(cacheService.delByPattern).toHaveBeenCalledWith('api-keys:');
        });
        (0, globals_1.it)('should handle cache misses correctly', async () => {
            mockCacheService.get.mockImplementation(() => Promise.resolve(undefined));
            await apiService.validateApiKey('test-api-key');
            (0, globals_1.expect)(cacheService.get).toHaveBeenCalled();
            (0, globals_1.expect)(cacheService.set).toHaveBeenCalled();
        });
    });
    (0, globals_1.describe)('Rate Limit Caching', () => {
        (0, globals_1.it)('should cache rate limit configs', async () => {
            const tier = 'premium';
            const limit = await apiService.getRateLimitForTier(tier);
            (0, globals_1.expect)(cacheService.set).toHaveBeenCalledWith(`rate-limit:config:${tier}`, globals_1.expect.any(Number), 3600);
            await apiService.getRateLimitForTier(tier);
            (0, globals_1.expect)(cacheService.get).toHaveBeenCalledTimes(2);
            (0, globals_1.expect)(cacheService.set).toHaveBeenCalledTimes(1);
        });
        (0, globals_1.it)('should track rate limit usage in cache', async () => {
            const apiKey = 'test-api-key';
            await apiService.trackRateLimitUsage(apiKey);
            (0, globals_1.expect)(cacheService.set).toHaveBeenCalledWith(`rate-limit:usage:${apiKey}`, 1, 60);
            await apiService.trackRateLimitUsage(apiKey);
            (0, globals_1.expect)(cacheService.set).toHaveBeenLastCalledWith(`rate-limit:usage:${apiKey}`, 2, 60);
        });
        (0, globals_1.it)('should use cached rate limit usage for checks', async () => {
            const apiKey = 'test-api-key';
            await cacheService.set(`rate-limit:usage:${apiKey}`, 5, 60);
            const result = await apiService.checkRateLimit(apiKey);
            (0, globals_1.expect)(result.current).toBe(5);
            (0, globals_1.expect)(result.allowed).toBe(true);
            await cacheService.set(`rate-limit:usage:${apiKey}`, 150, 60);
            const result2 = await apiService.checkRateLimit(apiKey);
            (0, globals_1.expect)(result2.current).toBe(150);
            (0, globals_1.expect)(result2.allowed).toBe(false);
        });
    });
    (0, globals_1.describe)('API Key Info Caching', () => {
        (0, globals_1.it)('should cache API key info', async () => {
            const apiKey = 'test-api-key';
            await apiService.getApiKeyInfo(apiKey);
            (0, globals_1.expect)(cacheService.set).toHaveBeenCalledWith(`api-key-info:${apiKey}`, globals_1.expect.objectContaining({
                id: globals_1.expect.any(String),
                name: globals_1.expect.any(String),
                permissions: globals_1.expect.any(Array),
            }), 300);
            mockCacheService.get.mockClear();
            mockCacheService.set.mockClear();
            await apiService.getApiKeyInfo(apiKey);
            (0, globals_1.expect)(cacheService.get).toHaveBeenCalled();
            (0, globals_1.expect)(cacheService.set).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=api-caching.spec.js.map