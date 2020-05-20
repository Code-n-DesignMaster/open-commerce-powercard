import { Resolver, Query, Args } from '@nestjs/graphql';
import { LocationFilterDto } from './dto/location-filter.dto';
import { ILocationConnection } from '../location/interfaces/location-connection.interface';
import { LocationService } from '../location/location.service';
import { LoggerService } from '@open-commerce/nestjs-logger';

import { BaseResolver } from '../../resolvers/BaseResolver';
import { LOCATION_SERVICE_TOKEN } from '../location/constants/location.constants';
import { Inject } from '@nestjs/common';

@Resolver('Location')
export class LocationResolver extends BaseResolver {
  constructor(
    readonly logger: LoggerService,
    @Inject(LOCATION_SERVICE_TOKEN)
    private readonly locationService: LocationService,
  ) {
    super(logger);
  }

  @Query('locations')
  public async locations(
    @Args('filter') filter: LocationFilterDto,
  ): Promise<ILocationConnection> {
    this.log('Resolving locations', { filter });

    const locations = await this.locationService.locations(filter);

    this.log('Returning locations', { locations });
    return locations;
  }
}
