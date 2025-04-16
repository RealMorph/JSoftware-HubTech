import { Controller, Get, Post, Body, Headers, UseGuards, Delete, Param, Put, HttpStatus, HttpCode, Patch, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { RateLimit } from 'nestjs-rate-limiter';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ApiService } from './api.service';

// Define interfaces for the controller
interface ApiKeyDTO {
  name: string;
  permissions?: string[];
  tier?: 'standard' | 'premium';
}

interface ApiKey {
  id: string;
  key: string;
  name: string;
  permissions: string[];
  tier: 'standard' | 'premium';
  createdAt: Date;
  lastUsed: Date;
}

interface ApiKeyValidationResult {
  valid: boolean;
  permissions: string[];
  tier: 'standard' | 'premium';
}

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('keys')
  async generateApiKey(@Body() apiKeyDto: ApiKeyDTO) {
    return this.apiService.generateApiKey(
      apiKeyDto.name, 
      apiKeyDto.permissions, 
      apiKeyDto.tier
    );
  }

  @Get('keys')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30) // Cache for 30 seconds
  async getApiKeys(): Promise<ApiKey[]> {
    const keys = await this.apiService.getApiKeys();
    return keys;
  }

  @Get('keys/:key')
  async getApiKeyInfo(@Param('key') key: string) {
    return this.apiService.getApiKeyInfo(key);
  }

  @Delete('keys/:keyId')
  async revokeApiKey(@Param('keyId') keyId: string) {
    return this.apiService.revokeApiKey(keyId);
  }

  @Get('validate')
  async validateApiKey(
    @Headers('x-api-key') apiKey: string,
    @Headers('x-required-permission') requiredPermission?: string
  ): Promise<ApiKeyValidationResult> {
    const validatedKey = await this.apiService.validateApiKey(apiKey, requiredPermission);
    return { 
      valid: true, 
      permissions: validatedKey.permissions,
      tier: validatedKey.tier
    };
  }

  @Get('check-rate-limit')
  async checkRateLimit(@Headers('x-api-key') apiKey: string) {
    return this.apiService.checkRateLimit(apiKey);
  }

  @Post('rate-limit/track')
  @HttpCode(HttpStatus.OK)
  async trackApiUsage(@Headers('x-api-key') apiKey: string) {
    await this.apiService.trackRateLimitUsage(apiKey);
    return { success: true };
  }

  // Protected resources requiring API key
  @Get('resources')
  @UseGuards(ApiKeyGuard)
  @RateLimit({ points: 100, duration: 60 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // Cache for 5 minutes
  getProtectedResources() {
    return { 
      message: 'This is a protected resource', 
      timestamp: new Date().toISOString()
    };
  }

  @Post('resources')
  @UseGuards(ApiKeyGuard)
  @RateLimit({ points: 50, duration: 60 })
  createProtectedResource(@Body() data: any) {
    return { 
      message: 'Resource created successfully', 
      resourceId: Math.floor(Math.random() * 1000),
      data
    };
  }
} 