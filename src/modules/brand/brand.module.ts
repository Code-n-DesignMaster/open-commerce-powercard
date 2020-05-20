import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { brandProviders } from './brand.providers';
import { DatabaseModule } from '@open-commerce/nestjs-database';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [DatabaseModule.forRootAsync(), LoggerModule],
  providers: [BrandService, ...brandProviders],
  exports: [BrandService],
})
export class BrandModule {}
