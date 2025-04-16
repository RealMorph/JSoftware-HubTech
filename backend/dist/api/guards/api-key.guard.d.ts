import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class ApiKeyGuard implements CanActivate {
    private validApiKeys;
    private apiKeyPermissions;
    canActivate(context: ExecutionContext): Promise<boolean>;
    hasPermission(apiKey: string, requiredPermission: string): boolean;
}
