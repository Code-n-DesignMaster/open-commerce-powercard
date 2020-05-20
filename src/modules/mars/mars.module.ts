import { Module } from '@nestjs/common';
import { ConfigModule } from '@open-commerce/nestjs-config';
import { config } from '../../config/config';
import { marsProviders } from './mars.providers';
import { MARS_API_TOKEN } from './mars.constants';
import { MarsCachingModule } from '../mars-caching/mars-caching.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule, MarsCachingModule, ConfigModule.forRoot(config)],
  providers: [...marsProviders],
  exports: [MARS_API_TOKEN],
})
export class MarsModule {}
