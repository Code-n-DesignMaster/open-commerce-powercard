import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { RedisModule } from '@open-commerce/nestjs-redis';
import { CONFIG_TOKEN, ConfigModule } from '@open-commerce/nestjs-config';
import { config } from '../../config/config';
import { marsCachingProviders } from './mars-caching.providers';
import { MarsCachingService } from './mars-caching.service';

const configModule = ConfigModule.forRoot(config);

@Module({
  imports: [
    LoggerModule,
    RedisModule.forRootAsync({
      imports: [configModule],
      useFactory: config => config.redis,
      inject: [CONFIG_TOKEN],
    }),
    ConfigModule.forRoot(config),
  ],
  providers: [MarsCachingService, ...marsCachingProviders],
  exports: [MarsCachingService],
})
export class MarsCachingModule {}
