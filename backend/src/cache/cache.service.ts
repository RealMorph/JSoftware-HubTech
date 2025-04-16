import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private hitCount = 0;
  private missCount = 0;
  private statsLastReset = Date.now();
  private readonly memoryUsageSamples: { timestamp: number; usage: number }[] = [];

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    // Track memory usage every minute
    setInterval(() => this.trackMemoryUsage(), 60000);
  }

  /**
   * Get a value from cache with statistics tracking
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      
      if (value !== undefined && value !== null) {
        this.hitCount++;
        this.logger.debug(`Cache HIT: ${key}`);
        return value;
      } else {
        this.missCount++;
        this.logger.debug(`Cache MISS: ${key}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error getting from cache: ${error.message}`);
      return null;
    }
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cached: ${key}, TTL: ${ttl || 'default'}`);
    } catch (error) {
      this.logger.error(`Error setting cache: ${error.message}`);
    }
  }

  /**
   * Delete a value from cache
   * @param key Cache key 
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache invalidated: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting from cache: ${error.message}`);
    }
  }

  /**
   * Delete multiple values from cache by pattern
   * @param pattern Key pattern to match for deletion
   */
  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.getKeys();
      const matchingKeys = keys.filter(key => 
        key.includes(pattern) || new RegExp(pattern).test(key)
      );
      
      await Promise.all(matchingKeys.map(key => this.del(key)));
      this.logger.debug(`Cache invalidated by pattern: ${pattern}, keys: ${matchingKeys.length}`);
    } catch (error) {
      this.logger.error(`Error deleting from cache by pattern: ${error.message}`);
    }
  }

  /**
   * Reset the cache entirely
   */
  async reset(): Promise<void> {
    try {
      // cache-manager v4+ doesn't have a reset method
      // We need to get all keys and delete them
      const keys = await this.getKeys();
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
      this.logger.debug('Cache reset');
    } catch (error) {
      this.logger.error(`Error resetting cache: ${error.message}`);
    }
  }

  /**
   * Get cache statistics
   */
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

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
    this.statsLastReset = Date.now();
    this.logger.debug('Cache statistics reset');
  }

  /**
   * Get all cache keys (implementation will vary based on cache provider)
   * This is a simplified implementation assuming the cache manager allows getting keys
   */
  async getKeys(): Promise<string[]> {
    try {
      // This is a mock implementation since cache-manager doesn't directly expose keys
      // In a real implementation, this would depend on the cache store being used
      const store = (this.cacheManager as any).store;
      if (store && typeof store.keys === 'function') {
        return await store.keys();
      }
      return [];
    } catch (error) {
      this.logger.error(`Error getting cache keys: ${error.message}`);
      return [];
    }
  }

  /**
   * Get the total count of cache operations
   */
  private getTotalCount(): number {
    return this.hitCount + this.missCount;
  }

  /**
   * Track memory usage
   */
  private trackMemoryUsage(): void {
    const memoryUsage = process.memoryUsage();
    
    this.memoryUsageSamples.push({
      timestamp: Date.now(),
      usage: memoryUsage.heapUsed
    });
    
    // Keep only the last 60 samples (1 hour of data)
    if (this.memoryUsageSamples.length > 60) {
      this.memoryUsageSamples.shift();
    }
    
    // Log memory usage every 10 minutes
    if (this.memoryUsageSamples.length % 10 === 0) {
      this.logger.debug(
        `Memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB ` +
        `(RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB)`
      );
    }
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): { current: number; peak: number } {
    const memoryUsage = process.memoryUsage();
    
    // Find peak memory usage from samples
    const peak = this.memoryUsageSamples.length > 0
      ? Math.max(...this.memoryUsageSamples.map(sample => sample.usage))
      : memoryUsage.heapUsed;
    
    return {
      current: memoryUsage.heapUsed,
      peak
    };
  }

  /**
   * Get memory usage trend (increasing, decreasing, stable)
   */
  private getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memoryUsageSamples.length < 10) {
      return 'stable';
    }
    
    const recentSamples = this.memoryUsageSamples.slice(-10);
    const firstSample = recentSamples[0].usage;
    const lastSample = recentSamples[recentSamples.length - 1].usage;
    
    // Calculate percentage change
    const percentChange = ((lastSample - firstSample) / firstSample) * 100;
    
    if (percentChange > 10) {
      return 'increasing';
    } else if (percentChange < -10) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }
} 