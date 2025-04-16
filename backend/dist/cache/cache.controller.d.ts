import { CacheService } from './cache.service';
export declare class CacheController {
    private readonly cacheService;
    constructor(cacheService: CacheService);
    getStats(): Promise<{
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
    }>;
    resetStats(): Promise<{
        success: boolean;
        message: string;
    }>;
    clearCache(): Promise<{
        success: boolean;
        message: string;
    }>;
    invalidateCache(key: string): Promise<{
        success: boolean;
        message: string;
    }>;
    invalidateCacheByPattern(pattern: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
