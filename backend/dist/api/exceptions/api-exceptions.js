"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidRequestException = exports.RateLimitExceededException = exports.ApiKeyForbiddenException = exports.ApiKeyUnauthorizedException = void 0;
const common_1 = require("@nestjs/common");
class ApiKeyUnauthorizedException extends common_1.HttpException {
    constructor(message = 'Invalid API key') {
        super(message, common_1.HttpStatus.UNAUTHORIZED);
    }
}
exports.ApiKeyUnauthorizedException = ApiKeyUnauthorizedException;
class ApiKeyForbiddenException extends common_1.HttpException {
    constructor(missingPermission) {
        super(`Missing required permission: ${missingPermission}`, common_1.HttpStatus.FORBIDDEN);
    }
}
exports.ApiKeyForbiddenException = ApiKeyForbiddenException;
class RateLimitExceededException extends common_1.HttpException {
    constructor(tier = 'standard', reset = new Date(Date.now() + 60 * 1000)) {
        super({
            message: 'Rate limit exceeded',
            statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
            tier,
            limit: tier === 'premium' ? 20 : 5,
            reset: reset.toISOString(),
        }, common_1.HttpStatus.TOO_MANY_REQUESTS);
    }
}
exports.RateLimitExceededException = RateLimitExceededException;
class InvalidRequestException extends common_1.HttpException {
    constructor(message = 'Invalid request format') {
        super(message, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.InvalidRequestException = InvalidRequestException;
//# sourceMappingURL=api-exceptions.js.map