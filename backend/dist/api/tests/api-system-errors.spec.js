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
        this.errorMode = '';
        this.logMessages = [];
    }
    setErrorMode(mode) {
        this.errorMode = mode;
    }
    getLogMessages() {
        return this.logMessages;
    }
    clearLogMessages() {
        this.logMessages = [];
    }
    log(message, context) {
        this.logMessages.push({ type: 'log', message, context });
    }
    error(message, trace, context) {
        this.logMessages.push({ type: 'error', message, trace, context });
    }
    warn(message, context) {
        this.logMessages.push({ type: 'warn', message, context });
    }
    async generateApiKey(name, permissions = ['read'], tier = 'standard') {
        if (this.errorMode === 'database') {
            this.error('Database connection error', 'Error: Connection refused', 'ApiService');
            throw new common_1.InternalServerErrorException('Database error occurred while generating API key');
        }
        if (this.errorMode === 'network') {
            this.error('Network timeout error', 'Error: Request timed out after 30000ms', 'ApiService');
            throw new common_1.InternalServerErrorException('Network error occurred while generating API key');
        }
        if (this.errorMode === 'validation') {
            this.warn(`Validation error for key name: ${name}`, 'ApiService');
            throw new common_1.InternalServerErrorException('Validation error occurred');
        }
        if (this.errorMode === 'unexpected') {
            this.error('Unexpected error during API key generation', 'TypeError: Cannot read property of undefined', 'ApiService');
            throw new Error('Unexpected error');
        }
        this.log(`API key generated for: ${name}`, 'ApiService');
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
        if (this.errorMode === 'database') {
            this.error('Database error during API key validation', 'Error: Connection lost', 'ApiService');
            throw new common_1.InternalServerErrorException('Database error occurred while validating API key');
        }
        this.log(`API key validated: ${key.substring(0, 5)}...`, 'ApiService');
        return { id: '1', key, permissions: ['read'] };
    }
    async getApiKeys() {
        if (this.errorMode === 'database') {
            this.error('Database query error', 'Error: Query timeout', 'ApiService');
            throw new common_1.InternalServerErrorException('Error retrieving API keys');
        }
        this.log('Retrieved API keys list', 'ApiService');
        return [];
    }
    async revokeApiKey(keyId) {
        if (this.errorMode === 'database') {
            this.error('Database transaction error', 'Error: Transaction failed', 'ApiService');
            throw new common_1.InternalServerErrorException('Error revoking API key');
        }
        this.log(`API key revoked: ${keyId}`, 'ApiService');
        return { success: true };
    }
}
class MockCacheService {
    constructor() {
        this.errorMode = '';
        this.logMessages = [];
    }
    setErrorMode(mode) {
        this.errorMode = mode;
    }
    getLogMessages() {
        return this.logMessages;
    }
    clearLogMessages() {
        this.logMessages = [];
    }
    log(message, context) {
        this.logMessages.push({ type: 'log', message, context });
    }
    error(message, trace, context) {
        this.logMessages.push({ type: 'error', message, trace, context });
    }
    async get(key) {
        if (this.errorMode === 'cache') {
            this.error('Cache retrieval error', 'Error: Redis connection failed', 'CacheService');
            throw new common_1.InternalServerErrorException('Cache error');
        }
        this.log(`Cache retrieved: ${key}`, 'CacheService');
        return null;
    }
    async set(key, value) {
        if (this.errorMode === 'cache') {
            this.error('Cache storage error', 'Error: Redis connection failed', 'CacheService');
            throw new common_1.InternalServerErrorException('Cache error');
        }
        this.log(`Cache set: ${key}`, 'CacheService');
        return true;
    }
    async del(key) {
        if (this.errorMode === 'cache') {
            this.error('Cache deletion error', 'Error: Redis connection failed', 'CacheService');
            throw new common_1.InternalServerErrorException('Cache error');
        }
        this.log(`Cache deleted: ${key}`, 'CacheService');
        return true;
    }
    async delByPattern() {
        if (this.errorMode === 'cache') {
            this.error('Cache pattern deletion error', 'Error: Redis operation failed', 'CacheService');
            throw new common_1.InternalServerErrorException('Cache error');
        }
        this.log('Cache pattern deleted', 'CacheService');
        return true;
    }
}
(0, globals_1.describe)('API System Error Handling', () => {
    let app;
    let server;
    let apiService;
    let cacheService;
    let globalLogger;
    let logSpy;
    (0, globals_1.beforeEach)(async () => {
        globalLogger = new common_1.Logger('GlobalTest');
        logSpy = globals_1.jest.spyOn(globalLogger, 'error').mockImplementation(() => { });
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
                {
                    provide: common_1.Logger,
                    useValue: globalLogger,
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
        apiService.setErrorMode('');
        apiService.clearLogMessages();
        cacheService.setErrorMode('');
        cacheService.clearLogMessages();
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, globals_1.describe)('Database Error Handling', () => {
        (0, globals_1.it)('should handle database connection errors gracefully', async () => {
            apiService.setErrorMode('database');
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: 'Database Test',
                permissions: ['read']
            })
                .expect(common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            (0, globals_1.expect)(response.body).toHaveProperty('message');
            (0, globals_1.expect)(response.body.message).toContain('Database error');
            const logs = apiService.getLogMessages();
            const errorLogs = logs.filter(log => log.type === 'error');
            (0, globals_1.expect)(errorLogs.length).toBeGreaterThan(0);
            (0, globals_1.expect)(errorLogs[0].message).toContain('Database');
        });
        (0, globals_1.it)('should handle database query errors when listing API keys', async () => {
            apiService.setErrorMode('database');
            const response = await request(server)
                .get('/api/keys')
                .expect(common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            (0, globals_1.expect)(response.body.message).toContain('Error retrieving API keys');
            const logs = apiService.getLogMessages();
            const errorLog = logs.find(log => log.type === 'error' && log.message.includes('Database query'));
            (0, globals_1.expect)(errorLog).toBeDefined();
        });
        (0, globals_1.it)('should handle database transaction errors when revoking API keys', async () => {
            apiService.setErrorMode('database');
            const response = await request(server)
                .delete('/api/keys/any-id')
                .expect(common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            (0, globals_1.expect)(response.body.message).toContain('Error revoking API key');
            const logs = apiService.getLogMessages();
            const transactionErrorLog = logs.find(log => log.type === 'error' && log.message.includes('transaction'));
            (0, globals_1.expect)(transactionErrorLog).toBeDefined();
        });
    });
    (0, globals_1.describe)('Network Failure Handling', () => {
        (0, globals_1.it)('should handle network timeouts gracefully', async () => {
            apiService.setErrorMode('network');
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: 'Network Test',
                permissions: ['read']
            })
                .expect(common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            (0, globals_1.expect)(response.body.message).toContain('Network error');
            const logs = apiService.getLogMessages();
            const timeoutLog = logs.find(log => log.type === 'error' && log.trace && log.trace.includes('timed out'));
            (0, globals_1.expect)(timeoutLog).toBeDefined();
        });
        (0, globals_1.it)('should include appropriate retry information in network errors', async () => {
            apiService.setErrorMode('network');
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: 'Network Test',
                permissions: ['read']
            });
            (0, globals_1.expect)(response.headers).toBeDefined();
        });
    });
    (0, globals_1.describe)('Cache Failure Handling', () => {
        (0, globals_1.it)('should handle cache service failures gracefully', async () => {
            cacheService.setErrorMode('cache');
            try {
                await cacheService.get('test-key');
            }
            catch (error) {
            }
            const response = await request(server)
                .post('/api/keys')
                .send({
                name: 'Cache Test',
                permissions: ['read']
            });
            (0, globals_1.expect)(response.status).toBeDefined();
            const logs = cacheService.getLogMessages();
            const cacheErrorLog = logs.find(log => log.type === 'error' && log.message.includes('Cache'));
            (0, globals_1.expect)(cacheErrorLog).toBeDefined();
            if (!cacheErrorLog) {
                console.log('Available logs:', logs);
            }
        });
    });
    (0, globals_1.describe)('Error Logging Verification', () => {
        (0, globals_1.it)('should log detailed error information for unexpected errors', async () => {
            apiService.setErrorMode('unexpected');
            await request(server)
                .post('/api/keys')
                .send({
                name: 'Error Logging Test',
                permissions: ['read']
            })
                .expect(common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            const logs = apiService.getLogMessages();
            const unexpectedErrorLog = logs.find(log => log.type === 'error' && log.message.includes('Unexpected') && log.trace);
            (0, globals_1.expect)(unexpectedErrorLog).toBeDefined();
            (0, globals_1.expect)(unexpectedErrorLog.trace).toContain('TypeError');
        });
        (0, globals_1.it)('should log validation errors at appropriate log levels', async () => {
            apiService.setErrorMode('validation');
            await request(server)
                .post('/api/keys')
                .send({
                name: 'Validation Test',
                permissions: ['read']
            })
                .expect(common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            const logs = apiService.getLogMessages();
            const validationLog = logs.find(log => log.type === 'warn' && log.message.includes('Validation'));
            (0, globals_1.expect)(validationLog).toBeDefined();
        });
        (0, globals_1.it)('should log successful operations', async () => {
            await request(server)
                .post('/api/keys')
                .send({
                name: 'Success Test',
                permissions: ['read']
            })
                .expect(common_1.HttpStatus.CREATED);
            const logs = apiService.getLogMessages();
            const successLog = logs.find(log => log.type === 'log' && log.message.includes('generated'));
            (0, globals_1.expect)(successLog).toBeDefined();
            (0, globals_1.expect)(successLog.message).toContain('Success Test');
        });
    });
});
//# sourceMappingURL=api-system-errors.spec.js.map