import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { AuthService } from '../auth/auth.service';
import { RateLimiterModule } from 'nestjs-rate-limiter';
import { GuardsModule } from './guards/guards.module';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { RateLimiterGuard } from 'nestjs-rate-limiter';
import { ApiExceptionFilter } from './filters/api-exception.filter';

@Module({
  imports: [
    RateLimiterModule.register({
      // Global rate limiting configuration
      keyPrefix: 'global',
      points: 100, // Maximum number of points per duration
      duration: 60, // Duration in seconds (1 minute)
      blockDuration: 60, // Block for 1 minute if over limit
    }),
    GuardsModule,
  ],
  controllers: [ApiController],
  providers: [
    ApiService, 
    AuthService,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    }
  ],
  exports: [ApiService],
})
export class ApiModule {} 