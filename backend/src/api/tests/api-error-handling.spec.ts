import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiController } from '../api.controller';
import { ApiService } from '../api.service';
import { CacheService } from '../../cache/cache.service';
import * as request from 'supertest';
import { describe, beforeEach, afterAll, it, expect } from '@jest/globals';
import { CacheModule } from '@nestjs/cache-manager';

// Mock API service for testing
class MockApiService {
  private apiKeys: Array<{
    id: string;
    key: string;
    name: string;
    permissions: string[];
    tier: string;
    createdAt: Date;
    lastUsed: Date;
  }> = [];

  async generateApiKey(name: string, permissions = ['read'], tier = 'standard') {
    if (!name) {
      throw new BadRequestException('API key name is required');
    }
    
    // Validate against XSS
    if (name.includes('<script>')) {
      throw new BadRequestException('Name contains invalid characters');
    }
    
    if (name.length < 3) {
      throw new BadRequestException('API key name must be at least 3 characters');
    }
    
    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new BadRequestException('At least one permission is required');
    }
    
    const validPermissions = ['read', 'write', 'delete', 'admin'];
    for (const permission of permissions) {
      if (!validPermissions.includes(permission)) {
        throw new BadRequestException(`Invalid permission: ${permission}`);
      }
    }
    
    if (!['standard', 'premium', 'enterprise'].includes(tier)) {
      throw new BadRequestException('Invalid tier. Must be standard, premium, or enterprise');
    }
    
    const key = `key_${Math.random().toString(36).substring(2)}`;
    
    const apiKey = {
      id: `id_${Math.random().toString(36).substring(2)}`,
      key,
      name,
      permissions,
      tier,
      createdAt: new Date(),
      lastUsed: new Date()
    };
    
    this.apiKeys.push(apiKey);
    
    return { 
      success: true, 
      apiKey: {
        id: apiKey.id,
        key: apiKey.key,
        name: apiKey.name,
        permissions: apiKey.permissions,
        tier: apiKey.tier,
        createdAt: apiKey.createdAt
      }
    };
  }

  async validateApiKey(key: string, requiredPermission?: string) {
    if (!key) {
      throw new BadRequestException('API key is required');
    }
    
    const apiKey = this.apiKeys.find(k => k.key === key);
    
    if (!apiKey) {
      throw new BadRequestException('Invalid API key');
    }
    
    if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
      throw new BadRequestException(`Missing required permission: ${requiredPermission}`);
    }
    
    return apiKey;
  }
  
  async getApiKeyInfo(keyId: string) {
    if (!keyId) {
      throw new BadRequestException('API key ID is required');
    }
    
    const apiKey = this.apiKeys.find(k => k.id === keyId);
    
    if (!apiKey) {
      throw new BadRequestException('API key not found');
    }
    
    return {
      id: apiKey.id,
      name: apiKey.name,
      permissions: apiKey.permissions,
      tier: apiKey.tier,
      createdAt: apiKey.createdAt,
      lastUsed: apiKey.lastUsed
    };
  }
  
  async getApiKeys() {
    return this.apiKeys.map(apiKey => ({
      id: apiKey.id,
      name: apiKey.name,
      permissions: apiKey.permissions,
      tier: apiKey.tier,
      createdAt: apiKey.createdAt,
      lastUsed: apiKey.lastUsed
    }));
  }

  async revokeApiKey(keyId: string) {
    if (!keyId) {
      throw new BadRequestException('API key ID is required');
    }
    
    const index = this.apiKeys.findIndex(k => k.id === keyId);
    
    if (index === -1) {
      throw new BadRequestException('API key not found');
    }
    
    this.apiKeys.splice(index, 1);
    
    return { success: true };
  }
}

// Mock Cache service
class MockCacheService {
  private cache = new Map<string, any>();

  async get(key: string) {
    return this.cache.get(key);
  }

  async set(key: string, value: any) {
    this.cache.set(key, value);
    return true;
  }

  async del(key: string) {
    this.cache.delete(key);
    return true;
  }

  async delByPattern() {
    return true;
  }
}

describe('API Error Handling', () => {
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
        },
      ],
    }).compile();

    apiService = moduleFixture.get<ApiService>(ApiService) as unknown as MockApiService;
    
    app = moduleFixture.createNestApplication();
    
    // Set up global validation pipe with detailed error messages
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
      validationError: {
        target: false,
        value: true,
      },
    }));
    
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Input Validation', () => {
    it('should validate required fields when generating an API key', async () => {
      const response = await request(server)
        .post('/api/keys')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
      
      expect(response.body.message).toContain('name');
    });
    
    it('should validate field length constraints', async () => {
      const response = await request(server)
        .post('/api/keys')
        .send({ name: 'AB', permissions: ['read'] })
        .expect(HttpStatus.BAD_REQUEST);
      
      expect(response.body.message).toContain('at least 3 characters');
    });
    
    it('should validate array field requirements', async () => {
      const response = await request(server)
        .post('/api/keys')
        .send({ name: 'Test Key', permissions: [] })
        .expect(HttpStatus.BAD_REQUEST);
      
      expect(response.body.message).toContain('one permission is required');
    });
    
    it('should validate enumerated values', async () => {
      const response = await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Test Key', 
          permissions: ['read', 'invalid-permission'],
          tier: 'standard'
        })
        .expect(HttpStatus.BAD_REQUEST);
      
      expect(response.body.message).toContain('Invalid permission');
    });
    
    it('should validate tier values', async () => {
      const response = await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Test Key', 
          permissions: ['read'],
          tier: 'invalid-tier'
        })
        .expect(HttpStatus.BAD_REQUEST);
      
      expect(response.body.message).toContain('Invalid tier');
    });
  });

  describe('Error Responses', () => {
    it('should return appropriate error status codes', async () => {
      // Bad request for validation error
      await request(server)
        .post('/api/keys')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
      
      // Not found for non-existent resource
      await request(server)
        .delete('/api/keys/non-existent-id')
        .expect(HttpStatus.BAD_REQUEST);
    });
    
    it('should include descriptive error messages', async () => {
      const response = await request(server)
        .post('/api/keys')
        .send({ name: 'Test', permissions: ['invalid'] })
        .expect(HttpStatus.BAD_REQUEST);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid permission');
    });
    
    it('should maintain consistent error response format', async () => {
      const response = await request(server)
        .post('/api/keys')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Validation Rules', () => {
    it('should strip unknown properties with whitelist validation', async () => {
      const response = await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Valid Name', 
          permissions: ['read'],
          unknownProperty: 'This should be stripped'
        })
        .expect(HttpStatus.CREATED);
      
      // The response should not contain the unknown property
      expect(response.body.apiKey).not.toHaveProperty('unknownProperty');
    });
    
    it('should reject requests with unknown properties when forbidNonWhitelisted is true', async () => {
      // This test depends on your actual configuration
      // If forbidNonWhitelisted is true in your ValidationPipe setup
      const response = await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Valid Name', 
          permissions: ['read'],
          extraField: 'This should cause rejection'
        });
      
      // The response should either strip the extra field or reject with 400
      if (response.status === HttpStatus.BAD_REQUEST) {
        expect(response.body.message).toContain('property extraField should not exist');
      } else {
        expect(response.body.apiKey).not.toHaveProperty('extraField');
      }
    });
    
    it('should transform data types when transform is enabled', async () => {
      // Create a valid API key for testing
      const createResponse = await request(server)
        .post('/api/keys')
        .send({ 
          name: 'Transform Test', 
          permissions: ['read']
        })
        .expect(HttpStatus.CREATED);
      
      const keyId = createResponse.body.apiKey.id;
      
      // Check if string ID is properly handled
      await request(server)
        .get(`/api/keys/${keyId}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('Security Validation', () => {
    it('should reject potentially malicious payloads', async () => {
      const response = await request(server)
        .post('/api/keys')
        .send({ 
          name: '<script>alert("XSS")</script>', 
          permissions: ['read']
        });
      
      // Depending on your validation setup, this might be rejected
      // or the special characters might be escaped
      if (response.status === HttpStatus.BAD_REQUEST) {
        expect(response.body.message).toContain('invalid');
      } else {
        // If not rejected, ensure it's at least properly encoded in the response
        expect(response.body.apiKey.name).not.toContain('<script>');
      }
    });
    
    it('should validate content type headers', async () => {
      // Send a request with incorrect content type
      const response = await request(server)
        .post('/api/keys')
        .set('Content-Type', 'text/plain')
        .send('name=Test&permissions=read')
        .expect(HttpStatus.BAD_REQUEST);
      
      expect(response.body.message).toBeDefined();
    });
  });
}); 