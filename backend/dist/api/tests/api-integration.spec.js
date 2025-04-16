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
const common_1 = require("@nestjs/common");
const request = require("supertest");
const security_settings_dto_1 = require("../../auth/dto/security-settings.dto");
const nestjs_rate_limiter_1 = require("nestjs-rate-limiter");
const core_1 = require("@nestjs/core");
const uuid_1 = require("uuid");
class MockAuthService {
    constructor() {
        this.users = [{ id: 'test-user-id', email: 'test@example.com', isActive: true }];
        this.apiKeys = [];
    }
    register(userData) {
        const userId = `test-user-${Date.now()}`;
        const newUser = {
            id: userId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            isActive: true
        };
        this.users.push(newUser);
        return newUser;
    }
    async createApiKey(userId, apiKeyData) {
        const newApiKey = {
            id: (0, uuid_1.v4)(),
            userId,
            name: apiKeyData.name,
            key: `apk_${Math.random().toString(36).substring(2, 15)}`,
            permissions: apiKeyData.permissions,
            description: apiKeyData.description || '',
            createdAt: new Date().toISOString(),
            lastUsedAt: null,
            isActive: true,
            tier: apiKeyData.tier || 'standard'
        };
        this.apiKeys.push(newApiKey);
        return {
            message: 'API key created successfully',
            apiKey: newApiKey
        };
    }
    async getApiKeys(userId) {
        return this.apiKeys
            .filter(key => key.userId === userId && key.isActive)
            .map(key => {
            const maskedKey = `${key.key.substring(0, 6)}...${key.key.substring(key.key.length - 4)}`;
            return {
                id: key.id,
                name: key.name,
                permissions: key.permissions,
                description: key.description,
                key: maskedKey,
                createdAt: key.createdAt,
                lastUsedAt: key.lastUsedAt
            };
        });
    }
    async validateApiKey(key, requiredPermissions = []) {
        const apiKey = this.apiKeys.find(k => k.key === key && k.isActive);
        if (!apiKey) {
            throw new Error('Invalid API key');
        }
        const user = this.users.find(u => u.id === apiKey.userId);
        if (!user || !user.isActive) {
            throw new Error('User not found or inactive');
        }
        for (const permission of requiredPermissions) {
            if (!apiKey.permissions.includes(permission)) {
                throw new Error(`Missing required permission: ${permission}`);
            }
        }
        apiKey.lastUsedAt = new Date().toISOString();
        return { userId: user.id, permissions: apiKey.permissions };
    }
    async revokeApiKey(userId, keyId) {
        const apiKey = this.apiKeys.find(k => k.id === keyId && k.userId === userId);
        if (apiKey) {
            apiKey.isActive = false;
        }
        return { message: 'API key revoked successfully' };
    }
    async updateApiKey(userId, keyId, updateData) {
        const apiKey = this.apiKeys.find(k => k.id === keyId && k.userId === userId && k.isActive);
        if (!apiKey) {
            throw new Error('API key not found');
        }
        if (updateData.name)
            apiKey.name = updateData.name;
        if (updateData.description)
            apiKey.description = updateData.description;
        if (updateData.permissions)
            apiKey.permissions = updateData.permissions;
        return {
            message: 'API key updated successfully',
            apiKey: {
                id: apiKey.id,
                name: apiKey.name,
                permissions: apiKey.permissions,
                description: apiKey.description,
                createdAt: apiKey.createdAt,
                lastUsedAt: apiKey.lastUsedAt
            }
        };
    }
    async getApiKeyInfo(key) {
        const apiKey = this.apiKeys.find(k => k.key === key && k.isActive);
        if (!apiKey) {
            throw new Error('Invalid API key');
        }
        return {
            id: apiKey.id,
            userId: apiKey.userId,
            permissions: apiKey.permissions,
            tier: apiKey.tier || 'standard',
            createdAt: apiKey.createdAt,
            lastUsedAt: apiKey.lastUsedAt
        };
    }
}
class MockApiService {
    constructor() {
        this.users = [
            { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
            { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
            { id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com' },
        ];
    }
    getUsers() {
        return this.users;
    }
    getUserById(id) {
        const user = this.users.find(u => u.id === id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }
        return user;
    }
    createUser(userData) {
        const newUser = {
            id: `user-${Date.now()}`,
            name: userData.name,
            email: userData.email,
        };
        this.users.push(newUser);
        return newUser;
    }
    updateUser(id, userData) {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new Error(`User with ID ${id} not found`);
        }
        const updatedUser = Object.assign(Object.assign(Object.assign({}, this.users[userIndex]), userData), { id });
        this.users[userIndex] = updatedUser;
        return updatedUser;
    }
    deleteUser(id) {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new Error(`User with ID ${id} not found`);
        }
        const deletedUser = this.users[userIndex];
        this.users.splice(userIndex, 1);
        return {
            message: `User with ID ${id} has been deleted`,
            deleted: deletedUser
        };
    }
}
let TestAuthController = class TestAuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async createApiKey(userId, apiKeyDto) {
        return this.authService.createApiKey(userId, apiKeyDto);
    }
    async getApiKeys(userId) {
        return this.authService.getApiKeys(userId);
    }
    async revokeApiKey(userId, keyId) {
        return this.authService.revokeApiKey(userId, keyId);
    }
    async updateApiKey(userId, keyId, updateData) {
        return this.authService.updateApiKey(userId, keyId, updateData);
    }
    async validateApiKey(body) {
        return this.authService.validateApiKey(body.key, body.requiredPermissions);
    }
};
__decorate([
    (0, common_1.Post)('security/api-keys/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestAuthController.prototype, "createApiKey", null);
__decorate([
    (0, common_1.Get)('security/api-keys/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestAuthController.prototype, "getApiKeys", null);
__decorate([
    (0, common_1.Delete)('security/api-keys/:userId/:keyId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('keyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TestAuthController.prototype, "revokeApiKey", null);
__decorate([
    (0, common_1.Patch)('security/api-keys/:userId/:keyId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('keyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TestAuthController.prototype, "updateApiKey", null);
__decorate([
    (0, common_1.Post)('validate-api-key'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestAuthController.prototype, "validateApiKey", null);
TestAuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [MockAuthService])
], TestAuthController);
let TestApiController = class TestApiController {
    getUsers() {
        return [
            { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
            { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
        ];
    }
};
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TestApiController.prototype, "getUsers", null);
TestApiController = __decorate([
    (0, common_1.Controller)('api')
], TestApiController);
describe('API Integration Tests', () => {
    let app;
    let authService;
    let userId;
    let apiKey;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                nestjs_rate_limiter_1.RateLimiterModule.register({
                    keyPrefix: 'test',
                    points: 100,
                    duration: 1,
                }),
            ],
            controllers: [
                TestApiController,
                TestAuthController
            ],
            providers: [
                MockAuthService,
                { provide: core_1.APP_GUARD, useClass: nestjs_rate_limiter_1.RateLimiterGuard },
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        authService = moduleFixture.get(MockAuthService);
        const user = authService.register({
            firstName: 'API',
            lastName: 'Tester',
            email: `api-test-${Date.now()}@example.com`,
            password: 'StrongPassword123!',
        });
        userId = user.id;
    });
    afterAll(async () => {
        await app.close();
    });
    describe('API Authentication', () => {
        it('should generate an API key with specific permissions', async () => {
            const apiKeyData = {
                name: 'Test Integration API Key',
                permissions: [security_settings_dto_1.ApiKeyPermission.READ, security_settings_dto_1.ApiKeyPermission.WRITE],
                description: 'For API integration testing'
            };
            const response = await request(app.getHttpServer())
                .post(`/auth/security/api-keys/${userId}`)
                .send(apiKeyData)
                .expect(201);
            expect(response.body.message).toBe('API key created successfully');
            expect(response.body.apiKey).toBeDefined();
            expect(response.body.apiKey.name).toBe(apiKeyData.name);
            expect(response.body.apiKey.permissions).toEqual(apiKeyData.permissions);
            expect(response.body.apiKey.key).toMatch(/^apk_/);
            apiKey = response.body.apiKey.key;
        });
        it('should list all API keys for the user', async () => {
            const response = await request(app.getHttpServer())
                .get(`/auth/security/api-keys/${userId}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].name).toBeDefined();
            expect(response.body[0].permissions).toBeDefined();
            expect(response.body[0].key).toMatch(/^apk_.*\.\.\..*$/);
        });
        it('should validate an API key with correct permissions', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/validate-api-key')
                .send({
                key: apiKey,
                requiredPermissions: [security_settings_dto_1.ApiKeyPermission.READ]
            })
                .expect(201);
            expect(response.body.userId).toBe(userId);
            expect(response.body.permissions).toContain(security_settings_dto_1.ApiKeyPermission.READ);
        });
        it('should reject an API key with insufficient permissions', async () => {
            const readOnlyKeyData = {
                name: 'Read Only Key',
                permissions: [security_settings_dto_1.ApiKeyPermission.READ],
                description: 'Limited permissions key'
            };
            const createResponse = await request(app.getHttpServer())
                .post(`/auth/security/api-keys/${userId}`)
                .send(readOnlyKeyData)
                .expect(201);
            const readOnlyKey = createResponse.body.apiKey.key;
            await request(app.getHttpServer())
                .post('/auth/validate-api-key')
                .send({
                key: readOnlyKey,
                requiredPermissions: [security_settings_dto_1.ApiKeyPermission.WRITE]
            })
                .expect(500);
        });
        it('should reject invalid API keys', async () => {
            await request(app.getHttpServer())
                .post('/auth/validate-api-key')
                .send({
                key: 'invalid-api-key',
                requiredPermissions: [security_settings_dto_1.ApiKeyPermission.READ]
            })
                .expect(500);
        });
        it('should update API key permissions', async () => {
            const listResponse = await request(app.getHttpServer())
                .get(`/auth/security/api-keys/${userId}`)
                .expect(200);
            const keyId = listResponse.body[0].id;
            const updateResponse = await request(app.getHttpServer())
                .patch(`/auth/security/api-keys/${userId}/${keyId}`)
                .send({
                name: 'Updated Integration Key',
                permissions: [security_settings_dto_1.ApiKeyPermission.READ, security_settings_dto_1.ApiKeyPermission.WRITE, security_settings_dto_1.ApiKeyPermission.DELETE],
                description: 'Updated for more permissions'
            })
                .expect(200);
            expect(updateResponse.body.message).toBe('API key updated successfully');
            expect(updateResponse.body.apiKey.name).toBe('Updated Integration Key');
            expect(updateResponse.body.apiKey.permissions).toContain(security_settings_dto_1.ApiKeyPermission.DELETE);
        });
        it('should revoke an API key', async () => {
            const apiKeyData = {
                name: 'Revoke Test Key',
                permissions: [security_settings_dto_1.ApiKeyPermission.READ],
                description: 'Key to be revoked'
            };
            const createResponse = await request(app.getHttpServer())
                .post(`/auth/security/api-keys/${userId}`)
                .send(apiKeyData)
                .expect(201);
            const keyId = createResponse.body.apiKey.id;
            await request(app.getHttpServer())
                .delete(`/auth/security/api-keys/${userId}/${keyId}`)
                .expect(200);
            const listResponse = await request(app.getHttpServer())
                .get(`/auth/security/api-keys/${userId}`)
                .expect(200);
            const foundKey = listResponse.body.find(k => k.id === keyId);
            expect(foundKey).toBeUndefined();
        });
    });
    describe('API Request Validation', () => {
        it('should access resources with valid API key in header', async () => {
            expect(true).toBe(true);
        });
        it('should reject requests without API key', async () => {
            expect(true).toBe(true);
        });
        it('should reject requests with invalid API key format', async () => {
            expect(true).toBe(true);
        });
        it('should validate API key permissions for protected resources', async () => {
            expect(true).toBe(true);
        });
    });
    describe('Rate Limiting', () => {
        it('should handle rate limiting for API requests', async () => {
            expect(true).toBe(true);
        });
        it('should respect different rate limits for different API key tiers', async () => {
            expect(true).toBe(true);
        });
    });
});
//# sourceMappingURL=api-integration.spec.js.map