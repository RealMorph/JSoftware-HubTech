import { DynamicModule } from '@nestjs/common';
import { RateLimiterOptions, RateLimiterModuleAsyncOptions } from './rate-limiter.interface';
export declare class RateLimiterModule {
    static register(options?: RateLimiterOptions): DynamicModule;
    static registerAsync(options: RateLimiterModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
}
