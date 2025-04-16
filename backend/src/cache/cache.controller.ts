import { Controller, Get, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ApiKeyGuard } from '../api/guards/api-key.guard';

@Controller('cache')
@UseGuards(ApiKeyGuard)
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Get cache statistics
   */
  @Get('stats')
  async getStats() {
    return this.cacheService.getStats();
  }

  /**
   * Reset cache statistics
   */
  @Post('stats/reset')
  async resetStats() {
    this.cacheService.resetStats();
    return { success: true, message: 'Cache statistics reset' };
  }

  /**
   * Clear the entire cache
   */
  @Delete()
  async clearCache() {
    await this.cacheService.reset();
    return { success: true, message: 'Cache cleared' };
  }

  /**
   * Invalidate cache by key
   */
  @Delete(':key')
  async invalidateCache(@Param('key') key: string) {
    await this.cacheService.del(key);
    return { success: true, message: `Cache key '${key}' invalidated` };
  }

  /**
   * Invalidate cache by pattern
   */
  @Delete('pattern/:pattern')
  async invalidateCacheByPattern(@Param('pattern') pattern: string) {
    await this.cacheService.delByPattern(pattern);
    return { success: true, message: `Cache invalidated by pattern '${pattern}'` };
  }
} 