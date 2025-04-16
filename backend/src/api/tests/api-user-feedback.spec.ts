import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, Logger, BadRequestException } from '@nestjs/common';
import { ApiController } from '../api.controller';
import { ApiService } from '../api.service';
import { CacheService } from '../../cache/cache.service';
import * as request from 'supertest';
import { describe, beforeEach, afterEach, afterAll, it, expect, jest } from '@jest/globals';
import { CacheModule } from '@nestjs/cache-manager';
import type { SpyInstance } from 'jest-mock';

// Mock API service with user feedback capabilities
class MockApiService {
  private feedbackState = {
    shouldShowErrorMessage: true,
    shouldIncludeErrorCode: true,
    shouldIncludeHelpLink: true,
    shouldIncludeRecoverySteps: true
  };

  // Mock user interactions tracking
  private userInteractions = {
    errorMessagesShown: 0,
    recoveryPathsOffered: 0,
    helpLinksClicked: 0
  };

  // Configure feedback behavior
  configureFeedback(options: {
    showErrorMessage?: boolean,
    includeErrorCode?: boolean,
    includeHelpLink?: boolean,
    includeRecoverySteps?: boolean
  }) {
    this.feedbackState = {
      ...this.feedbackState,
      ...options
    };
  }

  // Get statistics about user interactions
  getInteractionStats() {
    return { ...this.userInteractions };
  }

  // Track error message shown to user
  private trackErrorMessageShown() {
    this.userInteractions.errorMessagesShown++;
  }

  // Track recovery path offered
  private trackRecoveryPathOffered() {
    this.userInteractions.recoveryPathsOffered++;
  }

  // Track help link clicked
  trackHelpLinkClicked() {
    this.userInteractions.helpLinksClicked++;
  }

  // Helper to build standardized error responses with user guidance
  private createUserFriendlyError(message: string, code: string, recoverySteps?: string[]) {
    const response: any = { message };
    
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

  // API methods with user feedback
  async generateApiKey(name: string, permissions = ['read'], tier = 'standard') {
    // Input validation with user guidance
    if (!name || name.trim() === '') {
      if (this.feedbackState.shouldShowErrorMessage) {
        const errorResponse = this.createUserFriendlyError(
          'API key name is required',
          'INVALID_NAME',
          [
            'Provide a descriptive name for your API key',
            'Names must be between 3-50 characters'
          ]
        );
        throw new BadRequestException(errorResponse);
      } else {
        throw new BadRequestException('Invalid input');
      }
    }

    // Success case
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

  // Method with permission error feedback
  async validateApiKey(key: string) {
    if (!key || key === 'invalid-key') {
      if (this.feedbackState.shouldShowErrorMessage) {
        const errorResponse = this.createUserFriendlyError(
          'Invalid API key provided',
          'INVALID_API_KEY',
          [
            'Check that you are using the correct API key',
            'Ensure the API key is included in the x-api-key header',
            'Generate a new API key if needed'
          ]
        );
        throw new BadRequestException(errorResponse);
      } else {
        throw new BadRequestException('Invalid key');
      }
    }

    if (key === 'expired-key') {
      if (this.feedbackState.shouldShowErrorMessage) {
        const errorResponse = this.createUserFriendlyError(
          'Your API key has expired',
          'EXPIRED_API_KEY',
          [
            'Generate a new API key',
            'Revoke the expired key for security'
          ]
        );
        throw new BadRequestException(errorResponse);
      } else {
        throw new BadRequestException('Expired key');
      }
    }
    
    if (key === 'insufficient-permissions') {
      if (this.feedbackState.shouldShowErrorMessage) {
        const errorResponse = this.createUserFriendlyError(
          'Your API key lacks sufficient permissions for this operation',
          'INSUFFICIENT_PERMISSIONS',
          [
            'Use an API key with appropriate permissions',
            'Request elevated permissions if needed'
          ]
        );
        throw new BadRequestException(errorResponse);
      } else {
        throw new BadRequestException('Insufficient permissions');
      }
    }
    
    return {
      id: 'valid-id',
      key,
      permissions: ['read', 'write'],
      valid: true
    };
  }

  // Method with rate limiting feedback
  async checkRateLimit(key: string) {
    if (key === 'rate-limited') {
      if (this.feedbackState.shouldShowErrorMessage) {
        const errorResponse = this.createUserFriendlyError(
          'Rate limit exceeded',
          'RATE_LIMIT_EXCEEDED',
          [
            'Reduce request frequency',
            'Implement backoff strategy',
            'Upgrade to a higher tier for increased limits'
          ]
        );
        // Add rate limit headers for client guidance
        const headers = {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': `${Math.floor(Date.now() / 1000) + 60}`
        };
        
        const error = new BadRequestException(errorResponse);
        // Attach headers to error object for the test
        (error as any).headers = headers;
        throw error;
      } else {
        throw new BadRequestException('Rate limited');
      }
    }
    
    return { allowed: true, remaining: 99, limit: 100 };
  }
}

// Mock Cache service
class MockCacheService {
  async get(key: string) {
    return null;
  }

  async set(key: string, value: any) {
    return true;
  }
}

describe('API User Feedback', () => {
  let app: INestApplication;
  let server;
  let apiService: MockApiService;

  beforeEach(async () => {
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
        }
      ],
    }).compile();

    apiService = moduleFixture.get<ApiService>(ApiService) as unknown as MockApiService;
    
    app = moduleFixture.createNestApplication();
    
    // Add interceptor to handle additional headers in errors
    app.use((req, res, next) => {
      const originalSend = res.send;
      res.send = function(body) {
        try {
          const bodyObj = typeof body === 'string' ? JSON.parse(body) : body;
          
          // Check if this is an error response with headers
          if (bodyObj && bodyObj.statusCode >= 400 && bodyObj.headers) {
            Object.entries(bodyObj.headers).forEach(([key, value]) => {
              res.setHeader(key, value as string);
            });
          }
          
          // If this is a nestjs error with our custom structure
          if (bodyObj && bodyObj.statusCode >= 400 && bodyObj.error && bodyObj.message) {
            const error = bodyObj;
            if (error.headers) {
              Object.entries(error.headers).forEach(([key, value]) => {
                res.setHeader(key, value as string);
              });
            }
          }
        } catch (e) {
          // In case body isn't valid JSON or has unexpected structure
          console.log('Error in middleware:', e);
        }
        
        return originalSend.call(this, body);
      };
      next();
    });
    
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Error Notifications', () => {
    it('should provide user-friendly error messages', async () => {
      apiService.configureFeedback({ showErrorMessage: true });
      
      const response = await request(server)
        .post('/api/keys')
        .send({ name: '' })
        .expect(HttpStatus.BAD_REQUEST);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('API key name is required');
      
      // Verify error notification was tracked
      const stats = apiService.getInteractionStats();
      expect(stats.errorMessagesShown).toBeGreaterThan(0);
    });

    it('should include error codes for troubleshooting', async () => {
      apiService.configureFeedback({ 
        showErrorMessage: true,
        includeErrorCode: true 
      });
      
      const response = await request(server)
        .post('/api/keys')
        .send({ name: '' });
      
      expect(response.body).toHaveProperty('errorCode');
      expect(response.body.errorCode).toBe('INVALID_NAME');
    });
    
    it('should include helpful links for error resolution', async () => {
      apiService.configureFeedback({ 
        showErrorMessage: true,
        includeErrorCode: true,
        includeHelpLink: true 
      });
      
      const response = await request(server)
        .post('/api/keys')
        .send({ name: '' });
      
      expect(response.body).toHaveProperty('helpLink');
      expect(response.body.helpLink).toContain('https://api-docs.example.com/errors/');
    });
  });

  describe('Recovery Flows', () => {
    it('should provide recovery steps for validation errors', async () => {
      apiService.configureFeedback({ 
        showErrorMessage: true,
        includeRecoverySteps: true 
      });
      
      const response = await request(server)
        .get('/api/validate')
        .set('x-api-key', 'invalid-key');
      
      expect(response.body).toHaveProperty('recoverySteps');
      expect(response.body.recoverySteps).toBeInstanceOf(Array);
      expect(response.body.recoverySteps.length).toBeGreaterThan(0);
      
      // Verify recovery paths were offered
      const stats = apiService.getInteractionStats();
      expect(stats.recoveryPathsOffered).toBeGreaterThan(0);
    });
    
    it('should provide context-specific recovery steps for different errors', async () => {
      apiService.configureFeedback({ 
        showErrorMessage: true,
        includeRecoverySteps: true 
      });
      
      // Test expired key scenario
      const expiredResponse = await request(server)
        .get('/api/validate')
        .set('x-api-key', 'expired-key');
      
      expect(expiredResponse.body.recoverySteps).toContain('Generate a new API key');
      
      // Test insufficient permissions scenario
      const permissionResponse = await request(server)
        .get('/api/validate')
        .set('x-api-key', 'insufficient-permissions');
      
      expect(permissionResponse.body.recoverySteps).toContain('Use an API key with appropriate permissions');
    });

    it('should provide upgrading as a recovery option for rate limiting', async () => {
      apiService.configureFeedback({ 
        showErrorMessage: true,
        includeRecoverySteps: true 
      });
      
      const response = await request(server)
        .get('/api/check-rate-limit')
        .set('x-api-key', 'rate-limited');
      
      // Verify the error message contains rate limit information
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Rate limit exceeded');
      
      // Check for recovery steps in the response
      expect(response.body).toHaveProperty('recoverySteps');
      expect(response.body.recoverySteps).toContain('Reduce request frequency');
      expect(response.body.recoverySteps).toContain('Implement backoff strategy');
      expect(response.body.recoverySteps).toContain('Upgrade to a higher tier for increased limits');
      
      // Verify the error code is provided
      expect(response.body).toHaveProperty('errorCode');
      expect(response.body.errorCode).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('User Guidance', () => {
    it('should provide actionable steps in error messages', async () => {
      apiService.configureFeedback({ 
        showErrorMessage: true,
        includeRecoverySteps: true 
      });
      
      const response = await request(server)
        .post('/api/keys')
        .send({ name: '' });
      
      expect(response.body.recoverySteps).toContain('Provide a descriptive name for your API key');
    });
    
    it('should track user interactions with guidance features', async () => {
      // Simulate a user clicking a help link
      apiService.trackHelpLinkClicked();
      
      // Verify tracking
      const stats = apiService.getInteractionStats();
      expect(stats.helpLinksClicked).toBe(1);
    });
    
    it('should provide guidance consistent with documentation', async () => {
      apiService.configureFeedback({ 
        showErrorMessage: true,
        includeErrorCode: true,
        includeHelpLink: true
      });
      
      const response = await request(server)
        .get('/api/validate')
        .set('x-api-key', 'invalid-key');
      
      // Help link should reference the error code for consistency
      expect(response.body.helpLink).toContain(response.body.errorCode);
    });
  });
}); 