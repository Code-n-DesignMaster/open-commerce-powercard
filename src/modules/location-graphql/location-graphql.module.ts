import { Module } from '@nestjs/common';
import { LocationModule } from '../location/location.module';
import { LoggerModule } from '../logger/logger.module';
import { LocationResolver } from './location-graphql.resolver';

@Module({
  imports: [LoggerModule, LocationModule],
  providers: [LocationResolver],
  exports: [],
})
export class LocationGraphqlModule {}
