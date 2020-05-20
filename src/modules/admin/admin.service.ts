import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  Feature,
  GeoLocationDto,
  IFeatureEnabledResponse,
  IFeaturesResponse,
} from '@open-commerce/data-objects';
import { IAdminServiceConfig } from '../../config/admin-service-config.interface';
import { ADMIN_SERVICE_CONFIG } from '../../config/config.constants';
import {
  FEATURE_REPOSITORY_TOKEN,
  LOCATION_REPOSITORY_TOKEN,
} from './admin.constants';
import { OCAdminFeatureInvalidStoreError } from './errors/admin-feature-invalid-store.error';
import { LocationService } from '../location/location.service';
import { LOCATION_SERVICE_TOKEN } from '../location/constants/location.constants';
import { LocationFilterDto } from '../location-graphql/dto/location-filter.dto';
import { ILocationEdge } from '../location/interfaces/location-edge.interface';

@Injectable()
export class AdminService {
  constructor(
    @Inject(FEATURE_REPOSITORY_TOKEN)
    private readonly featureRepository: Repository<Feature>,
    @Inject(LOCATION_REPOSITORY_TOKEN)
    private readonly locationRepository: Repository<Location>,
    @Inject(LOCATION_SERVICE_TOKEN)
    private readonly locationService: LocationService,
    @Inject(ADMIN_SERVICE_CONFIG)
    private readonly adminServiceConfig: IAdminServiceConfig,
  ) {}

  public async adminFeatures(): Promise<IFeaturesResponse> {
    // Writing this in raw SQL is actually much easier than doing this through the ORM.
    const featuresAndLocations = await this.featureRepository.query(`
      SELECT * FROM feature f
        INNER JOIN feature_location fl ON fl."featureId" = f.id
        INNER JOIN location l ON fl."locationId" = l.id
    `);

    const featureMap = {};

    // O(feature count x store count)
    featuresAndLocations.forEach((record: any) => {
      const { featureId, locationId, name, description, isEnabled } = record;

      if (!featureMap[featureId]) {
        featureMap[featureId] = {
          name,
          description,
          enabledStoreIds: [],
        };
      }

      if (isEnabled) {
        featureMap[featureId].enabledStoreIds.push(locationId);
      }
    });

    const locations = await this.locationService.locations(
      new LocationFilterDto(),
    );

    const result = {
      features: Object.values(featureMap),
      locations: locations.edges.map((l: ILocationEdge) => l.node),
    };
    return result as IFeaturesResponse;
  }

  public async adminFeatureEnableForStore(
    name: string,
    enabled: boolean,
    storeId?: number,
  ): Promise<boolean> {
    const feature = await this.featureRepository.findOne({ name });

    let query = `
      UPDATE feature_location fl
        SET "isEnabled" = ${enabled}
        WHERE "featureId" = ${feature.id}
    `;

    if (storeId) {
      try {
        await this.locationRepository.findOneOrFail(storeId);
        query += ` AND "locationId" = ${storeId}`;
      } catch (error) {
        throw new OCAdminFeatureInvalidStoreError();
      }
    }

    await this.featureRepository.query(query);

    return true;
  }

  public async adminIsFeatureEnabled(
    name: string,
    storeId: number,
  ): Promise<boolean> {
    const result = await this.featureRepository.query(`
     SELECT * FROM feature f
       INNER JOIN feature_location fl ON fl."featureId" = f.id
       WHERE fl."locationId" = ${storeId}
        AND f.name = '${name}';
   `);

    if (!result.length) {
      throw new OCAdminFeatureInvalidStoreError();
    }

    return result[0].isEnabled;
  }

  public async adminIsFeatureEnabledForLatAndLong(
    name: string,
    geoLocation: GeoLocationDto,
  ): Promise<IFeatureEnabledResponse> {
    // Get store ID by locating nearest store within 500 meters
    const radiusMiles =
      this.adminServiceConfig.storeGeolocationRadiusMeters * 0.000621371;

    // Get list of locations, include lat and long, order by distance
    const response = await this.locationService.locations(
      {
        geoLocationEquals: geoLocation,
        radius: radiusMiles,
      } as LocationFilterDto,
      true,
    );
    const locations = response.edges.map(e => e.node);

    if (locations.length === 0) {
      return {
        isEnabled: false,
      } as IFeatureEnabledResponse;
    }

    const storeId = +locations[0].brandSpecificLocationId;
    const isEnabled = await this.adminIsFeatureEnabled(name, storeId);
    const { address, distance } = locations[0];

    return {
      isEnabled,
      storeId,
      distance: distance * 1609.34,
      address,
    };
  }
}
