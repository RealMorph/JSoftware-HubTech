"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const api_exceptions_1 = require("./exceptions/api-exceptions");
const cache_service_1 = require("../cache/cache.service");
let ApiService = class ApiService {
    constructor(cacheService) {
        this.cacheService = cacheService;
        this.users = [
            { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
            { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
            { id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com' },
        ];
        this.apiKeys = [];
    }
    getUsers() {
        return this.users;
    }
    getUserById(id) {
        const user = this.users.find(u => u.id === id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    createUser(userData) {
        const newUser = {
            id: `user-${(0, uuid_1.v4)()}`,
            name: userData.name,
            email: userData.email,
        };
        this.users.push(newUser);
        return newUser;
    }
    updateUser(id, userData) {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const updatedUser = Object.assign(Object.assign(Object.assign({}, this.users[userIndex]), userData), { id });
        this.users[userIndex] = updatedUser;
        return updatedUser;
    }
    deleteUser(id) {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
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
    async generateApiKey(name, permissions = ['read'], tier = 'standard') {
        const key = `${(0, uuid_1.v4)()}-${(0, uuid_1.v4)()}`.replace(/-/g, '');
        const apiKey = {
            id: (0, uuid_1.v4)(),
            key,
            name,
            permissions,
            tier,
            createdAt: new Date(),
            lastUsed: new Date()
        };
        this.apiKeys.push(apiKey);
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
    async revokeApiKey(keyId) {
        const index = this.apiKeys.findIndex(k => k.id === keyId);
        if (index === -1) {
            throw new common_1.NotFoundException('API key not found');
        }
        const removedKey = this.apiKeys.splice(index, 1)[0];
        await this.cacheService.del(`api-key:${removedKey.key}`);
        await this.cacheService.delByPattern('api-keys:');
        return { success: true };
    }
    async validateApiKey(key, requiredPermission) {
        const cacheKey = `api-key:${key}`;
        const cachedApiKey = await this.cacheService.get(cacheKey);
        if (cachedApiKey) {
            cachedApiKey.lastUsed = new Date();
            if (requiredPermission && !cachedApiKey.permissions.includes(requiredPermission)) {
                throw new api_exceptions_1.ApiKeyForbiddenException(requiredPermission);
            }
            return cachedApiKey;
        }
        const apiKey = this.apiKeys.find(k => k.key === key);
        if (!apiKey) {
            throw new api_exceptions_1.ApiKeyUnauthorizedException();
        }
        apiKey.lastUsed = new Date();
        if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
            throw new api_exceptions_1.ApiKeyForbiddenException(requiredPermission);
        }
        await this.cacheService.set(cacheKey, apiKey, 600);
        return apiKey;
    }
    async getApiKeyInfo(key) {
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
        await this.cacheService.set(cacheKey, info, 300);
        return info;
    }
    listApiKeys() {
        return this.apiKeys.map((_a) => {
            var { key } = _a, rest = __rest(_a, ["key"]);
            return rest;
        });
    }
    updateApiKey(id, updates) {
        const apiKeyIndex = this.apiKeys.findIndex(k => k.id === id);
        if (apiKeyIndex === -1) {
            throw new api_exceptions_1.ApiKeyUnauthorizedException();
        }
        this.apiKeys[apiKeyIndex] = Object.assign(Object.assign({}, this.apiKeys[apiKeyIndex]), updates);
        const _a = this.apiKeys[apiKeyIndex], { key } = _a, apiKeyInfo = __rest(_a, ["key"]);
        return apiKeyInfo;
    }
    async getRateLimitForTier(tier) {
        const cacheKey = `rate-limit:config:${tier}`;
        const cachedLimit = await this.cacheService.get(cacheKey);
        if (cachedLimit) {
            return cachedLimit;
        }
        const limit = tier === 'premium' ? 100 : 10;
        await this.cacheService.set(cacheKey, limit, 3600);
        return limit;
    }
    async trackRateLimitUsage(apiKey) {
        const cacheKey = `rate-limit:usage:${apiKey}`;
        let usage = await this.cacheService.get(cacheKey) || 0;
        usage++;
        await this.cacheService.set(cacheKey, usage, 60);
    }
    async getRateLimitUsage(apiKey) {
        const cacheKey = `rate-limit:usage:${apiKey}`;
        return await this.cacheService.get(cacheKey) || 0;
    }
    async checkRateLimit(apiKey) {
        const apiKeyData = await this.validateApiKey(apiKey);
        const limit = await this.getRateLimitForTier(apiKeyData.tier);
        const current = await this.getRateLimitUsage(apiKey);
        const allowed = current < limit;
        return { allowed, limit, current };
    }
};
exports.ApiService = ApiService;
exports.ApiService = ApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_service_1.CacheService])
], ApiService);
//# sourceMappingURL=api.service.js.map