import { HttpException } from '@nestjs/common';
export declare class ApiKeyUnauthorizedException extends HttpException {
    constructor(message?: string);
}
export declare class ApiKeyForbiddenException extends HttpException {
    constructor(missingPermission: string);
}
export declare class RateLimitExceededException extends HttpException {
    constructor(tier?: string, reset?: Date);
}
export declare class InvalidRequestException extends HttpException {
    constructor(message?: string);
}
