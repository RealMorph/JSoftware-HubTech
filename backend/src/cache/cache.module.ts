import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';

@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      max: 1000, // Maximum number of items in cache
      isGlobal: true,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
  controllers: [CacheController],
})
export class AppCacheModule {} 