"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const cache_controller_1 = require("../cache.controller");
const cache_service_1 = require("../cache.service");
const api_key_guard_1 = require("../../api/guards/api-key.guard");
describe('CacheController', () => {
    let controller;
    let cacheService;
    const mockCacheService = {
        getStats: jest.fn().mockReturnValue({
            hits: 50,
            misses: 20,
            total: 70,
            hitRate: '71.43%',
            uptime: '5 minutes',
            memoryUsage: {
                current: '20 MB',
                peak: '25 MB',
                trend: 'stable'
            }
        }),
        resetStats: jest.fn(),
        reset: jest.fn().mockResolvedValue(undefined),
        del: jest.fn().mockResolvedValue(undefined),
        delByPattern: jest.fn().mockResolvedValue(undefined),
    };
    const mockApiKeyGuard = { canActivate: jest.fn().mockReturnValue(true) };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [cache_controller_1.CacheController],
            providers: [
                {
                    provide: cache_service_1.CacheService,
                    useValue: mockCacheService
                },
                {
                    provide: api_key_guard_1.ApiKeyGuard,
                    useValue: mockApiKeyGuard
                }
            ]
        })
            .overrideGuard(api_key_guard_1.ApiKeyGuard)
            .useValue(mockApiKeyGuard)
            .compile();
        controller = module.get(cache_controller_1.CacheController);
        cacheService = module.get(cache_service_1.CacheService);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    describe('getStats', () => {
        it('should return cache statistics', async () => {
            const result = await controller.getStats();
            expect(cacheService.getStats).toHaveBeenCalled();
            expect(result).toEqual({
                hits: 50,
                misses: 20,
                total: 70,
                hitRate: '71.43%',
                uptime: '5 minutes',
                memoryUsage: {
                    current: '20 MB',
                    peak: '25 MB',
                    trend: 'stable'
                }
            });
        });
    });
    describe('resetStats', () => {
        it('should reset cache statistics', async () => {
            const result = await controller.resetStats();
            expect(cacheService.resetStats).toHaveBeenCalled();
            expect(result).toEqual({
                success: true,
                message: 'Cache statistics reset'
            });
        });
    });
    describe('clearCache', () => {
        it('should clear the entire cache', async () => {
            const result = await controller.clearCache();
            expect(cacheService.reset).toHaveBeenCalled();
            expect(result).toEqual({
                success: true,
                message: 'Cache cleared'
            });
        });
    });
    describe('invalidateCache', () => {
        it('should invalidate a specific cache key', async () => {
            const key = 'test-key';
            const result = await controller.invalidateCache(key);
            expect(cacheService.del).toHaveBeenCalledWith(key);
            expect(result).toEqual({
                success: true,
                message: `Cache key '${key}' invalidated`
            });
        });
    });
    describe('invalidateCacheByPattern', () => {
        it('should invalidate cache by pattern', async () => {
            const pattern = 'user:*';
            const result = await controller.invalidateCacheByPattern(pattern);
            expect(cacheService.delByPattern).toHaveBeenCalledWith(pattern);
            expect(result).toEqual({
                success: true,
                message: `Cache invalidated by pattern '${pattern}'`
            });
        });
    });
});
//# sourceMappingURL=cache.controller.spec.js.map