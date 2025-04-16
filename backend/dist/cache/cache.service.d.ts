import { Cache } from 'cache-manager';
export declare class CacheService {
    private cacheManager;
    private readonly logger;
    private hitCount;
    private missCount;
    private statsLastReset;
    private readonly memoryUsageSamples;
    constructor(cacheManager: Cache);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    delByPattern(pattern: string): Promise<void>;
    reset(): Promise<void>;
    getStats(): {
        hits: number;
        misses: number;
        total: number;
        hitRate: string;
        uptime: string;
        memoryUsage: {
            current: string;
            peak: string;
            trend: "increasing" | "decreasing" | "stable";
        };
    };
    resetStats(): void;
    getKeys(): Promise<string[]>;
    private getTotalCount;
    private trackMemoryUsage;
    private getMemoryUsage;
    private getMemoryTrend;
}
