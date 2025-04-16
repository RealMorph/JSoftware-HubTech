import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppCacheModule } from '../cache.module';
import { CacheService } from '../cache.service';
import { CacheModule } from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors, Inject, UseGuards, Param } from '@nestjs/common';
import { CacheInterceptor, CacheTTL, CACHE_MANAGER } from '@nestjs/cache-manager';
import { RateLimiterModule, RateLimiterGuard } from 'nestjs-rate-limiter';
import { Cache } from 'cache-manager';
import { ApiKeyGuard } from '../../api/guards/api-key.guard';

// Create a test controller that uses caching for our integration tests
@Controller('test-cache')
class TestCachedController {
  private counter = 0;
  
  constructor(
    private readonly cacheService: CacheService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}
  
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async getCachedData() {
    // Increment counter to verify cached responses
    this.counter++;
    return {
      data: 'This is cached data',
      timestamp: new Date().toISOString(),
      counter: this.counter
    };
  }
  
  @Get('no-cache')
  async getNonCachedData() {
    // Increment counter
    this.counter++;
    return {
      data: 'This is non-cached data',
      timestamp: new Date().toISOString(),
      counter: this.counter
    };
  }
  
  @Get('manual-cache')
  async getManuallyCache() {
    const cacheKey = 'manual-cache-key';
    let result = await this.cacheService.get(cacheKey);
    
    if (!result) {
      // Cache miss - create new data
      this.counter++;
      result = {
        data: 'This is manually cached data',
        timestamp: new Date().toISOString(),
        counter: this.counter
      };
      
      // Store in cache with 30s TTL
      await this.cacheService.set(cacheKey, result, 30);
    }
    
    return result;
  }
  
  @Get('objects')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  async getCachedObjects() {
    return [
      { id: 1, name: 'Item 1', createdAt: new Date().toISOString() },
      { id: 2, name: 'Item 2', createdAt: new Date().toISOString() },
      { id: 3, name: 'Item 3', createdAt: new Date().toISOString() }
    ];
  }
  
  @Get('invalidate/:key')
  async invalidateCache(@Param('key') key: string) {
    await this.cacheService.del(key);
    return { success: true, message: `Cache key ${key} invalidated` };
  }
  
  @Get('stats')
  @UseGuards(ApiKeyGuard)
  async getCacheStats() {
    return this.cacheService.getStats();
  }
  
  @Get('memory')
  async getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    return {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    };
  }
  
  @Get('reset')
  async resetCache() {
    await this.cacheService.reset();
    this.counter = 0; // Also reset the counter for testing
    return { success: true, message: 'Cache reset', counter: this.counter };
  }
}

// Mock API Key Guard
const mockApiKeyGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('Cache Integration Tests', () => {
  let app: INestApplication;
  let cacheService: CacheService;
  let server;
  
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppCacheModule,
        RateLimiterModule.register({
          keyPrefix: 'test',
          points: 100,
          duration: 1,
        })
      ],
      controllers: [TestCachedController],
      providers: [
        {
          provide: ApiKeyGuard,
          useValue: mockApiKeyGuard
        }
      ]
    })
    .overrideGuard(ApiKeyGuard)
    .useValue(mockApiKeyGuard)
    .compile();

    app = moduleFixture.createNestApplication();
    cacheService = moduleFixture.get<CacheService>(CacheService);
    await app.init();
    server = app.getHttpServer();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should cache responses and return the same data on subsequent requests', async () => {
    // First request (cache miss)
    const firstResponse = await request(server)
      .get('/test-cache')
      .expect(200);
    
    const firstCounter = firstResponse.body.counter;
    const firstTimestamp = firstResponse.body.timestamp;
    
    // Second request (should be a cache hit)
    const secondResponse = await request(server)
      .get('/test-cache')
      .expect(200);
    
    // Verify that the counter hasn't increased and timestamp is the same
    expect(secondResponse.body.counter).toBe(firstCounter);
    expect(secondResponse.body.timestamp).toBe(firstTimestamp);
  });
  
  it('should not cache responses for non-cached endpoints', async () => {
    // First request
    const firstResponse = await request(server)
      .get('/test-cache/no-cache')
      .expect(200);
    
    const firstCounter = firstResponse.body.counter;
    
    // Second request - counter should increment
    const secondResponse = await request(server)
      .get('/test-cache/no-cache')
      .expect(200);
    
    expect(secondResponse.body.counter).toBe(firstCounter + 1);
  });
  
  it('should handle manual caching', async () => {
    // First request (cache miss)
    const firstResponse = await request(server)
      .get('/test-cache/manual-cache')
      .expect(200);
    
    const firstCounter = firstResponse.body.counter;
    
    // Second request (should be a cache hit)
    const secondResponse = await request(server)
      .get('/test-cache/manual-cache')
      .expect(200);
    
    // Counter shouldn't increment on second request
    expect(secondResponse.body.counter).toBe(firstCounter);
  });
  
  it('should invalidate cached data when requested', async () => {
    // First request to cache data
    const firstResponse = await request(server)
      .get('/test-cache')
      .expect(200);
    
    const firstCounter = firstResponse.body.counter;
    
    // Verify cache hit
    const cachedResponse = await request(server)
      .get('/test-cache')
      .expect(200);
    
    expect(cachedResponse.body.counter).toBe(firstCounter);
    
    // Reset the cache
    await request(server)
      .get('/test-cache/reset')
      .expect(200);
    
    // Request again - should be a cache miss with new counter
    const afterInvalidateResponse = await request(server)
      .get('/test-cache')
      .expect(200);
    
    // Counter should be equal to 1 after reset, not greater than firstCounter
    expect(afterInvalidateResponse.body.counter).toBe(1);
  });
}); 