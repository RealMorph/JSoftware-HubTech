"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiModule = void 0;
const common_1 = require("@nestjs/common");
const api_controller_1 = require("./api.controller");
const api_service_1 = require("./api.service");
const auth_service_1 = require("../auth/auth.service");
const nestjs_rate_limiter_1 = require("nestjs-rate-limiter");
const guards_module_1 = require("./guards/guards.module");
const core_1 = require("@nestjs/core");
const nestjs_rate_limiter_2 = require("nestjs-rate-limiter");
const api_exception_filter_1 = require("./filters/api-exception.filter");
let ApiModule = class ApiModule {
};
exports.ApiModule = ApiModule;
exports.ApiModule = ApiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_rate_limiter_1.RateLimiterModule.register({
                keyPrefix: 'global',
                points: 100,
                duration: 60,
                blockDuration: 60,
            }),
            guards_module_1.GuardsModule,
        ],
        controllers: [api_controller_1.ApiController],
        providers: [
            api_service_1.ApiService,
            auth_service_1.AuthService,
            {
                provide: core_1.APP_GUARD,
                useClass: nestjs_rate_limiter_2.RateLimiterGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: api_exception_filter_1.ApiExceptionFilter,
            }
        ],
        exports: [api_service_1.ApiService],
    })
], ApiModule);
//# sourceMappingURL=api.module.js.map