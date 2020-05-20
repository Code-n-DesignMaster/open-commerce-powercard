import { Module } from '@nestjs/common';
import { ConfigModule } from '@open-commerce/nestjs-config';
import { config } from '../../config/config';
import { adminProviders } from './admin.providers';
import { AdminService } from './admin.service';
import {
  ADMIN_SERVICE_TOKEN,
  FEATURE_REPOSITORY_TOKEN,
  FEATURE_LOCATION_REPOSITORY_TOKEN,
  LOCATION_REPOSITORY_TOKEN,
} from './admin.constants';
import { Repository } from 'typeorm';
import {
  Feature,
  FeatureLocation,
  Location,
} from '@open-commerce/data-objects';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feature, FeatureLocation, Location]),
    LocationModule,
    ConfigModule.forRoot(config),
  ],
  providers: [
    ...adminProviders,
    {
      provide: ADMIN_SERVICE_TOKEN,
      useClass: AdminService,
    },
    {
      provide: FEATURE_REPOSITORY_TOKEN,
      useFactory: (repo: Repository<Feature>) => repo,
      inject: [getRepositoryToken(Feature)],
    },
    {
      provide: FEATURE_LOCATION_REPOSITORY_TOKEN,
      useFactory: (repo: Repository<FeatureLocation>) => repo,
      inject: [getRepositoryToken(FeatureLocation)],
    },
    {
      provide: LOCATION_REPOSITORY_TOKEN,
      useFactory: (repo: Repository<Location>) => repo,
      inject: [getRepositoryToken(Location)],
    },
  ],
  exports: [ADMIN_SERVICE_TOKEN],
})
export class AdminModule {}
