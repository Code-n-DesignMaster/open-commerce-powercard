import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { AdminService } from '../admin/admin.service';
import { ADMIN_SERVICE_TOKEN } from '../admin/admin.constants';
import { Inject } from '@nestjs/common';
import {
  IFeaturesResponse,
  GeoLocationCreateDto,
  IFeatureEnabledResponse,
} from '@open-commerce/data-objects';

@Resolver('AdminResolver')
export class AdminResolver {
  constructor(
    @Inject(ADMIN_SERVICE_TOKEN) private readonly adminService: AdminService,
  ) {}

  @Query('adminFeatures')
  public async adminFeatures(): Promise<IFeaturesResponse> {
    return await this.adminService.adminFeatures();
  }

  @Query('adminIsFeatureEnabled')
  public async adminIsFeatureEnabled(
    @Args('name') name: string,
    @Args('storeId') storeId: number,
  ): Promise<boolean> {
    return await this.adminService.adminIsFeatureEnabled(name, storeId);
  }

  @Query('adminIsFeatureEnabledForLatAndLong')
  public async adminIsFeatureEnabledForLatAndLong(
    @Args('name') name: string,
    @Args('geoLocation') geoLocation: GeoLocationCreateDto,
  ): Promise<IFeatureEnabledResponse> {
    return await this.adminService.adminIsFeatureEnabledForLatAndLong(
      name,
      geoLocation,
    );
  }

  @Mutation('adminFeatureEnableForStore')
  public async adminFeatureEnableForStore(
    @Args('name') name: string,
    @Args('enabled') enabled: boolean,
    @Args('storeId') storeId?: number,
  ): Promise<boolean> {
    return await this.adminService.adminFeatureEnableForStore(
      name,
      enabled,
      storeId,
    );
  }
}
