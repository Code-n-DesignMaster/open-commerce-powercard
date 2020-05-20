import { CONFIG_TOKEN } from '@open-commerce/nestjs-config';
import {
  ENABLE_CONFIG_LOGGING,
  POWERCARD_BALANCES_SERVICE_CONFIG,
} from '../../config/config.constants';

export const powercardBalancesProviders = [
  {
    provide: POWERCARD_BALANCES_SERVICE_CONFIG,
    useFactory: config => {
      return config.powercardBalancesService;
    },
    inject: [CONFIG_TOKEN],
  },
  {
    provide: ENABLE_CONFIG_LOGGING,
    useFactory: config => {
      return config.enableConfigLogging;
    },
    inject: [CONFIG_TOKEN],
  },
];
