"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const cache_module_1 = require("../cache.module");
const cache_service_1 = require("../cache.service");
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const nestjs_rate_limiter_1 = require("nestjs-rate-limiter");
const api_key_guard_1 = require("../../api/guards/api-key.guard");
let TestCachedController = class TestCachedController {
    constructor(cacheService, cacheManager) {
        this.cacheService = cacheService;
        this.cacheManager = cacheManager;
        this.counter = 0;
    }
    async getCachedData() {
        this.counter++;
        return {
            data: 'This is cached data',
            timestamp: new Date().toISOString(),
            counter: this.counter
        };
    }
    async getNonCachedData() {
        this.counter++;
        return {
            data: 'This is non-cached data',
            timestamp: new Date().toISOString(),
            counter: this.counter
        };
    }
    async getManuallyCache() {
        const cacheKey = 'manual-cache-key';
        let result = await this.cacheService.get(cacheKey);
        if (!result) {
            this.counter++;
            result = {
                data: 'This is manually cached data',
                timestamp: new Date().toISOString(),
                counter: this.counter
            };
            await this.cacheService.set(cacheKey, result, 30);
        }
        return result;
    }
    async getCachedObjects() {
        return [
            { id: 1, name: 'Item 1', createdAt: new Date().toISOString() },
            { id: 2, name: 'Item 2', createdAt: new Date().toISOString() },
            { id: 3, name: 'Item 3', createdAt: new Date().toISOString() }
        ];
    }
    async invalidateCache(key) {
        await this.cacheService.del(key);
        return { success: true, message: `Cache key ${key} invalidated` };
    }
    async getCacheStats() {
        return this.cacheService.getStats();
    }
    async getMemoryUsage() {
        const memoryUsage = process.memoryUsage();
        return {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
        };
    }
    async resetCache() {
        await this.cacheService.reset();
        this.counter = 0;
        return { success: true, message: 'Cache reset', counter: this.counter };
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, cache_manager_1.CacheTTL)(30),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCachedController.prototype, "getCachedData", null);
__decorate([
    (0, common_1.Get)('no-cache'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCachedController.prototype, "getNonCachedData", null);
__decorate([
    (0, common_1.Get)('manual-cache'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCachedController.prototype, "getManuallyCache", null);
__decorate([
    (0, common_1.Get)('objects'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, cache_manager_1.CacheTTL)(60),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCachedController.prototype, "getCachedObjects", null);
__decorate([
    (0, common_1.Get)('invalidate/:key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestCachedController.prototype, "invalidateCache", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCachedController.prototype, "getCacheStats", null);
__decorate([
    (0, common_1.Get)('memory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCachedController.prototype, "getMemoryUsage", null);
__decorate([
    (0, common_1.Get)('reset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCachedController.prototype, "resetCache", null);
TestCachedController = __decorate([
    (0, common_1.Controller)('test-cache'),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [cache_service_1.CacheService, Object])
], TestCachedController);
const mockApiKeyGuard = { canActivate: jest.fn().mockReturnValue(true) };
describe('Cache Integration Tests', () => {
    let app;
    let cacheService;
    let server;
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                cache_module_1.AppCacheModule,
                nestjs_rate_limiter_1.RateLimiterModule.register({
                    keyPrefix: 'test',
                    points: 100,
                    duration: 1,
                })
            ],
            controllers: [TestCachedController],
            providers: [
                {
                    provide: api_key_guard_1.ApiKeyGuard,
                    useValue: mockApiKeyGuard
                }
            ]
        })
            .overrideGuard(api_key_guard_1.ApiKeyGuard)
            .useValue(mockApiKeyGuard)
            .compile();
        app = moduleFixture.createNestApplication();
        cacheService = moduleFixture.get(cache_service_1.CacheService);
        await app.init();
        server = app.getHttpServer();
    });
    afterEach(async () => {
        await app.close();
    });
    it('should cache responses and return the same data on subsequent requests', async () => {
        const firstResponse = await request(server)
            .get('/test-cache')
            .expect(200);
        const firstCounter = firstResponse.body.counter;
        const firstTimestamp = firstResponse.body.timestamp;
        const secondResponse = await request(server)
            .get('/test-cache')
            .expect(200);
        expect(secondResponse.body.counter).toBe(firstCounter);
        expect(secondResponse.body.timestamp).toBe(firstTimestamp);
    });
    it('should not cache responses for non-cached endpoints', async () => {
        const firstResponse = await request(server)
            .get('/test-cache/no-cache')
            .expect(200);
        const firstCounter = firstResponse.body.counter;
        const secondResponse = await request(server)
            .get('/test-cache/no-cache')
            .expect(200);
        expect(secondResponse.body.counter).toBe(firstCounter + 1);
    });
    it('should handle manual caching', async () => {
        const firstResponse = await request(server)
            .get('/test-cache/manual-cache')
            .expect(200);
        const firstCounter = firstResponse.body.counter;
        const secondResponse = await request(server)
            .get('/test-cache/manual-cache')
            .expect(200);
        expect(secondResponse.body.counter).toBe(firstCounter);
    });
    it('should invalidate cached data when requested', async () => {
        const firstResponse = await request(server)
            .get('/test-cache')
            .expect(200);
        const firstCounter = firstResponse.body.counter;
        const cachedResponse = await request(server)
            .get('/test-cache')
            .expect(200);
        expect(cachedResponse.body.counter).toBe(firstCounter);
        await request(server)
            .get('/test-cache/reset')
            .expect(200);
        const afterInvalidateResponse = await request(server)
            .get('/test-cache')
            .expect(200);
        expect(afterInvalidateResponse.body.counter).toBe(1);
    });
});
//# sourceMappingURL=cache-integration.spec.js.map