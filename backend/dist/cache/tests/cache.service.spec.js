"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const cache_service_1 = require("../cache.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const mockMemoryUsage = {
    rss: 50 * 1024 * 1024,
    heapTotal: 30 * 1024 * 1024,
    heapUsed: 20 * 1024 * 1024,
    external: 10 * 1024 * 1024,
    arrayBuffers: 1 * 1024 * 1024
};
describe('CacheService', () => {
    let service;
    let cacheManager;
    const mockCache = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        store: {
            keys: jest.fn()
        }
    };
    const cacheStore = new Map();
    beforeEach(async () => {
        jest.spyOn(process, 'memoryUsage').mockReturnValue(mockMemoryUsage);
        jest.spyOn(common_1.Logger.prototype, 'debug').mockImplementation(() => { });
        jest.spyOn(common_1.Logger.prototype, 'error').mockImplementation(() => { });
        cacheStore.clear();
        mockCache.get.mockImplementation((key) => {
            return Promise.resolve(cacheStore.get(key));
        });
        mockCache.set.mockImplementation((key, value, ttl) => {
            cacheStore.set(key, value);
            return Promise.resolve();
        });
        mockCache.del.mockImplementation((key) => {
            cacheStore.delete(key);
            return Promise.resolve();
        });
        mockCache.store.keys.mockImplementation(() => {
            return Promise.resolve(Array.from(cacheStore.keys()));
        });
        const module = await testing_1.Test.createTestingModule({
            providers: [
                cache_service_1.CacheService,
                {
                    provide: cache_manager_1.CACHE_MANAGER,
                    useValue: mockCache
                }
            ],
        }).compile();
        service = module.get(cache_service_1.CacheService);
        cacheManager = module.get(cache_manager_1.CACHE_MANAGER);
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
            await service.get(key);
            const result = await service.get(key);
            expect(result).toEqual(value);
        });
        it('should track cache hits and misses correctly', async () => {
            await service.set('key1', 'value1');
            await service.set('key2', 'value2');
            await service.get('key1');
            await service.get('non-existent-key');
            await service.get('key1');
            const stats = service.getStats();
            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(1);
            expect(stats.total).toBe(3);
            expect(parseFloat(stats.hitRate)).toBeCloseTo(66.67, 1);
        });
        it('should reset statistics', async () => {
            await service.set('key1', 'value1');
            await service.get('key1');
            await service.get('key1');
            await service.get('non-existent');
            const beforeReset = service.getStats();
            expect(beforeReset.total).toBeGreaterThan(0);
            service.resetStats();
            const afterReset = service.getStats();
            expect(afterReset.hits).toBe(0);
            expect(afterReset.misses).toBe(0);
            expect(afterReset.total).toBe(0);
        });
        it('should delete a key from cache', async () => {
            await service.set('key-to-delete', 'some-value');
            expect(await service.get('key-to-delete')).toBe('some-value');
            await service.del('key-to-delete');
            expect(await service.get('key-to-delete')).toBeNull();
        });
        it('should delete by pattern', async () => {
            await service.set('user:1:profile', { name: 'User 1' });
            await service.set('user:2:profile', { name: 'User 2' });
            await service.set('post:1', { title: 'Post 1' });
            await service.delByPattern('user:');
            expect(await service.get('user:1:profile')).toBeNull();
            expect(await service.get('user:2:profile')).toBeNull();
            expect(await service.get('post:1')).toEqual({ title: 'Post 1' });
        });
        it('should reset the entire cache', async () => {
            await service.set('key1', 'value1');
            await service.set('key2', 'value2');
            expect(await service.get('key1')).toBe('value1');
            expect(await service.get('key2')).toBe('value2');
            await service.reset();
            expect(await service.get('key1')).toBeNull();
            expect(await service.get('key2')).toBeNull();
        });
    });
    describe('Memory Usage Tracking', () => {
        it('should track memory usage', () => {
            const stats = service.getStats();
            expect(stats.memoryUsage).toBeDefined();
            expect(stats.memoryUsage.current).toBe('20 MB');
            expect(stats.memoryUsage.peak).toBe('20 MB');
            expect(stats.memoryUsage.trend).toBe('stable');
        });
        it('should handle increasing memory trend', () => {
            const memoryTracker = service['trackMemoryUsage'].bind(service);
            jest.spyOn(process, 'memoryUsage').mockReturnValue(Object.assign(Object.assign({}, mockMemoryUsage), { heapUsed: 20 * 1024 * 1024 }));
            memoryTracker();
            for (let i = 1; i <= 10; i++) {
                jest.spyOn(process, 'memoryUsage').mockReturnValue(Object.assign(Object.assign({}, mockMemoryUsage), { heapUsed: (20 + i * 5) * 1024 * 1024 }));
                memoryTracker();
            }
            const stats = service.getStats();
            expect(stats.memoryUsage.trend).toBe('increasing');
            expect(stats.memoryUsage.peak).toBe('70 MB');
        });
        it('should handle decreasing memory trend', () => {
            const memoryTracker = service['trackMemoryUsage'].bind(service);
            jest.spyOn(process, 'memoryUsage').mockReturnValue(Object.assign(Object.assign({}, mockMemoryUsage), { heapUsed: 70 * 1024 * 1024 }));
            memoryTracker();
            for (let i = 1; i <= 10; i++) {
                jest.spyOn(process, 'memoryUsage').mockReturnValue(Object.assign(Object.assign({}, mockMemoryUsage), { heapUsed: (70 - i * 5) * 1024 * 1024 }));
                memoryTracker();
            }
            const stats = service.getStats();
            expect(stats.memoryUsage.trend).toBe('decreasing');
        });
    });
});
//# sourceMappingURL=cache.service.spec.js.map