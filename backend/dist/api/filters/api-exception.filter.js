"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let ApiExceptionFilter = class ApiExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        const errorResponse = exception.getResponse();
        if (status === common_1.HttpStatus.TOO_MANY_REQUESTS) {
            return response
                .status(status)
                .json({
                statusCode: status,
                message: 'Rate limit exceeded',
                error: 'Too Many Requests',
                throttled: true,
                resetTime: new Date(Date.now() + 60 * 1000).toISOString(),
            });
        }
        if (status === common_1.HttpStatus.UNAUTHORIZED) {
            return response
                .status(status)
                .json({
                statusCode: status,
                message: typeof errorResponse === 'string'
                    ? errorResponse
                    : errorResponse.message || 'Unauthorized',
                error: 'Unauthorized',
                apiKeyValid: false,
            });
        }
        if (status === common_1.HttpStatus.FORBIDDEN) {
            return response
                .status(status)
                .json({
                statusCode: status,
                message: typeof errorResponse === 'string'
                    ? errorResponse
                    : errorResponse.message || 'Forbidden',
                error: 'Forbidden',
                missingPermission: typeof errorResponse === 'string'
                    ? null
                    : errorResponse.permission || null,
            });
        }
        response
            .status(status)
            .json(errorResponse);
    }
};
exports.ApiExceptionFilter = ApiExceptionFilter;
exports.ApiExceptionFilter = ApiExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], ApiExceptionFilter);
//# sourceMappingURL=api-exception.filter.js.map