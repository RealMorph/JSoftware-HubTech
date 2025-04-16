import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ApiKeyUnauthorizedException, ApiKeyForbiddenException } from './exceptions/api-exceptions';
import { CacheService } from '../cache/cache.service';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  permissions: string[];
  tier: 'standard' | 'premium';
  createdAt: Date;
  lastUsed: Date;
}

@Injectable()
export class ApiService {
  private users = [
    { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  // In a real application, these would be stored in a database
  private apiKeys: ApiKey[] = [];

  constructor(
    private readonly cacheService: CacheService
  ) {}

  getUsers() {
    return this.users;
  }

  getUserById(id: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  createUser(userData: any) {
    const newUser = {
      id: `user-${uuidv4()}`,
      name: userData.name,
      email: userData.email,
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, userData: any) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    const updatedUser = {
      ...this.users[userIndex],
      ...userData,
      id, // Ensure ID doesn't change
    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  deleteUser(id: string) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    
    return {
      message: `User with ID ${id} has been deleted`,
      deleted: deletedUser
    };
  }

  async getApiKeys() {
    return this.apiKeys;
  }

  async generateApiKey(name: string, permissions: string[] = ['read'], tier: 'standard' | 'premium' = 'standard') {
    // Generate a unique API key
    const key = `${uuidv4()}-${uuidv4()}`.replace(/-/g, '');
    
    const apiKey: ApiKey = {
      id: uuidv4(),
      key,
      name,
      permissions,
      tier,
      createdAt: new Date(),
      lastUsed: new Date()
    };
    
    this.apiKeys.push(apiKey);

    // Invalidate any cached API key lists
    await this.cacheService.delByPattern('api-keys:');
    
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

  async revokeApiKey(keyId: string) {
    const index = this.apiKeys.findIndex(k => k.id === keyId);
    
    if (index === -1) {
      throw new NotFoundException('API key not found');
    }
    
    // Remove the API key
    const removedKey = this.apiKeys.splice(index, 1)[0];

    // Invalidate cache for this API key
    await this.cacheService.del(`api-key:${removedKey.key}`);
    await this.cacheService.delByPattern('api-keys:');
    
    return { success: true };
  }

  async validateApiKey(key: string, requiredPermission?: string): Promise<ApiKey> {
    // Try to get from cache first
    const cacheKey = `api-key:${key}`;
    const cachedApiKey = await this.cacheService.get<ApiKey>(cacheKey);
    
    if (cachedApiKey) {
      // Update last used timestamp locally
      cachedApiKey.lastUsed = new Date();
      
      // Check for required permission
      if (requiredPermission && !cachedApiKey.permissions.includes(requiredPermission)) {
        throw new ApiKeyForbiddenException(requiredPermission);
      }
      
      return cachedApiKey;
    }
    
    // If not in cache, check database
    const apiKey = this.apiKeys.find(k => k.key === key);
    
    if (!apiKey) {
      throw new ApiKeyUnauthorizedException();
    }
    
    // Update last used timestamp
    apiKey.lastUsed = new Date();
    
    // Check for required permission
    if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
      throw new ApiKeyForbiddenException(requiredPermission);
    }
    
    // Cache the API key for faster validation next time (10 minutes TTL)
    await this.cacheService.set(cacheKey, apiKey, 600);
    
    return apiKey;
  }

  async getApiKeyInfo(key: string) {
    // Try to get from cache first
    const cacheKey = `api-key-info:${key}`;
    const cachedInfo = await this.cacheService.get(cacheKey);
    
    if (cachedInfo) {
      return cachedInfo;
    }
    
    const apiKey = await this.validateApiKey(key);
    
    const info = {
      id: apiKey.id,
      name: apiKey.name,
      permissions: apiKey.permissions,
      tier: apiKey.tier,
      createdAt: apiKey.createdAt,
      lastUsed: apiKey.lastUsed
    };
    
    // Cache the info for 5 minutes
    await this.cacheService.set(cacheKey, info, 300);
    
    return info;
  }

  listApiKeys(): Omit<ApiKey, 'key'>[] {
    return this.apiKeys.map(({ key, ...rest }) => rest);
  }

  updateApiKey(id: string, updates: Partial<Pick<ApiKey, 'name' | 'permissions' | 'tier'>>): Omit<ApiKey, 'key'> {
    const apiKeyIndex = this.apiKeys.findIndex(k => k.id === id);
    
    if (apiKeyIndex === -1) {
      throw new ApiKeyUnauthorizedException();
    }
    
    this.apiKeys[apiKeyIndex] = {
      ...this.apiKeys[apiKeyIndex],
      ...updates
    };
    
    const { key, ...apiKeyInfo } = this.apiKeys[apiKeyIndex];
    return apiKeyInfo;
  }

  // Rate limit related methods
  async getRateLimitForTier(tier: 'standard' | 'premium'): Promise<number> {
    // Check cache first for rate limit configuration
    const cacheKey = `rate-limit:config:${tier}`;
    const cachedLimit = await this.cacheService.get<number>(cacheKey);
    
    if (cachedLimit) {
      return cachedLimit;
    }
    
    // If not in cache, use default values
    const limit = tier === 'premium' ? 100 : 10;
    
    // Cache the rate limit for 1 hour
    await this.cacheService.set(cacheKey, limit, 3600);
    
    return limit;
  }
  
  async trackRateLimitUsage(apiKey: string): Promise<void> {
    const cacheKey = `rate-limit:usage:${apiKey}`;
    let usage = await this.cacheService.get<number>(cacheKey) || 0;
    
    // Increment usage
    usage++;
    
    // Store with a TTL of 60 seconds (sliding window of 1 minute)
    await this.cacheService.set(cacheKey, usage, 60);
  }
  
  async getRateLimitUsage(apiKey: string): Promise<number> {
    const cacheKey = `rate-limit:usage:${apiKey}`;
    return await this.cacheService.get<number>(cacheKey) || 0;
  }
  
  async checkRateLimit(apiKey: string): Promise<{ allowed: boolean; limit: number; current: number }> {
    // Validate the API key first
    const apiKeyData = await this.validateApiKey(apiKey);
    
    // Get the rate limit for this tier
    const limit = await this.getRateLimitForTier(apiKeyData.tier);
    
    // Get current usage
    const current = await this.getRateLimitUsage(apiKey);
    
    // Check if limit is exceeded
    const allowed = current < limit;
    
    return { allowed, limit, current };
  }
} 