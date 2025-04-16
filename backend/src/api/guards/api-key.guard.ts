import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  // Valid API keys - in a real app, these would be stored in a database
  private validApiKeys = ['test-api-key'];
  
  // API key permissions - in a real app, these would be stored in a database
  private apiKeyPermissions = {
    'test-api-key': ['read', 'write']
  };

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    if (!this.validApiKeys.includes(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Store API key for later use in controllers
    request['apiKey'] = apiKey;
    
    return true;
  }

  // Helper method to check if an API key has a specific permission
  hasPermission(apiKey: string, requiredPermission: string): boolean {
    if (!this.validApiKeys.includes(apiKey)) {
      return false;
    }
    
    const permissions = this.apiKeyPermissions[apiKey] || [];
    return permissions.includes(requiredPermission);
  }
} 