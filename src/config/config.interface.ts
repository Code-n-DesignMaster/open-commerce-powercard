import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { GqlModuleOptions } from '@nestjs/graphql';
import { TerminusEndpoint } from '@nestjs/terminus';
import { IAdminServiceConfig } from './admin-service-config.interface';
import { IMarsCachingConfig } from './mars-caching-config.interface';
import { IMarsConfig } from './mars-config.interface';
import { IPayAnywhereConfig } from './pay-anywhere-config.interface';
import { IPowercardBalancesServiceConfig } from './powercard-balances-service-config.interface';
import { IPowercardServiceConfig } from './powercard-service-config.interface';

export interface ISchemaConfig {
  port: number;
  enableConfigLogging: boolean;
  powercardBalancesService: IPowercardBalancesServiceConfig;
  database: TypeOrmModuleOptions;
  graphql: GqlModuleOptions;
  terminus: TerminusEndpoint[];
  mars: IMarsConfig;
  marsCaching: IMarsCachingConfig;
  powercard: IPowercardServiceConfig;
  payAnywhere: IPayAnywhereConfig;
  admin: IAdminServiceConfig;
}
