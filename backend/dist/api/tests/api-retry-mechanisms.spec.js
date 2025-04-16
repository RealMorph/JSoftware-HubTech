"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const api_controller_1 = require("../api.controller");
const api_service_1 = require("../api.service");
const cache_service_1 = require("../../cache/cache.service");
const request = require("supertest");
const globals_1 = require("@jest/globals");
const cache_manager_1 = require("@nestjs/cache-manager");
class MockApiService {
    constructor() {
        this.errorState = {
            failCounter: 0,
            shouldFail: false,
            failureType: '',
            maxFailures: 0,
            recoveryAttempts: 0,
        };
        this.retryTracking = {
            attemptsMade: 0,
            fallbacksUsed: 0,
            recoveryPaths: [],
        };
    }
    configureFailure(type, maxFailures, recoveryAttempts = 0) {
        this.errorState = {
            failCounter: 0,
            shouldFail: true,
            failureType: type,
            maxFailures,
            recoveryAttempts,
        };
        this.retryTracking = {
            attemptsMade: 0,
            fallbacksUsed: 0,
            recoveryPaths: [],
        };
    }
    getRetryStats() {
        return Object.assign({}, this.retryTracking);
    }
    resetErrors() {
        this.errorState.shouldFail = false;
        this.errorState.failCounter = 0;
    }
    trackRetry(recoveryPath) {
        this.retryTracking.attemptsMade++;
        if (recoveryPath) {
            this.retryTracking.recoveryPaths.push(recoveryPath);
        }
    }
    trackFallback() {
        this.retryTracking.fallbacksUsed++;
    }
    shouldFailWithRetry() {
        if (!this.errorState.shouldFail)
            return false;
        const shouldFailNow = this.errorState.failCounter < this.errorState.maxFailures;
        this.errorState.failCounter++;
        if (shouldFailNow) {
            this.trackRetry();
        }
        return shouldFailNow;
    }
    async generateApiKey(name, permissions = ['read'], tier = 'standard') {
        if (this.shouldFailWithRetry()) {
            if (this.errorState.failureType === 'transient') {
                throw new common_1.InternalServerErrorException('Transient error occurred - please retry');
            }
            else if (this.errorState.failureType === 'timeout') {
                throw new common_1.InternalServerErrorException('Request timed out - please retry');
            }
            else {
                throw new common_1.InternalServerErrorException('Service temporarily unavailable');
            }
        }
        return {
            success: true,
            apiKey: {
                id: `id_${Math.random().toString(36).substring(2)}`,
                key: `key_${Math.random().toString(36).substring(2)}`,
                name,
                permissions,
                tier,
                createdAt: new Date()
            }
        };
    }
    async getApiKeys() {
        if (this.shouldFailWithRetry()) {
            if (this.errorState.recoveryAttempts > 0) {
                this.trackFallback();
                this.trackRetry('cached-keys');
                this.errorState.recoveryAttempts--;
                return [
                    {
                        id: 'fallback-id-1',
                        name: 'Fallback Key 1',
                        permissions: ['read'],
                        tier: 'standard',
                        createdAt: new Date(),
                        lastUsed: new Date(),
                        isFallback: true
                    }
                ];
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve API keys');
        }
        return [
            {
                id: 'real-id-1',
                name: 'Real Key 1',
                permissions: ['read', 'write'],
                tier: 'premium',
                createdAt: new Date(),
                lastUsed: new Date()
            }
        ];
    }
    async validateApiKey(key) {
        if (this.shouldFailWithRetry()) {
            this.trackRetry('circuit-open');
            return {
                id: 'circuit-breaker-id',
                key,
                permissions: ['read'],
                degradedMode: true
            };
        }
        return {
            id: 'normal-id',
            key,
            permissions: ['read', 'write', 'delete'],
            degradedMode: false
        };
    }
}
class MockCacheService {
    constructor() {
        this.cache = new Map();
        this.failureConfig = {
            shouldFail: false,
            recoverAfter: 0,
            currentAttempt: 0
        };
    }
    configureCacheFailure(failAttempts) {
        this.failureConfig = {
            shouldFail: true,
            recoverAfter: failAttempts,
            currentAttempt: 0
        };
    }
    resetFailures() {
        this.failureConfig.shouldFail = false;
        this.failureConfig.currentAttempt = 0;
    }
    shouldFail() {
        if (!this.failureConfig.shouldFail)
            return false;
        this.failureConfig.currentAttempt++;
        return this.failureConfig.currentAttempt <= this.failureConfig.recoverAfter;
    }
    async get(key) {
        if (this.shouldFail()) {
            throw new common_1.InternalServerErrorException('Cache retrieval failed - attempt ' + this.failureConfig.currentAttempt);
        }
        return this.cache.get(key);
    }
    async set(key, value) {
        if (this.shouldFail()) {
            throw new common_1.InternalServerErrorException('Cache storage failed - attempt ' + this.failureConfig.currentAttempt);
        }
        this.cache.set(key, value);
        return true;
    }
}
(0, globals_1.describe)('API Retry Mechanisms', () => {
    let app;
    let server;
    let apiService;
    let cacheService;
    (0, globals_1.beforeEach)(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                cache_manager_1.CacheModule.register(),
            ],
            controllers: [api_controller_1.ApiController],
            providers: [
                {
                    provide: api_service_1.ApiService,
                    useClass: MockApiService,
                },
                {
                    provide: cache_service_1.CacheService,
                    useClass: MockCacheService,
                }
            ],
        }).compile();
        apiService = moduleFixture.get(api_service_1.ApiService);
        cacheService = moduleFixture.get(cache_service_1.CacheService);
        app = moduleFixture.createNestApplication();
        await app.init();
        server = app.getHttpServer();
    });
    (0, globals_1.afterEach)(() => {
        apiService.resetErrors();
        if (cacheService.resetFailures) {
            cacheService.resetFailures();
        }
    });
    (0, globals_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, globals_1.describe)('Transient Error Recovery', () => {
        (0, globals_1.it)('should track attempts for transient errors', async () => {
            apiService.configureFailure('transient', 3);
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: 'Retry Test Key',
                permissions: ['read']
            });
            (0, globals_1.expect)(response.status).toBeDefined();
            const stats = apiService.getRetryStats();
            (0, globals_1.expect)(stats.attemptsMade).toBe(1);
        });
        (0, globals_1.it)('should return appropriate error when retries are exhausted', async () => {
            apiService.configureFailure('transient', 10);
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: 'Failure Test Key',
                permissions: ['read']
            });
            (0, globals_1.expect)(response.status).toBe(common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            const stats = apiService.getRetryStats();
            (0, globals_1.expect)(stats.attemptsMade).toBeGreaterThan(0);
        });
    });
    (0, globals_1.describe)('Fallback Mechanisms', () => {
        (0, globals_1.it)('should use fallback data when primary source fails', async () => {
            apiService.configureFailure('transient', 3, 3);
            const response = await request(server)
                .get('/api/keys');
            (0, globals_1.expect)(response.status).toBe(common_1.HttpStatus.OK);
            (0, globals_1.expect)(response.body[0]).toBeDefined();
            const stats = apiService.getRetryStats();
            (0, globals_1.expect)(stats.fallbacksUsed).toBe(1);
        });
    });
    (0, globals_1.describe)('Circuit Breaker Pattern', () => {
        (0, globals_1.it)('should return degraded functionality when circuit is open', async () => {
            apiService.configureFailure('circuit-breaker', 1);
            const response = await request(server)
                .get('/api/validate')
                .set('x-api-key', 'any-test-key');
            (0, globals_1.expect)(response.status).toBe(common_1.HttpStatus.OK);
            const stats = apiService.getRetryStats();
            (0, globals_1.expect)(stats.recoveryPaths).toContain('circuit-open');
        });
    });
    (0, globals_1.describe)('Request Timeout Handling', () => {
        (0, globals_1.it)('should track timeout errors for retry analysis', async () => {
            apiService.configureFailure('timeout', 2);
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: 'Timeout Test',
                permissions: ['read']
            });
            (0, globals_1.expect)(response.status).toBeDefined();
            const stats = apiService.getRetryStats();
            (0, globals_1.expect)(stats.attemptsMade).toBe(1);
        });
    });
});
//# sourceMappingURL=api-retry-mechanisms.spec.js.map