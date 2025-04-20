import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ApiModule } from './api/api.module';
import { RateLimiterModule, RateLimiterGuard } from 'nestjs-rate-limiter';
import { APP_GUARD } from '@nestjs/core';
import { AppCacheModule } from './cache/cache.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    AuthModule, 
    ProjectsModule, 
    SubscriptionModule, 
    ApiModule,
    AppCacheModule,
    WebsocketModule,
    RateLimiterModule.register({
      keyPrefix: 'global',
      points: 100,
      duration: 60,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {} 