import { Module } from '@nestjs/common';
import { BrandResolver } from './brand-graphql.resolver';
import { BrandModule } from '../brand/brand.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule, BrandModule],
  providers: [BrandResolver],
  exports: [],
})
export class BrandGraphqlModule {}
