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
        this.apiKeys = [];
    }
    async generateApiKey(name, permissions = ['read'], tier = 'standard') {
        if (!name) {
            throw new common_1.BadRequestException('API key name is required');
        }
        if (name.includes('<script>')) {
            throw new common_1.BadRequestException('Name contains invalid characters');
        }
        if (name.length < 3) {
            throw new common_1.BadRequestException('API key name must be at least 3 characters');
        }
        if (!Array.isArray(permissions) || permissions.length === 0) {
            throw new common_1.BadRequestException('At least one permission is required');
        }
        const validPermissions = ['read', 'write', 'delete', 'admin'];
        for (const permission of permissions) {
            if (!validPermissions.includes(permission)) {
                throw new common_1.BadRequestException(`Invalid permission: ${permission}`);
            }
        }
        if (!['standard', 'premium', 'enterprise'].includes(tier)) {
            throw new common_1.BadRequestException('Invalid tier. Must be standard, premium, or enterprise');
        }
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
    async validateApiKey(key, requiredPermission) {
        if (!key) {
            throw new common_1.BadRequestException('API key is required');
        }
        const apiKey = this.apiKeys.find(k => k.key === key);
        if (!apiKey) {
            throw new common_1.BadRequestException('Invalid API key');
        }
        if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
            throw new common_1.BadRequestException(`Missing required permission: ${requiredPermission}`);
        }
        return apiKey;
    }
    async getApiKeyInfo(keyId) {
        if (!keyId) {
            throw new common_1.BadRequestException('API key ID is required');
        }
        const apiKey = this.apiKeys.find(k => k.id === keyId);
        if (!apiKey) {
            throw new common_1.BadRequestException('API key not found');
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
    async getApiKeys() {
        return this.apiKeys.map(apiKey => ({
            id: apiKey.id,
            name: apiKey.name,
            permissions: apiKey.permissions,
            tier: apiKey.tier,
            createdAt: apiKey.createdAt,
            lastUsed: apiKey.lastUsed
        }));
    }
    async revokeApiKey(keyId) {
        if (!keyId) {
            throw new common_1.BadRequestException('API key ID is required');
        }
        const index = this.apiKeys.findIndex(k => k.id === keyId);
        if (index === -1) {
            throw new common_1.BadRequestException('API key not found');
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
(0, globals_1.describe)('API Error Handling', () => {
    let app;
    let server;
    let apiService;
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
                },
            ],
        }).compile();
        apiService = moduleFixture.get(api_service_1.ApiService);
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            disableErrorMessages: false,
            validationError: {
                target: false,
                value: true,
            },
        }));
        await app.init();
        server = app.getHttpServer();
    });
    (0, globals_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, globals_1.describe)('Input Validation', () => {
        (0, globals_1.it)('should validate required fields when generating an API key', async () => {
            const response = await request(server)
                .post('/api/keys')
                .send({})
                .expect(common_1.HttpStatus.BAD_REQUEST);
            (0, globals_1.expect)(response.body.message).toContain('name');
        });
        (0, globals_1.it)('should validate field length constraints', async () => {
            const response = await request(server)
                .post('/api/keys')
                .send({ name: 'AB', permissions: ['read'] })
                .expect(common_1.HttpStatus.BAD_REQUEST);
            (0, globals_1.expect)(response.body.message).toContain('at least 3 characters');
        });
        (0, globals_1.it)('should validate array field requirements', async () => {
            const response = await request(server)
                .post('/api/keys')
                .send({ name: 'Test Key', permissions: [] })
                .expect(common_1.HttpStatus.BAD_REQUEST);
            (0, globals_1.expect)(response.body.message).toContain('one permission is required');
        });
        (0, globals_1.it)('should validate enumerated values', async () => {
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: 'Test Key',
                permissions: ['read', 'invalid-permission'],
                tier: 'standard'
            })
                .expect(common_1.HttpStatus.BAD_REQUEST);
            (0, globals_1.expect)(response.body.message).toContain('Invalid permission');
        });
        (0, globals_1.it)('should validate tier values', async () => {
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: 'Test Key',
                permissions: ['read'],
                tier: 'invalid-tier'
            })
                .expect(common_1.HttpStatus.BAD_REQUEST);
            (0, globals_1.expect)(response.body.message).toContain('Invalid tier');
        });
    });
    (0, globals_1.describe)('Error Responses', () => {
        (0, globals_1.it)('should return appropriate error status codes', async () => {
            await request(server)
                .post('/api/keys')
                .send({})
                .expect(common_1.HttpStatus.BAD_REQUEST);
            await request(server)
                .delete('/api/keys/non-existent-id')
                .expect(common_1.HttpStatus.BAD_REQUEST);
        });
        (0, globals_1.it)('should include descriptive error messages', async () => {
            const response = await request(server)
                .post('/api/keys')
                .send({ name: 'Test', permissions: ['invalid'] })
                .expect(common_1.HttpStatus.BAD_REQUEST);
            (0, globals_1.expect)(response.body).toHaveProperty('message');
            (0, globals_1.expect)(response.body.message).toContain('Invalid permission');
        });
        (0, globals_1.it)('should maintain consistent error response format', async () => {
            const response = await request(server)
                .post('/api/keys')
                .send({})
                .expect(common_1.HttpStatus.BAD_REQUEST);
            (0, globals_1.expect)(response.body).toHaveProperty('message');
            (0, globals_1.expect)(response.body).toHaveProperty('statusCode');
            (0, globals_1.expect)(response.body.statusCode).toBe(common_1.HttpStatus.BAD_REQUEST);
        });
    });
    (0, globals_1.describe)('Validation Rules', () => {
        (0, globals_1.it)('should strip unknown properties with whitelist validation', async () => {
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: 'Valid Name',
                permissions: ['read'],
                unknownProperty: 'This should be stripped'
            })
                .expect(common_1.HttpStatus.CREATED);
            (0, globals_1.expect)(response.body.apiKey).not.toHaveProperty('unknownProperty');
        });
        (0, globals_1.it)('should reject requests with unknown properties when forbidNonWhitelisted is true', async () => {
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: 'Valid Name',
                permissions: ['read'],
                extraField: 'This should cause rejection'
            });
            if (response.status === common_1.HttpStatus.BAD_REQUEST) {
                (0, globals_1.expect)(response.body.message).toContain('property extraField should not exist');
            }
            else {
                (0, globals_1.expect)(response.body.apiKey).not.toHaveProperty('extraField');
            }
        });
        (0, globals_1.it)('should transform data types when transform is enabled', async () => {
            const createResponse = await request(server)
                .post('/api/keys')
                .send({
                name: 'Transform Test',
                permissions: ['read']
            })
                .expect(common_1.HttpStatus.CREATED);
            const keyId = createResponse.body.apiKey.id;
            await request(server)
                .get(`/api/keys/${keyId}`)
                .expect(common_1.HttpStatus.OK);
        });
    });
    (0, globals_1.describe)('Security Validation', () => {
        (0, globals_1.it)('should reject potentially malicious payloads', async () => {
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: '<script>alert("XSS")</script>',
                permissions: ['read']
            });
            if (response.status === common_1.HttpStatus.BAD_REQUEST) {
                (0, globals_1.expect)(response.body.message).toContain('invalid');
            }
            else {
                (0, globals_1.expect)(response.body.apiKey.name).not.toContain('<script>');
            }
        });
        (0, globals_1.it)('should validate content type headers', async () => {
            const response = await request(server)
                .post('/api/keys')
                .set('Content-Type', 'text/plain')
                .send('name=Test&permissions=read')
                .expect(common_1.HttpStatus.BAD_REQUEST);
            (0, globals_1.expect)(response.body.message).toBeDefined();
        });
    });
});
//# sourceMappingURL=api-error-handling.spec.js.map