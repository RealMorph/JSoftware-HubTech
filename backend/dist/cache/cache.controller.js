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
exports.CacheController = void 0;
const common_1 = require("@nestjs/common");
const cache_service_1 = require("./cache.service");
const api_key_guard_1 = require("../api/guards/api-key.guard");
let CacheController = class CacheController {
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    async getStats() {
        return this.cacheService.getStats();
    }
    async resetStats() {
        this.cacheService.resetStats();
        return { success: true, message: 'Cache statistics reset' };
    }
    async clearCache() {
        await this.cacheService.reset();
        return { success: true, message: 'Cache cleared' };
    }
    async invalidateCache(key) {
        await this.cacheService.del(key);
        return { success: true, message: `Cache key '${key}' invalidated` };
    }
    async invalidateCacheByPattern(pattern) {
        await this.cacheService.delByPattern(pattern);
        return { success: true, message: `Cache invalidated by pattern '${pattern}'` };
    }
};
exports.CacheController = CacheController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CacheController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('stats/reset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CacheController.prototype, "resetStats", null);
__decorate([
    (0, common_1.Delete)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CacheController.prototype, "clearCache", null);
__decorate([
    (0, common_1.Delete)(':key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CacheController.prototype, "invalidateCache", null);
__decorate([
    (0, common_1.Delete)('pattern/:pattern'),
    __param(0, (0, common_1.Param)('pattern')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CacheController.prototype, "invalidateCacheByPattern", null);
exports.CacheController = CacheController = __decorate([
    (0, common_1.Controller)('cache'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __metadata("design:paramtypes", [cache_service_1.CacheService])
], CacheController);
//# sourceMappingURL=cache.controller.js.map