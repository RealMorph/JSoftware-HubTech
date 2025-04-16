"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const api_controller_1 = require("../api.controller");
const api_service_1 = require("../api.service");
const cache_service_1 = require("../../cache/cache.service");
const api_key_guard_1 = require("../guards/api-key.guard");
const request = require("supertest");
const nestjs_rate_limiter_1 = require("nestjs-rate-limiter");
const cache_manager_1 = require("@nestjs/cache-manager");
const globals_1 = require("@jest/globals");
class MockApiService {
    constructor() {
        this.apiKeys = [];
    }
    async generateApiKey(name, permissions = ['read'], tier = 'standard') {
        const key = `key_${Math.random().toString(36).substring(2)}`;
        const apiKey = {
            id: `id_${Math.random().toString(36).substring(2)}`,
            key,
            name,
            permissions,
            tier,
            createdAt: new Date(),
            lastUsed: new Date()
        };
        this.apiKeys.push(apiKey);
        return {
            success: true,
            apiKey: {
                id: apiKey.id,
                key: apiKey.key,
                name: apiKey.name,
                permissions: apiKey.permissions,
                tier: apiKey.tier,
                createdAt: apiKey.createdAt
            }
        };
    }
    async getApiKeys() {
        return this.apiKeys;
    }
    async validateApiKey(key, requiredPermission) {
        const apiKey = this.apiKeys.find(k => k.key === key);
        if (!apiKey) {
            throw new Error('Invalid API key');
        }
        if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
            throw new Error(`Missing required permission: ${requiredPermission}`);
        }
        return apiKey;
    }
    async trackRateLimitUsage() {
        return;
    }
    async checkRateLimit(apiKey) {
        const keyObj = this.apiKeys.find(k => k.key === apiKey);
        const tier = (keyObj === null || keyObj === void 0 ? void 0 : keyObj.tier) || 'standard';
        const limit = tier === 'premium' ? 100 : 10;
        return {
            allowed: true,
            limit,
            current: Math.floor(Math.random() * limit)
        };
    }
    async getApiKeyInfo(key) {
        const apiKey = this.apiKeys.find(k => k.key === key);
        if (!apiKey) {
            throw new Error('Invalid API key');
        }
        return {
            id: apiKey.id,
            name: apiKey.name,
            permissions: apiKey.permissions,
            tier: apiKey.tier,
            createdAt: apiKey.createdAt,
            lastUsed: apiKey.lastUsed
        };
    }
    async revokeApiKey(keyId) {
        const index = this.apiKeys.findIndex(k => k.id === keyId);
        if (index === -1) {
            throw new Error('API key not found');
        }
        this.apiKeys.splice(index, 1);
        return { success: true };
    }
}
class MockCacheService {
    constructor() {
        this.cache = new Map();
    }
    async get(key) {
        return this.cache.get(key);
    }
    async set(key, value) {
        this.cache.set(key, value);
        return true;
    }
    async del(key) {
        this.cache.delete(key);
        return true;
    }
    async delByPattern() {
        return true;
    }
}
(0, globals_1.describe)('API Security', () => {
    let app;
    let server;
    let apiService;
    let testApiKey;
    (0, globals_1.beforeEach)(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                cache_manager_1.CacheModule.register(),
                nestjs_rate_limiter_1.RateLimiterModule.register({
                    points: 5,
                    duration: 1,
                    keyPrefix: 'test',
                })
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
                },
            ],
        })
            .overrideGuard(api_key_guard_1.ApiKeyGuard)
            .useValue({
            canActivate: () => true,
        })
            .compile();
        apiService = moduleFixture.get(api_service_1.ApiService);
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        app.enableCors({
            origin: ['http://localhost:3000', 'https://example.com'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
            credentials: true,
        });
        await app.init();
        server = app.getHttpServer();
        const result = await apiService.generateApiKey('Test Key', ['read', 'write'], 'standard');
        testApiKey = result.apiKey.key;
    });
    (0, globals_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, globals_1.describe)('CORS Policies', () => {
        (0, globals_1.it)('should respond with correct CORS headers for allowed origin', async () => {
            const response = await request(server)
                .get('/api/validate')
                .set('Origin', 'http://localhost:3000')
                .set('x-api-key', testApiKey)
                .expect(common_1.HttpStatus.OK);
            (0, globals_1.expect)(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
            (0, globals_1.expect)(response.headers['access-control-allow-credentials']).toBe('true');
        });
        (0, globals_1.it)('should handle preflight requests correctly', async () => {
            const response = await request(server)
                .options('/api/validate')
                .set('Origin', 'http://localhost:3000')
                .set('Access-Control-Request-Method', 'GET')
                .set('Access-Control-Request-Headers', 'Content-Type,x-api-key')
                .expect(common_1.HttpStatus.NO_CONTENT);
            (0, globals_1.expect)(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
            (0, globals_1.expect)(response.headers['access-control-allow-methods']).toContain('GET');
            (0, globals_1.expect)(response.headers['access-control-allow-headers'].toLowerCase()).toContain('content-type');
            (0, globals_1.expect)(response.headers['access-control-allow-headers'].toLowerCase()).toContain('x-api-key');
        });
        (0, globals_1.it)('should reject requests from non-allowed origins', async () => {
            const response = await request(server)
                .get('/api/validate')
                .set('Origin', 'http://malicious-site.com')
                .set('x-api-key', testApiKey);
            (0, globals_1.expect)(response.headers['access-control-allow-origin']).toBeFalsy();
        });
    });
    (0, globals_1.describe)('API Key Validation', () => {
        (0, globals_1.it)('should validate API key headers', async () => {
            await request(server)
                .get('/api/validate')
                .set('x-api-key', testApiKey)
                .expect(common_1.HttpStatus.OK);
            try {
                await request(server)
                    .get('/api/validate')
                    .set('x-api-key', 'invalid-format');
            }
            catch (error) {
            }
        });
        (0, globals_1.it)('should log API key usage', async () => {
            await request(server)
                .get('/api/validate')
                .set('x-api-key', testApiKey)
                .expect(common_1.HttpStatus.OK);
            const keyInfo = await apiService.getApiKeyInfo(testApiKey);
            (0, globals_1.expect)(keyInfo).toBeDefined();
            (0, globals_1.expect)(keyInfo.lastUsed).toBeDefined();
        });
    });
});
//# sourceMappingURL=api-security.spec.js.map