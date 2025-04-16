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
export declare class ApiService {
    private readonly cacheService;
    private users;
    private apiKeys;
    constructor(cacheService: CacheService);
    getUsers(): {
        id: string;
        name: string;
        email: string;
    }[];
    getUserById(id: string): {
        id: string;
        name: string;
        email: string;
    };
    createUser(userData: any): {
        id: string;
        name: any;
        email: any;
    };
    updateUser(id: string, userData: any): any;
    deleteUser(id: string): {
        message: string;
        deleted: {
            id: string;
            name: string;
            email: string;
        };
    };
    getApiKeys(): Promise<ApiKey[]>;
    generateApiKey(name: string, permissions?: string[], tier?: 'standard' | 'premium'): Promise<{
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
    revokeApiKey(keyId: string): Promise<{
        success: boolean;
    }>;
    validateApiKey(key: string, requiredPermission?: string): Promise<ApiKey>;
    getApiKeyInfo(key: string): Promise<unknown>;
    listApiKeys(): Omit<ApiKey, 'key'>[];
    updateApiKey(id: string, updates: Partial<Pick<ApiKey, 'name' | 'permissions' | 'tier'>>): Omit<ApiKey, 'key'>;
    getRateLimitForTier(tier: 'standard' | 'premium'): Promise<number>;
    trackRateLimitUsage(apiKey: string): Promise<void>;
    getRateLimitUsage(apiKey: string): Promise<number>;
    checkRateLimit(apiKey: string): Promise<{
        allowed: boolean;
        limit: number;
        current: number;
    }>;
}
export {};
