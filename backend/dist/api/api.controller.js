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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const nestjs_rate_limiter_1 = require("nestjs-rate-limiter");
const api_key_guard_1 = require("./guards/api-key.guard");
const api_service_1 = require("./api.service");
let ApiController = class ApiController {
    constructor(apiService) {
        this.apiService = apiService;
    }
    async generateApiKey(apiKeyDto) {
        return this.apiService.generateApiKey(apiKeyDto.name, apiKeyDto.permissions, apiKeyDto.tier);
    }
    async getApiKeys() {
        const keys = await this.apiService.getApiKeys();
        return keys;
    }
    async getApiKeyInfo(key) {
        return this.apiService.getApiKeyInfo(key);
    }
    async revokeApiKey(keyId) {
        return this.apiService.revokeApiKey(keyId);
    }
    async validateApiKey(apiKey, requiredPermission) {
        const validatedKey = await this.apiService.validateApiKey(apiKey, requiredPermission);
        return {
            valid: true,
            permissions: validatedKey.permissions,
            tier: validatedKey.tier
        };
    }
    async checkRateLimit(apiKey) {
        return this.apiService.checkRateLimit(apiKey);
    }
    async trackApiUsage(apiKey) {
        await this.apiService.trackRateLimitUsage(apiKey);
        return { success: true };
    }
    getProtectedResources() {
        return {
            message: 'This is a protected resource',
            timestamp: new Date().toISOString()
        };
    }
    createProtectedResource(data) {
        return {
            message: 'Resource created successfully',
            resourceId: Math.floor(Math.random() * 1000),
            data
        };
    }
};
exports.ApiController = ApiController;
__decorate([
    (0, common_1.Post)('keys'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "generateApiKey", null);
__decorate([
    (0, common_1.Get)('keys'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, cache_manager_1.CacheTTL)(30),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "getApiKeys", null);
__decorate([
    (0, common_1.Get)('keys/:key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "getApiKeyInfo", null);
__decorate([
    (0, common_1.Delete)('keys/:keyId'),
    __param(0, (0, common_1.Param)('keyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "revokeApiKey", null);
__decorate([
    (0, common_1.Get)('validate'),
    __param(0, (0, common_1.Headers)('x-api-key')),
    __param(1, (0, common_1.Headers)('x-required-permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "validateApiKey", null);
__decorate([
    (0, common_1.Get)('check-rate-limit'),
    __param(0, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "checkRateLimit", null);
__decorate([
    (0, common_1.Post)('rate-limit/track'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "trackApiUsage", null);
__decorate([
    (0, common_1.Get)('resources'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, nestjs_rate_limiter_1.RateLimit)({ points: 100, duration: 60 }),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, cache_manager_1.CacheTTL)(300),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getProtectedResources", null);
__decorate([
    (0, common_1.Post)('resources'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, nestjs_rate_limiter_1.RateLimit)({ points: 50, duration: 60 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "createProtectedResource", null);
exports.ApiController = ApiController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [api_service_1.ApiService])
], ApiController);
//# sourceMappingURL=api.controller.js.map