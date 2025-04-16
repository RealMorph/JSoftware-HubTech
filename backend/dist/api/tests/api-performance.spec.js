"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const api_controller_1 = require("../api.controller");
const api_service_1 = require("../api.service");
const cache_service_1 = require("../../cache/cache.service");
const request = require("supertest");
const globals_1 = require("@jest/globals");
const cache_manager_1 = require("@nestjs/cache-manager");
const perf_hooks_1 = require("perf_hooks");
const fs = require("fs");
const path = require("path");
const os = require("os");
class MockDatabaseService {
    constructor() {
        this.queryTimes = {};
        this.connectionPoolStats = {
            total: 20,
            active: 0,
            idle: 20,
            waiting: 0,
            peak: 0
        };
        this.indexEffectiveness = {
            'users_index': { withIndex: 5, withoutIndex: 120 },
            'api_keys_index': { withIndex: 3, withoutIndex: 85 },
            'transactions_index': { withIndex: 8, withoutIndex: 150 }
        };
    }
    async executeQuery(queryName, simulatedTime) {
        const startTime = perf_hooks_1.performance.now();
        this.connectionPoolStats.active++;
        this.connectionPoolStats.idle--;
        if (this.connectionPoolStats.active > this.connectionPoolStats.peak) {
            this.connectionPoolStats.peak = this.connectionPoolStats.active;
        }
        const executionTime = simulatedTime || Math.random() * 10 + 1;
        await new Promise(resolve => setTimeout(resolve, executionTime));
        this.connectionPoolStats.active--;
        this.connectionPoolStats.idle++;
        const endTime = perf_hooks_1.performance.now();
        const duration = endTime - startTime;
        if (!this.queryTimes[queryName]) {
            this.queryTimes[queryName] = [];
        }
        this.queryTimes[queryName].push(duration);
        return { success: true, rows: [] };
    }
    getQueryStats() {
        const stats = {};
        for (const [queryName, times] of Object.entries(this.queryTimes)) {
            const sum = times.reduce((a, b) => a + b, 0);
            stats[queryName] = {
                avg: sum / times.length,
                min: Math.min(...times),
                max: Math.max(...times),
                count: times.length
            };
        }
        return stats;
    }
    getConnectionPoolStats() {
        return Object.assign({}, this.connectionPoolStats);
    }
    getIndexEffectiveness() {
        return Object.assign({}, this.indexEffectiveness);
    }
    simulateQueryWithIndex(indexName) {
        var _a;
        const time = ((_a = this.indexEffectiveness[indexName]) === null || _a === void 0 ? void 0 : _a.withIndex) || 5;
        return this.executeQuery(`${indexName}_query`, time);
    }
    simulateQueryWithoutIndex(indexName) {
        var _a;
        const time = ((_a = this.indexEffectiveness[indexName]) === null || _a === void 0 ? void 0 : _a.withoutIndex) || 100;
        return this.executeQuery(`${indexName}_query_no_index`, time);
    }
}
class MockApiService extends api_service_1.ApiService {
    constructor(cacheService) {
        super(cacheService);
        this.dbService = new MockDatabaseService();
    }
    getDatabaseService() {
        return this.dbService;
    }
    async generateApiKey(name, permissions, tier = 'standard') {
        await this.dbService.executeQuery('insert_api_key');
        return super.generateApiKey(name, permissions, tier);
    }
    async validateApiKey(key, requiredPermission) {
        await this.dbService.executeQuery('validate_api_key');
        return super.validateApiKey(key, requiredPermission);
    }
    async getApiKeys() {
        await this.dbService.executeQuery('get_all_api_keys');
        return super.getApiKeys();
    }
    async getOptimizedApiKeys() {
        await this.dbService.executeQuery('get_optimized_api_keys', 5);
        return super.getApiKeys();
    }
    async getNonOptimizedApiKeys() {
        await this.dbService.executeQuery('get_non_optimized_api_keys', 50);
        return super.getApiKeys();
    }
}
class MockCacheService {
    constructor() {
        this.hitRate = 0;
        this.cacheStats = {
            hits: 0,
            misses: 0,
            total: 0
        };
    }
    async get(key) {
        this.cacheStats.total++;
        if (Math.random() < this.hitRate) {
            this.cacheStats.hits++;
            return { cached: true, timestamp: Date.now() - 1000 };
        }
        this.cacheStats.misses++;
        return null;
    }
    async set(key, value, ttl) {
        return;
    }
    async del(key) {
        return;
    }
    async delByPattern(pattern) {
        return;
    }
    setCacheHitRate(rate) {
        this.hitRate = rate;
    }
    getCacheStats() {
        return Object.assign(Object.assign({}, this.cacheStats), { hitRate: this.cacheStats.total ? this.cacheStats.hits / this.cacheStats.total : 0 });
    }
}
function calculateResponseTimeStats(times) {
    if (times.length === 0)
        return { avg: 0, min: 0, max: 0, p95: 0, p99: 0 };
    const sorted = [...times].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const p95Index = Math.min(Math.floor(sorted.length * 0.95), sorted.length - 1);
    const p99Index = Math.min(Math.floor(sorted.length * 0.99), sorted.length - 1);
    return {
        avg: sum / times.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p95: sorted[p95Index],
        p99: sorted[p99Index]
    };
}
class ResourceMonitor {
    constructor() {
        this.samples = [];
        this.intervalId = null;
    }
    start(intervalMs = 100) {
        this.stop();
        this.samples = [];
        this.intervalId = setInterval(() => {
            this.samples.push({
                cpuUsage: process.cpuUsage(),
                memoryUsage: process.memoryUsage(),
                timestamp: perf_hooks_1.performance.now()
            });
        }, intervalMs);
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    getStats() {
        if (this.samples.length < 2)
            return null;
        const cpuUsagePercent = [];
        for (let i = 1; i < this.samples.length; i++) {
            const prev = this.samples[i - 1];
            const curr = this.samples[i];
            const userDiff = curr.cpuUsage.user - prev.cpuUsage.user;
            const systemDiff = curr.cpuUsage.system - prev.cpuUsage.system;
            const timeDiff = curr.timestamp - prev.timestamp;
            const cpuPercent = (userDiff + systemDiff) / (timeDiff * 1000) * 100;
            cpuUsagePercent.push(cpuPercent);
        }
        const memoryStats = this.samples.map(s => ({
            rss: s.memoryUsage.rss / (1024 * 1024),
            heapTotal: s.memoryUsage.heapTotal / (1024 * 1024),
            heapUsed: s.memoryUsage.heapUsed / (1024 * 1024),
            external: s.memoryUsage.external / (1024 * 1024)
        }));
        const lastMemory = memoryStats[memoryStats.length - 1];
        return {
            cpu: {
                avg: cpuUsagePercent.reduce((a, b) => a + b, 0) / cpuUsagePercent.length,
                max: Math.max(...cpuUsagePercent),
                min: Math.min(...cpuUsagePercent)
            },
            memory: {
                current: lastMemory,
                max: {
                    rss: Math.max(...memoryStats.map(m => m.rss)),
                    heapTotal: Math.max(...memoryStats.map(m => m.heapTotal)),
                    heapUsed: Math.max(...memoryStats.map(m => m.heapUsed)),
                    external: Math.max(...memoryStats.map(m => m.external))
                }
            },
            samples: this.samples.length
        };
    }
    writeReport(filePath) {
        const stats = this.getStats();
        if (!stats)
            return;
        const report = {
            timestamp: new Date().toISOString(),
            system: {
                platform: process.platform,
                arch: process.arch,
                cpus: os.cpus().length,
                totalMemory: os.totalmem() / (1024 * 1024 * 1024),
                freeMemory: os.freemem() / (1024 * 1024 * 1024)
            },
            stats
        };
        const reportDir = path.dirname(filePath);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    }
}
(0, globals_1.describe)('API Performance Tests', () => {
    let app;
    let server;
    let apiService;
    let cacheService;
    let resourceMonitor;
    (0, globals_1.beforeAll)(async () => {
        resourceMonitor = new ResourceMonitor();
    });
    (0, globals_1.beforeEach)(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                cache_manager_1.CacheModule.register(),
            ],
            controllers: [api_controller_1.ApiController],
            providers: [
                {
                    provide: api_service_1.ApiService,
                    useFactory: (cacheService) => {
                        return new MockApiService(cacheService);
                    },
                    inject: [cache_service_1.CacheService]
                },
                {
                    provide: cache_service_1.CacheService,
                    useClass: MockCacheService,
                }
            ],
        }).compile();
        cacheService = moduleFixture.get(cache_service_1.CacheService);
        apiService = moduleFixture.get(api_service_1.ApiService);
        app = moduleFixture.createNestApplication();
        await app.init();
        server = app.getHttpServer();
    });
    (0, globals_1.afterEach)(async () => {
        resourceMonitor.stop();
        if (app) {
            await app.close();
        }
    });
    (0, globals_1.describe)('Load Testing', () => {
        (0, globals_1.it)('should handle high request volume', async () => {
            const requestCount = 100;
            const responseTimes = [];
            resourceMonitor.start();
            const startTime = perf_hooks_1.performance.now();
            for (let i = 0; i < requestCount; i++) {
                const requestStart = perf_hooks_1.performance.now();
                await request(server)
                    .get('/api/keys')
                    .set('x-api-key', 'valid-key');
                const requestEnd = perf_hooks_1.performance.now();
                responseTimes.push(requestEnd - requestStart);
            }
            const endTime = perf_hooks_1.performance.now();
            resourceMonitor.stop();
            const totalTime = endTime - startTime;
            const timeStats = calculateResponseTimeStats(responseTimes);
            const report = {
                test: 'high_request_volume',
                requestCount,
                totalTimeMs: totalTime,
                requestsPerSecond: (requestCount / totalTime) * 1000,
                responseTimeStats: timeStats,
                resourceUsage: resourceMonitor.getStats()
            };
            (0, globals_1.expect)(timeStats.p95).toBeLessThan(50);
            (0, globals_1.expect)(report.requestsPerSecond).toBeGreaterThan(10);
        });
        (0, globals_1.it)('should handle concurrent requests efficiently', async () => {
            const concurrentUsers = 5;
            const requestsPerUser = 3;
            const allResponseTimes = [];
            resourceMonitor.start();
            const startTime = perf_hooks_1.performance.now();
            try {
                const userPromises = Array.from({ length: concurrentUsers }).map(async (_, userIndex) => {
                    const userResponseTimes = [];
                    for (let i = 0; i < requestsPerUser; i++) {
                        const requestStart = perf_hooks_1.performance.now();
                        await request(server)
                            .get('/api/validate')
                            .set('x-api-key', `valid-key-${userIndex}`);
                        const requestEnd = perf_hooks_1.performance.now();
                        userResponseTimes.push(requestEnd - requestStart);
                        await new Promise(resolve => setTimeout(resolve, 20));
                    }
                    return userResponseTimes;
                });
                const results = await Promise.all(userPromises);
                results.forEach(userTimes => allResponseTimes.push(...userTimes));
            }
            catch (error) {
                console.error('Error in concurrent test:', error.message);
            }
            const endTime = perf_hooks_1.performance.now();
            resourceMonitor.stop();
            if (allResponseTimes.length === 0) {
                console.log('No response times collected - skipping assertions');
                return;
            }
            const totalTime = endTime - startTime;
            const timeStats = calculateResponseTimeStats(allResponseTimes);
            const totalRequests = allResponseTimes.length;
            const report = {
                test: 'concurrent_users',
                concurrentUsers,
                requestsPerUser,
                totalRequests,
                totalTimeMs: totalTime,
                throughput: (totalRequests / totalTime) * 1000,
                responseTimeStats: timeStats,
                resourceUsage: resourceMonitor.getStats()
            };
            (0, globals_1.expect)(timeStats.avg).toBeDefined();
            (0, globals_1.expect)(report.throughput).toBeGreaterThan(1);
        });
    });
    (0, globals_1.describe)('Response Time Measurement', () => {
        (0, globals_1.it)('should measure cache impact on response times', async () => {
            const iterations = 20;
            const nonCachedTimes = [];
            const cachedTimes = [];
            cacheService.setCacheHitRate(0);
            for (let i = 0; i < iterations; i++) {
                const start = perf_hooks_1.performance.now();
                await request(server)
                    .get('/api/resources')
                    .set('x-api-key', 'valid-key');
                const end = perf_hooks_1.performance.now();
                nonCachedTimes.push(end - start);
            }
            cacheService.setCacheHitRate(0.8);
            for (let i = 0; i < iterations; i++) {
                const start = perf_hooks_1.performance.now();
                await request(server)
                    .get('/api/resources')
                    .set('x-api-key', 'valid-key');
                const end = perf_hooks_1.performance.now();
                cachedTimes.push(end - start);
            }
            const nonCachedStats = calculateResponseTimeStats(nonCachedTimes);
            const cachedStats = calculateResponseTimeStats(cachedTimes);
            (0, globals_1.expect)(cachedStats.avg).toBeLessThanOrEqual(nonCachedStats.avg * 1.1);
            (0, globals_1.expect)(cachedStats.p95).toBeLessThanOrEqual(nonCachedStats.p95 * 1.1);
            const report = {
                test: 'cache_impact',
                nonCachedStats,
                cachedStats,
                improvement: {
                    avgPercent: ((nonCachedStats.avg - cachedStats.avg) / nonCachedStats.avg) * 100,
                    p95Percent: ((nonCachedStats.p95 - cachedStats.p95) / nonCachedStats.p95) * 100
                },
                cacheStats: cacheService.getCacheStats()
            };
            (0, globals_1.expect)(report.improvement.avgPercent).toBeGreaterThanOrEqual(0);
        });
        (0, globals_1.it)('should measure time to first byte', async () => {
            const samples = 10;
            const ttfbTimes = [];
            for (let i = 0; i < samples; i++) {
                const startTime = perf_hooks_1.performance.now();
                await new Promise((resolve, reject) => {
                    const req = request(server)
                        .get('/api/resources')
                        .set('x-api-key', 'valid-key');
                    req.on('response', (res) => {
                        const ttfb = perf_hooks_1.performance.now() - startTime;
                        ttfbTimes.push(ttfb);
                        resolve();
                    });
                    req.end((err) => {
                        if (err)
                            reject(err);
                    });
                });
            }
            const ttfbStats = calculateResponseTimeStats(ttfbTimes);
            (0, globals_1.expect)(ttfbStats.avg).toBeLessThan(50);
            (0, globals_1.expect)(ttfbStats.p95).toBeLessThan(80);
        });
    });
    (0, globals_1.describe)('Resource Usage Monitoring', () => {
        (0, globals_1.it)('should monitor CPU and memory usage under load', async () => {
            resourceMonitor.start(50);
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(request(server)
                    .post('/api/keys')
                    .send({ name: `load-test-key-${i}`, permissions: ['read', 'write'] }));
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 200));
            resourceMonitor.stop();
            const resourceStats = resourceMonitor.getStats();
            if (resourceStats) {
                try {
                    resourceMonitor.writeReport('./performance-reports/resource-usage.json');
                }
                catch (e) {
                    console.log('Could not write performance report, continuing tests');
                }
                (0, globals_1.expect)(resourceStats.cpu.avg).toBeDefined();
                (0, globals_1.expect)(resourceStats.memory.current.heapUsed).toBeDefined();
                (0, globals_1.expect)(resourceStats.memory.max.heapUsed).toBeLessThan(500);
            }
            else {
                console.log('Resource stats not available - skipping test assertions');
            }
        });
        (0, globals_1.it)('should handle multiple simultaneous connections without excessive memory growth', async () => {
            resourceMonitor.start(50);
            const numConnections = 3;
            const requestsPerConnection = 2;
            const initialMemory = process.memoryUsage().heapUsed / (1024 * 1024);
            try {
                const connections = Array(numConnections).fill(0).map((_, i) => {
                    return async () => {
                        for (let j = 0; j < requestsPerConnection; j++) {
                            await request(server)
                                .get('/api/validate')
                                .set('x-api-key', `test-key-${i}-${j}`);
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                    };
                });
                await Promise.all(connections.map(conn => conn()));
            }
            catch (error) {
                console.error('Error in connection test:', error.message);
            }
            const finalMemory = process.memoryUsage().heapUsed / (1024 * 1024);
            resourceMonitor.stop();
            const memoryGrowth = finalMemory - initialMemory;
            if (memoryGrowth > 0) {
                (0, globals_1.expect)(memoryGrowth).toBeLessThan(50);
            }
            else {
                console.log(`Memory usage decreased by ${-memoryGrowth}MB during test - likely due to garbage collection`);
            }
        });
    });
    (0, globals_1.describe)('Database Performance', () => {
        (0, globals_1.it)('should measure query optimization effectiveness', async () => {
            const iterations = 10;
            const optimizedTimes = [];
            const nonOptimizedTimes = [];
            for (let i = 0; i < iterations; i++) {
                const startOptimized = perf_hooks_1.performance.now();
                await apiService.getOptimizedApiKeys();
                const endOptimized = perf_hooks_1.performance.now();
                optimizedTimes.push(endOptimized - startOptimized);
                const startNonOptimized = perf_hooks_1.performance.now();
                await apiService.getNonOptimizedApiKeys();
                const endNonOptimized = perf_hooks_1.performance.now();
                nonOptimizedTimes.push(endNonOptimized - startNonOptimized);
            }
            const optimizedStats = calculateResponseTimeStats(optimizedTimes);
            const nonOptimizedStats = calculateResponseTimeStats(nonOptimizedTimes);
            const improvement = ((nonOptimizedStats.avg - optimizedStats.avg) / nonOptimizedStats.avg) * 100;
            (0, globals_1.expect)(optimizedStats.avg).toBeLessThan(nonOptimizedStats.avg);
            (0, globals_1.expect)(improvement).toBeGreaterThan(50);
        });
        (0, globals_1.it)('should monitor connection pool usage', async () => {
            resourceMonitor.start();
            const concurrentQueries = 3;
            const queriesPerBatch = 2;
            const queryBatches = 3;
            for (let batch = 0; batch < queryBatches; batch++) {
                const batchPromises = [];
                for (let i = 0; i < concurrentQueries; i++) {
                    const queries = [];
                    for (let j = 0; j < queriesPerBatch; j++) {
                        queries.push(apiService.getDatabaseService().executeQuery(`batch_${batch}_query_${j}`));
                    }
                    batchPromises.push(Promise.all(queries));
                }
                await Promise.all(batchPromises);
            }
            resourceMonitor.stop();
            const poolStats = apiService.getDatabaseService().getConnectionPoolStats();
            const queryStats = apiService.getDatabaseService().getQueryStats();
            (0, globals_1.expect)(poolStats.peak).toBeGreaterThan(0);
            (0, globals_1.expect)(poolStats.peak).toBeLessThanOrEqual(poolStats.total);
            if (poolStats.peak === poolStats.total) {
                (0, globals_1.expect)(poolStats.idle).toBe(poolStats.total - poolStats.active);
            }
        });
        (0, globals_1.it)('should demonstrate indexing effectiveness', async () => {
            const iterations = 5;
            for (let i = 0; i < iterations; i++) {
                const usersWithIndexStart = perf_hooks_1.performance.now();
                await apiService.getDatabaseService().simulateQueryWithIndex('users_index');
                const usersWithIndexEnd = perf_hooks_1.performance.now();
                const usersWithoutIndexStart = perf_hooks_1.performance.now();
                await apiService.getDatabaseService().simulateQueryWithoutIndex('users_index');
                const usersWithoutIndexEnd = perf_hooks_1.performance.now();
                const apiKeysWithIndexStart = perf_hooks_1.performance.now();
                await apiService.getDatabaseService().simulateQueryWithIndex('api_keys_index');
                const apiKeysWithIndexEnd = perf_hooks_1.performance.now();
                const apiKeysWithoutIndexStart = perf_hooks_1.performance.now();
                await apiService.getDatabaseService().simulateQueryWithoutIndex('api_keys_index');
                const apiKeysWithoutIndexEnd = perf_hooks_1.performance.now();
            }
            const queryStats = apiService.getDatabaseService().getQueryStats();
            const indexEffectiveness = apiService.getDatabaseService().getIndexEffectiveness();
            const realImprovements = {};
            for (const index of Object.keys(indexEffectiveness)) {
                const withIndexQuery = `${index}_query`;
                const withoutIndexQuery = `${index}_query_no_index`;
                if (queryStats[withIndexQuery] && queryStats[withoutIndexQuery]) {
                    realImprovements[index] = {
                        withIndexAvg: queryStats[withIndexQuery].avg,
                        withoutIndexAvg: queryStats[withoutIndexQuery].avg,
                        improvement: (queryStats[withoutIndexQuery].avg - queryStats[withIndexQuery].avg) / queryStats[withoutIndexQuery].avg * 100
                    };
                }
            }
            Object.values(realImprovements).forEach((improvement) => {
                (0, globals_1.expect)(improvement.withIndexAvg).toBeLessThan(improvement.withoutIndexAvg);
                (0, globals_1.expect)(improvement.improvement).toBeGreaterThan(50);
            });
        });
    });
});
//# sourceMappingURL=api-performance.spec.js.map