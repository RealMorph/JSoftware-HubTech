"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const projects_module_1 = require("./projects/projects.module");
const subscription_module_1 = require("./subscription/subscription.module");
const api_module_1 = require("./api/api.module");
const nestjs_rate_limiter_1 = require("nestjs-rate-limiter");
const core_1 = require("@nestjs/core");
const cache_module_1 = require("./cache/cache.module");
const websocket_module_1 = require("./websocket/websocket.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            projects_module_1.ProjectsModule,
            subscription_module_1.SubscriptionModule,
            api_module_1.ApiModule,
            cache_module_1.AppCacheModule,
            websocket_module_1.WebsocketModule,
            nestjs_rate_limiter_1.RateLimiterModule.register({
                keyPrefix: 'global',
                points: 100,
                duration: 60,
            }),
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: nestjs_rate_limiter_1.RateLimiterGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map