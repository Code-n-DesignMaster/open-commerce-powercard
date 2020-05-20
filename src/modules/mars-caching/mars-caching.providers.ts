import { CONFIG_TOKEN } from '@open-commerce/nestjs-config';
import {
  ENABLE_CONFIG_LOGGING,
  MARS_CACHING_SERVICE_CONFIG,
  PAY_ANYWHERE_CONFIG,
} from '../../config/config.constants';
import { ISchemaConfig } from '../../config/config.interface';

export const marsCachingProviders = [
  {
    provide: MARS_CACHING_SERVICE_CONFIG,
    useFactory: (config: ISchemaConfig) => config.marsCaching,
    inject: [CONFIG_TOKEN],
  },
  {
    provide: ENABLE_CONFIG_LOGGING,
    useFactory: config => {
      return config.enableConfigLogging;
    },
    inject: [CONFIG_TOKEN],
  },
  {
    provide: PAY_ANYWHERE_CONFIG,
    useFactory: (config: ISchemaConfig) => config.payAnywhere,
    inject: [CONFIG_TOKEN],
  },
];
