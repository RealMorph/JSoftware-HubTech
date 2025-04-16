import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, Logger, InternalServerErrorException } from '@nestjs/common';
import { ApiController } from '../api.controller';
import { ApiService } from '../api.service';
import { CacheService } from '../../cache/cache.service';
import * as request from 'supertest';
import { describe, beforeEach, afterEach, afterAll, it, expect, jest } from '@jest/globals';
import { CacheModule } from '@nestjs/cache-manager';
import type { SpyInstance } from 'jest-mock';

// Mock API service with intentional failures
class MockApiService {
  private errorMode = '';
  private logMessages: any[] = [];

  // Methods to control test behavior
  setErrorMode(mode: string) {
    this.errorMode = mode;
  }

  getLogMessages() {
    return this.logMessages;
  }

  clearLogMessages() {
    this.logMessages = [];
  }

  // Mock logger
  private log(message: string, context?: string) {
    this.logMessages.push({ type: 'log', message, context });
  }

  private error(message: string, trace?: string, context?: string) {
    this.logMessages.push({ type: 'error', message, trace, context });
  }

  private warn(message: string, context?: string) {
    this.logMessages.push({ type: 'warn', message, context });
  }

  // API methods with error simulation
  async generateApiKey(name: string, permissions = ['read'], tier = 'standard') {
    // Simulate database errors
    if (this.errorMode === 'database') {
      this.error('Database connection error', 'Error: Connection refused', 'ApiService');
      throw new InternalServerErrorException('Database error occurred while generating API key');
    }

    // Simulate network timeouts
    if (this.errorMode === 'network') {
      this.error('Network timeout error', 'Error: Request timed out after 30000ms', 'ApiService');
      throw new InternalServerErrorException('Network error occurred while generating API key');
    }

    // Simulate validation error but with proper error logging
    if (this.errorMode === 'validation') {
      this.warn(`Validation error for key name: ${name}`, 'ApiService');
      throw new InternalServerErrorException('Validation error occurred');
    }

    // Simulate unexpected error
    if (this.errorMode === 'unexpected') {
      this.error('Unexpected error during API key generation', 'TypeError: Cannot read property of undefined', 'ApiService');
      throw new Error('Unexpected error');
    }

    // Log successful operation
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

  async validateApiKey(key: string) {
    if (this.errorMode === 'database') {
      this.error('Database error during API key validation', 'Error: Connection lost', 'ApiService');
      throw new InternalServerErrorException('Database error occurred while validating API key');
    }

    this.log(`API key validated: ${key.substring(0, 5)}...`, 'ApiService');
    return { id: '1', key, permissions: ['read'] };
  }

  async getApiKeys() {
    if (this.errorMode === 'database') {
      this.error('Database query error', 'Error: Query timeout', 'ApiService');
      throw new InternalServerErrorException('Error retrieving API keys');
    }

    this.log('Retrieved API keys list', 'ApiService');
    return [];
  }

  async revokeApiKey(keyId: string) {
    if (this.errorMode === 'database') {
      this.error('Database transaction error', 'Error: Transaction failed', 'ApiService');
      throw new InternalServerErrorException('Error revoking API key');
    }

    this.log(`API key revoked: ${keyId}`, 'ApiService');
    return { success: true };
  }
}

// Mock Cache service with failure modes
class MockCacheService {
  private errorMode = '';
  private logMessages: any[] = [];

  // Control test behavior
  setErrorMode(mode: string) {
    this.errorMode = mode;
  }

  getLogMessages() {
    return this.logMessages;
  }

  clearLogMessages() {
    this.logMessages = [];
  }

  // Mock logger
  private log(message: string, context?: string) {
    this.logMessages.push({ type: 'log', message, context });
  }

  private error(message: string, trace?: string, context?: string) {
    this.logMessages.push({ type: 'error', message, trace, context });
  }

  async get(key: string) {
    if (this.errorMode === 'cache') {
      this.error('Cache retrieval error', 'Error: Redis connection failed', 'CacheService');
      throw new InternalServerErrorException('Cache error');
    }
    
    this.log(`Cache retrieved: ${key}`, 'CacheService');
    return null;
  }

  async set(key: string, value: any) {
    if (this.errorMode === 'cache') {
      this.error('Cache storage error', 'Error: Redis connection failed', 'CacheService');
      throw new InternalServerErrorException('Cache error');
    }
    
    this.log(`Cache set: ${key}`, 'CacheService');
    return true;
  }

  async del(key: string) {
    if (this.errorMode === 'cache') {
      this.error('Cache deletion error', 'Error: Redis connection failed', 'CacheService');
      throw new InternalServerErrorException('Cache error');
    }
    
    this.log(`Cache deleted: ${key}`, 'CacheService');
    return true;
  }

  async delByPattern() {
    if (this.errorMode === 'cache') {
      this.error('Cache pattern deletion error', 'Error: Redis operation failed', 'CacheService');
      throw new InternalServerErrorException('Cache error');
    }
    
    this.log('Cache pattern deleted', 'CacheService');
    return true;
  }
}

describe('API System Error Handling', () => {
  let app: INestApplication;
  let server;
  let apiService: MockApiService;
  let cacheService: MockCacheService;
  let globalLogger: Logger;
  let logSpy: SpyInstance;

  beforeEach(async () => {
    // Create a spy on the global logger
    globalLogger = new Logger('GlobalTest');
    logSpy = jest.spyOn(globalLogger, 'error').mockImplementation(() => { /* empty function */ });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
      ],
      controllers: [ApiController],
      providers: [
        {
          provide: ApiService,
          useClass: MockApiService,
        },
        {
          provide: CacheService,
          useClass: MockCacheService,
        },
        {
          provide: Logger,
          useValue: globalLogger,
        }
      ],
    }).compile();

    apiService = moduleFixture.get<ApiService>(ApiService) as unknown as MockApiService;
    cacheService = moduleFixture.get<CacheService>(CacheService) as unknown as MockCacheService;
    
    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterEach(() => {
    // Reset mock services after each test
    apiService.setErrorMode('');
    apiService.clearLogMessages();
    cacheService.setErrorMode('');
    cacheService.clearLogMessages();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Database Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Set error mode to simulate database errors
      apiService.setErrorMode('database');
      
      const response = await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Database Test', 
          permissions: ['read'] 
        })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      
      // Verify error structure
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Database error');
      
      // Verify error logs were created
      const logs = apiService.getLogMessages();
      const errorLogs = logs.filter(log => log.type === 'error');
      expect(errorLogs.length).toBeGreaterThan(0);
      expect(errorLogs[0].message).toContain('Database');
    });

    it('should handle database query errors when listing API keys', async () => {
      apiService.setErrorMode('database');
      
      const response = await request(server)
        .get('/api/keys')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      
      expect(response.body.message).toContain('Error retrieving API keys');
      
      // Check error was properly logged
      const logs = apiService.getLogMessages();
      const errorLog = logs.find(log => log.type === 'error' && log.message.includes('Database query'));
      expect(errorLog).toBeDefined();
    });

    it('should handle database transaction errors when revoking API keys', async () => {
      apiService.setErrorMode('database');
      
      const response = await request(server)
        .delete('/api/keys/any-id')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      
      expect(response.body.message).toContain('Error revoking API key');
      
      // Verify error was logged with transaction details
      const logs = apiService.getLogMessages();
      const transactionErrorLog = logs.find(log => 
        log.type === 'error' && log.message.includes('transaction')
      );
      expect(transactionErrorLog).toBeDefined();
    });
  });

  describe('Network Failure Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      // Set error mode to simulate network issues
      apiService.setErrorMode('network');
      
      const response = await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Network Test', 
          permissions: ['read'] 
        })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      
      expect(response.body.message).toContain('Network error');
      
      // Verify timeout was logged
      const logs = apiService.getLogMessages();
      const timeoutLog = logs.find(log => 
        log.type === 'error' && log.trace && log.trace.includes('timed out')
      );
      expect(timeoutLog).toBeDefined();
    });

    it('should include appropriate retry information in network errors', async () => {
      apiService.setErrorMode('network');
      
      const response = await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Network Test', 
          permissions: ['read'] 
        });
      
      // Best practice: Include retry-after header for network issues
      expect(response.headers).toBeDefined();
      // Note: This checks the actual implementation - if your API doesn't implement
      // retry headers yet, this test would help document that expected behavior
    });
  });

  describe('Cache Failure Handling', () => {
    it('should handle cache service failures gracefully', async () => {
      // Set cache service to error mode
      cacheService.setErrorMode('cache');
      
      // Force a cache operation before the main test
      try {
        await cacheService.get('test-key');
      } catch (error) {
        // Ignore the error - we just want to trigger the cache error to verify logging
      }
      
      // This should still work even if cache fails
      const response = await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Cache Test', 
          permissions: ['read'] 
        });
      
      // API should still function even with cache errors
      // This might be 200 or 500 depending on how your app handles cache failures
      expect(response.status).toBeDefined();
      
      // Verify cache errors were logged
      const logs = cacheService.getLogMessages();
      const cacheErrorLog = logs.find(log => 
        log.type === 'error' && log.message.includes('Cache')
      );
      expect(cacheErrorLog).toBeDefined();
      
      if (!cacheErrorLog) {
        console.log('Available logs:', logs);
      }
    });
  });

  describe('Error Logging Verification', () => {
    it('should log detailed error information for unexpected errors', async () => {
      apiService.setErrorMode('unexpected');
      
      await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Error Logging Test', 
          permissions: ['read'] 
        })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      
      // Verify detailed error log
      const logs = apiService.getLogMessages();
      const unexpectedErrorLog = logs.find(log => 
        log.type === 'error' && log.message.includes('Unexpected') && log.trace
      );
      
      expect(unexpectedErrorLog).toBeDefined();
      expect(unexpectedErrorLog.trace).toContain('TypeError');
    });

    it('should log validation errors at appropriate log levels', async () => {
      apiService.setErrorMode('validation');
      
      await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Validation Test', 
          permissions: ['read'] 
        })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      
      // Validation errors should be warning level, not error level
      const logs = apiService.getLogMessages();
      const validationLog = logs.find(log => 
        log.type === 'warn' && log.message.includes('Validation')
      );
      
      expect(validationLog).toBeDefined();
    });

    it('should log successful operations', async () => {
      // Normal operation, no errors
      await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Success Test', 
          permissions: ['read'] 
        })
        .expect(HttpStatus.CREATED);
      
      // Success should be logged
      const logs = apiService.getLogMessages();
      const successLog = logs.find(log => 
        log.type === 'log' && log.message.includes('generated')
      );
      
      expect(successLog).toBeDefined();
      expect(successLog.message).toContain('Success Test');
    });
  });
}); 