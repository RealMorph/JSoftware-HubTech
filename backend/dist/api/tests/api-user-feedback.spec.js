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
        this.feedbackState = {
            shouldShowErrorMessage: true,
            shouldIncludeErrorCode: true,
            shouldIncludeHelpLink: true,
            shouldIncludeRecoverySteps: true
        };
        this.userInteractions = {
            errorMessagesShown: 0,
            recoveryPathsOffered: 0,
            helpLinksClicked: 0
        };
    }
    configureFeedback(options) {
        this.feedbackState = Object.assign(Object.assign({}, this.feedbackState), options);
    }
    getInteractionStats() {
        return Object.assign({}, this.userInteractions);
    }
    trackErrorMessageShown() {
        this.userInteractions.errorMessagesShown++;
    }
    trackRecoveryPathOffered() {
        this.userInteractions.recoveryPathsOffered++;
    }
    trackHelpLinkClicked() {
        this.userInteractions.helpLinksClicked++;
    }
    createUserFriendlyError(message, code, recoverySteps) {
        const response = { message };
        if (this.feedbackState.shouldIncludeErrorCode) {
            response.errorCode = code;
        }
        if (this.feedbackState.shouldIncludeHelpLink) {
            response.helpLink = `https://api-docs.example.com/errors/${code}`;
        }
        if (this.feedbackState.shouldIncludeRecoverySteps && recoverySteps) {
            response.recoverySteps = recoverySteps;
            this.trackRecoveryPathOffered();
        }
        this.trackErrorMessageShown();
        return response;
    }
    async generateApiKey(name, permissions = ['read'], tier = 'standard') {
        if (!name || name.trim() === '') {
            if (this.feedbackState.shouldShowErrorMessage) {
                const errorResponse = this.createUserFriendlyError('API key name is required', 'INVALID_NAME', [
                    'Provide a descriptive name for your API key',
                    'Names must be between 3-50 characters'
                ]);
                throw new common_1.BadRequestException(errorResponse);
            }
            else {
                throw new common_1.BadRequestException('Invalid input');
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
    async validateApiKey(key) {
        if (!key || key === 'invalid-key') {
            if (this.feedbackState.shouldShowErrorMessage) {
                const errorResponse = this.createUserFriendlyError('Invalid API key provided', 'INVALID_API_KEY', [
                    'Check that you are using the correct API key',
                    'Ensure the API key is included in the x-api-key header',
                    'Generate a new API key if needed'
                ]);
                throw new common_1.BadRequestException(errorResponse);
            }
            else {
                throw new common_1.BadRequestException('Invalid key');
            }
        }
        if (key === 'expired-key') {
            if (this.feedbackState.shouldShowErrorMessage) {
                const errorResponse = this.createUserFriendlyError('Your API key has expired', 'EXPIRED_API_KEY', [
                    'Generate a new API key',
                    'Revoke the expired key for security'
                ]);
                throw new common_1.BadRequestException(errorResponse);
            }
            else {
                throw new common_1.BadRequestException('Expired key');
            }
        }
        if (key === 'insufficient-permissions') {
            if (this.feedbackState.shouldShowErrorMessage) {
                const errorResponse = this.createUserFriendlyError('Your API key lacks sufficient permissions for this operation', 'INSUFFICIENT_PERMISSIONS', [
                    'Use an API key with appropriate permissions',
                    'Request elevated permissions if needed'
                ]);
                throw new common_1.BadRequestException(errorResponse);
            }
            else {
                throw new common_1.BadRequestException('Insufficient permissions');
            }
        }
        return {
            id: 'valid-id',
            key,
            permissions: ['read', 'write'],
            valid: true
        };
    }
    async checkRateLimit(key) {
        if (key === 'rate-limited') {
            if (this.feedbackState.shouldShowErrorMessage) {
                const errorResponse = this.createUserFriendlyError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', [
                    'Reduce request frequency',
                    'Implement backoff strategy',
                    'Upgrade to a higher tier for increased limits'
                ]);
                const headers = {
                    'X-RateLimit-Limit': '100',
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': `${Math.floor(Date.now() / 1000) + 60}`
                };
                const error = new common_1.BadRequestException(errorResponse);
                error.headers = headers;
                throw error;
            }
            else {
                throw new common_1.BadRequestException('Rate limited');
            }
        }
        return { allowed: true, remaining: 99, limit: 100 };
    }
}
class MockCacheService {
    async get(key) {
        return null;
    }
    async set(key, value) {
        return true;
    }
}
(0, globals_1.describe)('API User Feedback', () => {
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
                }
            ],
        }).compile();
        apiService = moduleFixture.get(api_service_1.ApiService);
        app = moduleFixture.createNestApplication();
        app.use((req, res, next) => {
            const originalSend = res.send;
            res.send = function (body) {
                try {
                    const bodyObj = typeof body === 'string' ? JSON.parse(body) : body;
                    if (bodyObj && bodyObj.statusCode >= 400 && bodyObj.headers) {
                        Object.entries(bodyObj.headers).forEach(([key, value]) => {
                            res.setHeader(key, value);
                        });
                    }
                    if (bodyObj && bodyObj.statusCode >= 400 && bodyObj.error && bodyObj.message) {
                        const error = bodyObj;
                        if (error.headers) {
                            Object.entries(error.headers).forEach(([key, value]) => {
                                res.setHeader(key, value);
                            });
                        }
                    }
                }
                catch (e) {
                    console.log('Error in middleware:', e);
                }
                return originalSend.call(this, body);
            };
            next();
        });
        await app.init();
        server = app.getHttpServer();
    });
    (0, globals_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, globals_1.describe)('Error Notifications', () => {
        (0, globals_1.it)('should provide user-friendly error messages', async () => {
            apiService.configureFeedback({ showErrorMessage: true });
            const response = await request(server)
                .post('/api/keys')
                .send({ name: '' })
                .expect(common_1.HttpStatus.BAD_REQUEST);
            (0, globals_1.expect)(response.body).toHaveProperty('message');
            (0, globals_1.expect)(response.body.message).toContain('API key name is required');
            const stats = apiService.getInteractionStats();
            (0, globals_1.expect)(stats.errorMessagesShown).toBeGreaterThan(0);
        });
        (0, globals_1.it)('should include error codes for troubleshooting', async () => {
            apiService.configureFeedback({
                showErrorMessage: true,
                includeErrorCode: true
            });
            const response = await request(server)
                .post('/api/keys')
                .send({ name: '' });
            (0, globals_1.expect)(response.body).toHaveProperty('errorCode');
            (0, globals_1.expect)(response.body.errorCode).toBe('INVALID_NAME');
        });
        (0, globals_1.it)('should include helpful links for error resolution', async () => {
            apiService.configureFeedback({
                showErrorMessage: true,
                includeErrorCode: true,
                includeHelpLink: true
            });
            const response = await request(server)
                .post('/api/keys')
                .send({ name: '' });
            (0, globals_1.expect)(response.body).toHaveProperty('helpLink');
            (0, globals_1.expect)(response.body.helpLink).toContain('https://api-docs.example.com/errors/');
        });
    });
    (0, globals_1.describe)('Recovery Flows', () => {
        (0, globals_1.it)('should provide recovery steps for validation errors', async () => {
            apiService.configureFeedback({
                showErrorMessage: true,
                includeRecoverySteps: true
            });
            const response = await request(server)
                .get('/api/validate')
                .set('x-api-key', 'invalid-key');
            (0, globals_1.expect)(response.body).toHaveProperty('recoverySteps');
            (0, globals_1.expect)(response.body.recoverySteps).toBeInstanceOf(Array);
            (0, globals_1.expect)(response.body.recoverySteps.length).toBeGreaterThan(0);
            const stats = apiService.getInteractionStats();
            (0, globals_1.expect)(stats.recoveryPathsOffered).toBeGreaterThan(0);
        });
        (0, globals_1.it)('should provide context-specific recovery steps for different errors', async () => {
            apiService.configureFeedback({
                showErrorMessage: true,
                includeRecoverySteps: true
            });
            const expiredResponse = await request(server)
                .get('/api/validate')
                .set('x-api-key', 'expired-key');
            (0, globals_1.expect)(expiredResponse.body.recoverySteps).toContain('Generate a new API key');
            const permissionResponse = await request(server)
                .get('/api/validate')
                .set('x-api-key', 'insufficient-permissions');
            (0, globals_1.expect)(permissionResponse.body.recoverySteps).toContain('Use an API key with appropriate permissions');
        });
        (0, globals_1.it)('should provide upgrading as a recovery option for rate limiting', async () => {
            apiService.configureFeedback({
                showErrorMessage: true,
                includeRecoverySteps: true
            });
            const response = await request(server)
                .get('/api/check-rate-limit')
                .set('x-api-key', 'rate-limited');
            (0, globals_1.expect)(response.body).toHaveProperty('message');
            (0, globals_1.expect)(response.body.message).toContain('Rate limit exceeded');
            (0, globals_1.expect)(response.body).toHaveProperty('recoverySteps');
            (0, globals_1.expect)(response.body.recoverySteps).toContain('Reduce request frequency');
            (0, globals_1.expect)(response.body.recoverySteps).toContain('Implement backoff strategy');
            (0, globals_1.expect)(response.body.recoverySteps).toContain('Upgrade to a higher tier for increased limits');
            (0, globals_1.expect)(response.body).toHaveProperty('errorCode');
            (0, globals_1.expect)(response.body.errorCode).toBe('RATE_LIMIT_EXCEEDED');
        });
    });
    (0, globals_1.describe)('User Guidance', () => {
        (0, globals_1.it)('should provide actionable steps in error messages', async () => {
            apiService.configureFeedback({
                showErrorMessage: true,
                includeRecoverySteps: true
            });
            const response = await request(server)
                .post('/api/keys')
                .send({ name: '' });
            (0, globals_1.expect)(response.body.recoverySteps).toContain('Provide a descriptive name for your API key');
        });
        (0, globals_1.it)('should track user interactions with guidance features', async () => {
            apiService.trackHelpLinkClicked();
            const stats = apiService.getInteractionStats();
            (0, globals_1.expect)(stats.helpLinksClicked).toBe(1);
        });
        (0, globals_1.it)('should provide guidance consistent with documentation', async () => {
            apiService.configureFeedback({
                showErrorMessage: true,
                includeErrorCode: true,
                includeHelpLink: true
            });
            const response = await request(server)
                .get('/api/validate')
                .set('x-api-key', 'invalid-key');
            (0, globals_1.expect)(response.body.helpLink).toContain(response.body.errorCode);
        });
    });
});
//# sourceMappingURL=api-user-feedback.spec.js.map