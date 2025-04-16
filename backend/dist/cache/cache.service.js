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
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let CacheService = CacheService_1 = class CacheService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(CacheService_1.name);
        this.hitCount = 0;
        this.missCount = 0;
        this.statsLastReset = Date.now();
        this.memoryUsageSamples = [];
        setInterval(() => this.trackMemoryUsage(), 60000);
    }
    async get(key) {
        try {
            const value = await this.cacheManager.get(key);
            if (value !== undefined && value !== null) {
                this.hitCount++;
                this.logger.debug(`Cache HIT: ${key}`);
                return value;
            }
            else {
                this.missCount++;
                this.logger.debug(`Cache MISS: ${key}`);
                return null;
            }
        }
        catch (error) {
            this.logger.error(`Error getting from cache: ${error.message}`);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            await this.cacheManager.set(key, value, ttl);
            this.logger.debug(`Cached: ${key}, TTL: ${ttl || 'default'}`);
        }
        catch (error) {
            this.logger.error(`Error setting cache: ${error.message}`);
        }
    }
    async del(key) {
        try {
            await this.cacheManager.del(key);
            this.logger.debug(`Cache invalidated: ${key}`);
        }
        catch (error) {
            this.logger.error(`Error deleting from cache: ${error.message}`);
        }
    }
    async delByPattern(pattern) {
        try {
            const keys = await this.getKeys();
            const matchingKeys = keys.filter(key => key.includes(pattern) || new RegExp(pattern).test(key));
            await Promise.all(matchingKeys.map(key => this.del(key)));
            this.logger.debug(`Cache invalidated by pattern: ${pattern}, keys: ${matchingKeys.length}`);
        }
        catch (error) {
            this.logger.error(`Error deleting from cache by pattern: ${error.message}`);
        }
    }
    async reset() {
        try {
            const keys = await this.getKeys();
            await Promise.all(keys.map(key => this.cacheManager.del(key)));
            this.logger.debug('Cache reset');
        }
        catch (error) {
            this.logger.error(`Error resetting cache: ${error.message}`);
        }
    }
    getStats() {
        const hitRate = this.getTotalCount() > 0
            ? (this.hitCount / this.getTotalCount()) * 100
            : 0;
        const memoryUsage = this.getMemoryUsage();
        const uptime = Date.now() - this.statsLastReset;
        return {
            hits: this.hitCount,
            misses: this.missCount,
            total: this.getTotalCount(),
            hitRate: `${hitRate.toFixed(2)}%`,
            uptime: `${Math.floor(uptime / 1000 / 60)} minutes`,
            memoryUsage: {
                current: `${Math.round(memoryUsage.current / 1024 / 1024)} MB`,
                peak: `${Math.round(memoryUsage.peak / 1024 / 1024)} MB`,
                trend: this.getMemoryTrend()
            }
        };
    }
    resetStats() {
        this.hitCount = 0;
        this.missCount = 0;
        this.statsLastReset = Date.now();
        this.logger.debug('Cache statistics reset');
    }
    async getKeys() {
        try {
            const store = this.cacheManager.store;
            if (store && typeof store.keys === 'function') {
                return await store.keys();
            }
            return [];
        }
        catch (error) {
            this.logger.error(`Error getting cache keys: ${error.message}`);
            return [];
        }
    }
    getTotalCount() {
        return this.hitCount + this.missCount;
    }
    trackMemoryUsage() {
        const memoryUsage = process.memoryUsage();
        this.memoryUsageSamples.push({
            timestamp: Date.now(),
            usage: memoryUsage.heapUsed
        });
        if (this.memoryUsageSamples.length > 60) {
            this.memoryUsageSamples.shift();
        }
        if (this.memoryUsageSamples.length % 10 === 0) {
            this.logger.debug(`Memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB ` +
                `(RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB)`);
        }
    }
    getMemoryUsage() {
        const memoryUsage = process.memoryUsage();
        const peak = this.memoryUsageSamples.length > 0
            ? Math.max(...this.memoryUsageSamples.map(sample => sample.usage))
            : memoryUsage.heapUsed;
        return {
            current: memoryUsage.heapUsed,
            peak
        };
    }
    getMemoryTrend() {
        if (this.memoryUsageSamples.length < 10) {
            return 'stable';
        }
        const recentSamples = this.memoryUsageSamples.slice(-10);
        const firstSample = recentSamples[0].usage;
        const lastSample = recentSamples[recentSamples.length - 1].usage;
        const percentChange = ((lastSample - firstSample) / firstSample) * 100;
        if (percentChange > 10) {
            return 'increasing';
        }
        else if (percentChange < -10) {
            return 'decreasing';
        }
        else {
            return 'stable';
        }
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], CacheService);
//# sourceMappingURL=cache.service.js.map