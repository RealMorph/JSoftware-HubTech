import { ApiService } from './api.service';
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
export declare class ApiController {
    private readonly apiService;
    constructor(apiService: ApiService);
    generateApiKey(apiKeyDto: ApiKeyDTO): Promise<{
        success: boolean;
        apiKey: {
            id: string;
            key: string;
            name: string;
            permissions: string[];
            tier: "standard" | "premium";
            createdAt: Date;
        };
    }>;
    getApiKeys(): Promise<ApiKey[]>;
    getApiKeyInfo(key: string): Promise<unknown>;
    revokeApiKey(keyId: string): Promise<{
        success: boolean;
    }>;
    validateApiKey(apiKey: string, requiredPermission?: string): Promise<ApiKeyValidationResult>;
    checkRateLimit(apiKey: string): Promise<{
        allowed: boolean;
        limit: number;
        current: number;
    }>;
    trackApiUsage(apiKey: string): Promise<{
        success: boolean;
    }>;
    getProtectedResources(): {
        message: string;
        timestamp: string;
    };
    createProtectedResource(data: any): {
        message: string;
        resourceId: number;
        data: any;
    };
}
export {};
