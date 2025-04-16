import { Reflector } from '@nestjs/core';
import { ExecutionContext, CanActivate } from '@nestjs/common';
import { RateLimiterAbstract } from 'rate-limiter-flexible';
import { RateLimiterOptions } from './rate-limiter.interface';
export declare class RateLimiterGuard implements CanActivate {
    private options;
    private readonly reflector;
    private rateLimiters;
    private specificOptions;
    private queueLimiter;
    constructor(options: RateLimiterOptions, reflector: Reflector);
    getRateLimiter(options?: RateLimiterOptions): Promise<RateLimiterAbstract>;
    canActivate(context: ExecutionContext): Promise<boolean>;
    protected getIpFromRequest(request: {
        ip: string;
    }): string;
    private httpHandler;
    private setResponseHeaders;
    private responseHandler;
}
