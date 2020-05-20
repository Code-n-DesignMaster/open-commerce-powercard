import { Module } from '@nestjs/common';
import { MarsModule } from '../mars/mars.module';
import { LoggerModule } from '../logger/logger.module';
import { LocationService } from './location.service';
import {
  LOCATION_SERVICE_TOKEN,
  GEOLIB_TOKEN,
} from '../location/constants/location.constants';
import * as geolib from 'geolib';

@Module({
  imports: [LoggerModule, MarsModule],
  providers: [
    {
      provide: LOCATION_SERVICE_TOKEN,
      useClass: LocationService,
    },
    {
      provide: GEOLIB_TOKEN,
      useValue: geolib,
    },
  ],
  exports: [LOCATION_SERVICE_TOKEN],
})
export class LocationModule {}
